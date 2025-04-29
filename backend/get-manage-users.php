<?php
include 'cors.php'; // Ensure CORS is properly handled
include 'db.php';

try {
  // Prepare SQL statement to fetch user data including 'id'
  $stmt = $pdo->prepare("SELECT id, id_number, first_name, middle_name,last_name, email, address, role FROM users");
  $stmt->execute();

  // Fetch all users
  $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Return users as JSON response
  echo json_encode([
    'status' => 'success',
    'users' => $users
  ]);
} catch (PDOException $e) {
  // Handle database errors
  echo json_encode([
    'status' => 'error',
    'message' => 'Database error: ' . $e->getMessage()
  ]);
}
