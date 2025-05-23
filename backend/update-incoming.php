<?php
header('Content-Type: application/json');
require_once 'cors.php';
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

if (!$data || empty($data['id'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid data']);
  exit;
}

try {
  // Validate required fields
  $required = ['dateOfAda', 'documentType', 'agency', 'status'];

  // Document type specific requirements
  if ($data['documentType'] === 'Disbursement Voucher (ADA)') {
    $required[] = 'adaNo';
  } elseif ($data['documentType'] === 'Purchase Order') {
    $required[] = 'poNo';
  } elseif ($data['documentType'] === 'Official Receipt') {
    $required[] = 'orNo';
  }

  foreach ($required as $field) {
    if (empty($data[$field])) {
      http_response_code(400);
      echo json_encode(['error' => "$field is required"]);
      exit;
    }
  }

  // Validate particulars
  if (empty($data['items']) || count(array_filter($data['items'])) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'At least one valid particular is required']);
    exit;
  }

  // Get document type ID
  $stmt = $pdo->prepare("SELECT id FROM documents WHERE document_type = ?");
  $stmt->execute([$data['documentType']]);
  $docType = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$docType) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid document type']);
    exit;
  }

  // Prepare data with proper decimal handling
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

  // Update record
  $stmt = $pdo->prepare("
    UPDATE incoming SET
      dateOfAda = :dateOfAda,
      document_type = :docType,
      adaNo = :adaNo,
      jevNo = :jevNo,
      orNo = :orNo,
      poNo = :poNo,
      description = :description,
      particulars = :particulars,
      qty = :qty,
      amount = :amount,
      totalAmount = :totalAmount,
      payee = :payee,
      natureOfPayment = :natureOfPayment,
      agency = :agency,
      status = :status,
      storageFile = :storageFile
    WHERE id = :id
  ");

  $success = $stmt->execute([
    ':dateOfAda' => $data['dateOfAda'],
    ':docType' => $docType['id'],
    ':adaNo' => $data['adaNo'] ?? null,
    ':jevNo' => $data['jevNo'] ?? null,
    ':orNo' => $data['orNo'] ?? null,
    ':poNo' => $data['poNo'] ?? null,
    ':description' => $data['description'] ?? null,
    ':particulars' => json_encode($items),
    ':qty' => json_encode($quantities),
    ':amount' => json_encode($amounts),
    ':totalAmount' => $totalAmount,
    ':payee' => $data['payee'] ?? null,
    ':natureOfPayment' => $data['natureOfPayment'] ?? null,
    ':agency' => $data['agency'],
    ':status' => $data['status'],
    ':storageFile' => $data['storageFile'] ?? null,
    ':id' => $data['id']
  ]);

  if ($success) {
    echo json_encode([
      'success' => true,
      'message' => 'Document updated successfully'
    ]);
  } else {
    throw new PDOException('Update failed');
  }
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
