<?php
header('Content-Type: application/json');
require_once 'cors.php';
require_once 'db.php';

try {
  // Get total incoming documents count
  $stmt = $pdo->query("SELECT COUNT(*) as total FROM incoming");
  $incoming = $stmt->fetch(PDO::FETCH_ASSOC);

  // Get total outgoing documents count
  $stmt = $pdo->query("SELECT COUNT(*) as total FROM outgoing");
  $outgoing = $stmt->fetch(PDO::FETCH_ASSOC);

  // Calculate total documents as sum of incoming and outgoing
  $totalDocuments = $incoming['total'] + $outgoing['total'];

  // Get total users count
  $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
  $users = $stmt->fetch(PDO::FETCH_ASSOC);

  echo json_encode([
    'success' => true,
    'data' => [
      'documents' => $totalDocuments,
      'incoming' => $incoming['total'],
      'outgoing' => $outgoing['total'],
      'users' => $users['total']
    ]
  ]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
