<?php
include 'db.php';  // Database connection
include 'cors.php'; // CORS handling for frontend-backend communication

// Get raw PUT data (JSON)
$data = json_decode(file_get_contents("php://input"), true);

// Check if the required data exists
if (
  isset($data['id_number']) && isset($data['first_name']) && isset($data['last_name']) &&
  isset($data['email']) && isset($data['role'])
) {
  // Sanitize inputs
  $id_number = $data['id_number'];
  $first_name = $data['first_name'];
  $middle_name = isset($data['middle_name']) ? $data['middle_name'] : '';
  $last_name = $data['last_name'];
  $email = $data['email'];
  $role = $data['role'];
  $address = isset($data['address']) ? $data['address'] : '';

  // Check if password is provided (optional for update)
  $password_update = '';
  if (isset($data['password']) && !empty($data['password'])) {
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    $password_update = ", password = :password";
  }

  try {
    // Prepare the SQL query using PDO
    $sql = "UPDATE users SET 
                id_number = :id_number, 
                first_name = :first_name, 
                middle_name = :middle_name,
                last_name = :last_name, 
                email = :email, 
                role = :role, 
                address = :address
                $password_update
                WHERE id_number = :id_number";

    $stmt = $pdo->prepare($sql);

    // Bind the parameters
    $stmt->bindParam(':id_number', $id_number);
    $stmt->bindParam(':first_name', $first_name);
    $stmt->bindParam(':middle_name', $middle_name);
    $stmt->bindParam(':last_name', $last_name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':role', $role);
    $stmt->bindParam(':address', $address);

    // Bind password if it's being updated
    if (isset($password)) {
      $stmt->bindParam(':password', $password);
    }

    // Execute the query
    $stmt->execute();

    // Check if any row was affected
    if ($stmt->rowCount() > 0) {
      echo json_encode(['status' => 'success', 'message' => 'User updated successfully']);
    } else {
      echo json_encode(['status' => 'error', 'message' => 'No changes made or user not found']);
    }
  } catch (PDOException $e) {
    // Return error message if something goes wrong
    echo json_encode(['status' => 'error', 'message' => 'Failed to update user: ' . $e->getMessage()]);
  }
} else {
  // Missing required parameters
  echo json_encode(['status' => 'error', 'message' => 'Missing required parameters']);
}
