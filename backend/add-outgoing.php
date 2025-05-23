<?php
header('Content-Type: application/json');
require_once 'cors.php';
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

if (!$data) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid data']);
  exit;
}

try {
  // Validate required fields
  $requiredFields = ['documentType', 'receivedBy', 'agency', 'status'];
  foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
      http_response_code(400);
      echo json_encode(['error' => ucfirst($field) . ' is required']);
      exit;
    }
  }

  // Validate particulars
  if (empty($data['items'])) {
    http_response_code(400);
    echo json_encode(['error' => 'At least one particular item is required']);
    exit;
  }

  foreach ($data['items'] as $item) {
    if (empty($item)) {
      http_response_code(400);
      echo json_encode(['error' => 'All particulars must have a description']);
      exit;
    }
  }

  // Get document type ID from database
  $stmt = $pdo->prepare("SELECT id FROM documents WHERE document_type = ?");
  $stmt->execute([$data['documentType']]);
  $docType = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$docType) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid document type']);
    exit;
  }

  // Automatically set current date
  $currentDate = new DateTime();
  $dateReleased = $currentDate->format('Y-m-d');
  $yearMonth = $currentDate->format('Y-m');

  $stmt = $pdo->prepare("
    SELECT MAX(CAST(SUBSTRING_INDEX(controlNo, '-', -1) AS UNSIGNED)) 
    FROM outgoing 
    WHERE controlNo LIKE ?
  ");
  $stmt->execute([$yearMonth . '-%']);
  $lastSeq = $stmt->fetchColumn();

  $sequence = $lastSeq ? $lastSeq + 1 : 1;
  $controlNo = $yearMonth . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);

  // Prepare items data with proper decimal handling
  $items = $data['items'] ?? [];
  $quantities = $data['quantities'] ?? array_fill(0, count($items), 0);
  $amounts = $data['amounts'] ?? array_fill(0, count($items), 0);

  // Calculate total amount with decimal precision
  $totalAmount = 0;
  for ($i = 0; $i < count($items); $i++) {
    $qty = is_numeric($quantities[$i]) ? (int)$quantities[$i] : 0;
    $amt = is_numeric($amounts[$i]) ? (float)$amounts[$i] : 0;
    $totalAmount += $qty * $amt;
  }

  // Round to 2 decimal places for storage
  $totalAmount = round($totalAmount, 2);

  // Insert record
  $stmt = $pdo->prepare("
    INSERT INTO outgoing (
      controlNo, dateReleased, document_type, 
      description, particulars, qty, amount, totalAmount,
      agency, status, receivedBy, storageFile
    ) VALUES (
      :controlNo, :dateReleased, :docType,
      :description, :particulars, :qty, :amount, :totalAmount,
      :agency, :status, :receivedBy, :storageFile
    )
  ");

  $success = $stmt->execute([
    ':controlNo' => $controlNo,
    ':dateReleased' => $dateReleased,
    ':docType' => $docType['id'],
    ':description' => $data['description'] ?? '',
    ':particulars' => json_encode($items),
    ':qty' => json_encode($quantities),
    ':amount' => json_encode($amounts),
    ':totalAmount' => $totalAmount,
    ':agency' => $data['agency'],
    ':status' => $data['status'],
    ':receivedBy' => $data['receivedBy'],
    ':storageFile' => $data['storageFile'] ?? ''
  ]);

  if ($success) {
    echo json_encode([
      'success' => true,
      'id' => $pdo->lastInsertId(),
      'controlNo' => $controlNo,
      'message' => 'Outgoing document added successfully'
    ]);
  } else {
    throw new PDOException('Insert failed');
  }
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
