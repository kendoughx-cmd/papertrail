<?php
include 'db.php';  // Database connection
include 'cors.php'; // CORS handling for frontend-backend communication

// Get raw DELETE data (JSON)
$data = json_decode(file_get_contents("php://input"), true);

// Check if the required data exists
if (isset($data['id'])) {
  try {
    // Prepare the SQL query using PDO
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");

    // Bind the parameter
    $stmt->bindParam(':id', $data['id']);

    // Execute the query
    $stmt->execute();

    // Check if any row was affected
    if ($stmt->rowCount() > 0) {
      echo json_encode(['status' => 'success', 'message' => 'User deleted successfully']);
    } else {
      echo json_encode(['status' => 'error', 'message' => 'User not found or already deleted']);
    }
  } catch (PDOException $e) {
    // Return error message if something goes wrong
    echo json_encode(['status' => 'error', 'message' => 'Failed to delete user: ' . $e->getMessage()]);
  }
} else {
  // Missing required parameters
  echo json_encode(['status' => 'error', 'message' => 'Missing required parameter: id']);
}
