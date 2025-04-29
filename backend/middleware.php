<?php
include 'cors.php';
include 'jwt.php';

header('Content-Type: application/json');

function authenticate()
{
  $headers = getallheaders();
  $auth_header = $headers['Authorization'] ?? '';

  if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    $token = $matches[1];
    $user_data = JWT_Helper::validateToken($token);

    if ($user_data) {
      return $user_data;
    }
  }

  http_response_code(401);
  echo json_encode(['success' => false, 'message' => 'Unauthorized']);
  exit;
}
