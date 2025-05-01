<?php
include 'db.php';  // Database connection
include 'cors.php'; // CORS handling for frontend-backend communication

// Get raw POST data (JSON)
$data = json_decode(file_get_contents("php://input"), true);

// Check if the required data exists
if (
  isset($data['id_number']) && isset($data['first_name']) && isset($data['last_name']) &&
  isset($data['email']) && isset($data['password']) && isset($data['role'])
) {
  // Sanitize inputs
  $id_number = trim($data['id_number']);
  $first_name = trim($data['first_name']);
  $last_name = trim($data['last_name']);
  $email = trim($data['email']);
  $password = $data['password'];
  $role = trim($data['role']);
  $middle_name = isset($data['middle_name']) ? trim($data['middle_name']) : '';
  $address = isset($data['address']) ? trim($data['address']) : '';

  // Validate required fields
  $errors = [];

  if (empty($id_number)) {
    $errors['id_number'] = 'ID Number is required';
  }

  if (empty($first_name)) {
    $errors['first_name'] = 'First Name is required';
  }

  if (empty($last_name)) {
    $errors['last_name'] = 'Last Name is required';
  }

  if (empty($email)) {
    $errors['email'] = 'Email is required';
  } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Invalid email format';
  }

  if (empty($password)) {
    $errors['password'] = 'Password is required';
  } elseif (strlen($password) < 8) {
    $errors['password'] = 'Password must be at least 8 characters';
  }

  if (empty($role)) {
    $errors['role'] = 'Role is required';
  }

  if (!empty($errors)) {
    echo json_encode(['status' => 'error', 'message' => 'Validation failed', 'errors' => $errors]);
    exit();
  }

  try {
    // Check if the ID Number or Email already exists in the database
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE id_number = :id_number OR email = :email");
    $stmt->bindParam(':id_number', $id_number);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $count = $stmt->fetchColumn();

    if ($count > 0) {
      echo json_encode(['status' => 'error', 'message' => 'ID Number or Email already exists']);
      exit();
    }

    // Hash the password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Prepare the SQL query using PDO
    $stmt = $pdo->prepare("INSERT INTO users (id_number, first_name, middle_name, last_name, email, password, role, address) 
                             VALUES (:id_number, :first_name, :middle_name, :last_name, :email, :password, :role, :address)");

    // Bind the parameters
    $stmt->bindParam(':id_number', $id_number);
    $stmt->bindParam(':first_name', $first_name);
    $stmt->bindParam(':middle_name', $middle_name);
    $stmt->bindParam(':last_name', $last_name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $password_hash);
    $stmt->bindParam(':role', $role);
    $stmt->bindParam(':address', $address);

    // Execute the query
    $stmt->execute();

    // Return success message
    echo json_encode(['status' => 'success', 'message' => 'User registered successfully']);
  } catch (PDOException $e) {
    // Return error message if something goes wrong
    echo json_encode(['status' => 'error', 'message' => 'Failed to register user: ' . $e->getMessage()]);
  }
} else {
  // Missing required parameters
  echo json_encode(['status' => 'error', 'message' => 'Missing required parameters']);
}
