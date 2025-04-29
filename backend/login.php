<?php
include 'cors.php';
include 'db.php';
include 'jwt.php'; // Include the JWT helper

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['id_number']) || empty($data['password'])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'ID and password required']);
  exit;
}

try {
  $stmt = $pdo->prepare("SELECT * FROM users WHERE id_number = ?");
  $stmt->execute([$data['id_number']]);
  $user = $stmt->fetch();

  if ($user && password_verify($data['password'], $user['password'])) {
    // Generate JWT token instead of using session
    $user_data = [
      'id' => $user['id'],
      'id_number' => $user['id_number'],
      'role' => $user['role'],
      'first_name' => $user['first_name']
    ];

    $token = JWT_Helper::generateToken($user_data);

    echo json_encode([
      'success' => true,
      'token' => $token,
      'user' => $user_data
    ]);
  } else {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
  }
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
