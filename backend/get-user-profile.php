<?php
// Include necessary files
require_once 'cors.php';
require_once 'db.php';
require_once 'jwt.php'; // Include JWT helper

// Set JSON response headers
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

try {
  // Get authorization header
  $headers = getallheaders();
  $auth_header = $headers['Authorization'] ?? '';

  // Validate JWT token
  if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    $token = $matches[1];
    $user_data = JWT_Helper::validateToken($token);

    if (!$user_data) {
      http_response_code(401);
      echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
      exit;
    }
  } else {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authorization token required']);
    exit;
  }

  // Get ID number from token
  $id_number = $user_data['id_number'];

  // Prepare and execute query to fetch profile info
  $stmt = $pdo->prepare("
    SELECT 
      id_number,
      first_name,
      COALESCE(middle_name, '') AS middle_name,
      last_name,
      email,
      COALESCE(address, '') AS address,
      role
    FROM users 
    WHERE id_number = :id_number
  ");

  $stmt->bindParam(':id_number', $id_number, PDO::PARAM_STR);
  $stmt->execute();

  // Fetch user data
  $user = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($user) {
    // Return the profile information
    echo json_encode([
      'success' => true,
      'user' => [
        'id_number' => $user['id_number'],
        'first_name' => $user['first_name'],
        'middle_name' => $user['middle_name'],
        'last_name' => $user['last_name'],
        'email' => $user['email'],
        'address' => $user['address'],
        'role' => $user['role']
      ],
      'message' => 'Profile data retrieved successfully'
    ]);
  } else {
    http_response_code(404);
    echo json_encode([
      'success' => false,
      'message' => 'User not found in database'
    ]);
  }
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Database error'
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Server error'
  ]);
}
