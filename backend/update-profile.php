<?php
// Include necessary files
require_once 'cors.php';
require_once 'db.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

// Set JSON response headers
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Method not allowed']);
  exit;
}

// Check if user is authenticated
if (!isset($_SESSION['user'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'message' => 'Not authenticated']);
  exit;
}

try {
  // Get the raw POST data
  $json = file_get_contents('php://input');
  $data = json_decode($json, true);

  // Validate required fields
  if (empty($data['first_name']) || empty($data['last_name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'First name and last name are required']);
    exit;
  }

  // Get ID number from session
  $id_number = $_SESSION['user']['id_number'];

  // Prepare update statement
  $stmt = $pdo->prepare("
        UPDATE users 
        SET 
            first_name = :first_name,
            middle_name = :middle_name,
            last_name = :last_name,
            address = :address,
            updated_at = NOW()
        WHERE id_number = :id_number
    ");

  // Bind parameters
  $stmt->bindParam(':first_name', $data['first_name'], PDO::PARAM_STR);
  $stmt->bindParam(':middle_name', $data['middle_name'], PDO::PARAM_STR);
  $stmt->bindParam(':last_name', $data['last_name'], PDO::PARAM_STR);
  $stmt->bindParam(':address', $data['address'], PDO::PARAM_STR);
  $stmt->bindParam(':id_number', $id_number, PDO::PARAM_STR);

  // Execute the update
  $stmt->execute();

  // Check if any rows were affected
  if ($stmt->rowCount() > 0) {
    // Update session data if needed
    $_SESSION['user']['first_name'] = $data['first_name'];
    $_SESSION['user']['last_name'] = $data['last_name'];

    echo json_encode([
      'success' => true,
      'message' => 'Profile updated successfully',
      'updated_fields' => [
        'first_name',
        'middle_name',
        'last_name',
        'address'
      ]
    ]);
  } else {
    echo json_encode([
      'success' => false,
      'message' => 'No changes made to profile'
    ]);
  }
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Database error: ' . $e->getMessage()
  ]);
}
