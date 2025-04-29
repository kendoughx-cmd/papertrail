<?php
header('Content-Type: application/json');
require_once 'cors.php';
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

try {
  $stmt = $pdo->prepare("DELETE FROM outgoing WHERE id = ?");
  $success = $stmt->execute([$data['id']]);

  if ($success) {
    echo json_encode(['success' => true]);
  } else {
    throw new PDOException('Delete failed');
  }
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Failed to delete outgoing item']);
}
