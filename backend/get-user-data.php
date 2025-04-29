<?php
header('Content-Type: application/json');
require_once 'cors.php';
require_once 'db.php';
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Not authenticated']);
  exit;
}

try {
  $stmt = $pdo->prepare("SELECT first_name FROM users WHERE id = ?");
  $stmt->execute([$_SESSION['user_id']]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
  }

  echo json_encode([
    'success' => true,
    'data' => [
      'first_name' => $user['first_name']
    ]
  ]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
