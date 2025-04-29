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
  if (empty($data['documentType'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Document type is required']);
    exit;
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

  // Generate control number
  $currentDate = new DateTime();
  $yearMonth = $currentDate->format('Y-m');

  $stmt = $pdo->prepare("
        SELECT MAX(CAST(SUBSTRING_INDEX(controlNo, '-', -1) AS UNSIGNED)) 
        FROM incoming 
        WHERE controlNo LIKE ?
    ");
  $stmt->execute([$yearMonth . '-%']);
  $lastSeq = $stmt->fetchColumn();

  $sequence = $lastSeq ? $lastSeq + 1 : 1;
  $controlNo = $yearMonth . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);

  // Prepare data - handle different document types
  $adaNo = $data['documentType'] === 'Disbursement Voucher' ? ($data['adaNo'] ?? '') : '';
  $jevNo = $data['documentType'] === 'Disbursement Voucher' ? ($data['jevNo'] ?? '') : '';
  $orNo = $data['documentType'] === 'Official Receipt' ? ($data['orNo'] ?? '') : '';
  $poNo = $data['documentType'] === 'Purchase Order' ? ($data['poNo'] ?? '') : '';

  // Prepare items data
  $items = $data['items'] ?? [];
  $quantities = $data['quantities'] ?? array_fill(0, count($items), 0);
  $amounts = $data['amounts'] ?? array_fill(0, count($items), 0);

  // Calculate total amount
  $totalAmount = 0;
  for ($i = 0; $i < count($items); $i++) {
    $qty = is_numeric($quantities[$i]) ? (float)$quantities[$i] : 0;
    $amt = is_numeric($amounts[$i]) ? (float)$amounts[$i] : 0;
    $totalAmount += $qty * $amt;
  }

  // Insert record
  $stmt = $pdo->prepare("
        INSERT INTO incoming (
            controlNo, dateReceived, dateOfAda, document_type, 
            adaNo, jevNo, orNo, poNo,
            description, particulars, qty, amount, totalAmount,
            payee, natureOfPayment, agency, status, storageFile
        ) VALUES (
            :controlNo, CURDATE(), :dateOfAda, :docType,
            :adaNo, :jevNo, :orNo, :poNo,
            :description, :particulars, :qty, :amount, :totalAmount,
            :payee, :natureOfPayment, :agency, :status, :storageFile
        )
    ");

  $success = $stmt->execute([
    ':controlNo' => $controlNo,
    ':dateOfAda' => $data['dateOfAda'] ?? '',
    ':docType' => $docType['id'],
    ':adaNo' => $adaNo,
    ':jevNo' => $jevNo,
    ':orNo' => $orNo,
    ':poNo' => $poNo,
    ':description' => $data['description'] ?? '',
    ':particulars' => json_encode($items),
    ':qty' => json_encode($quantities),
    ':amount' => json_encode($amounts),
    ':totalAmount' => $totalAmount,
    ':payee' => $data['payee'] ?? '',
    ':natureOfPayment' => $data['natureOfPayment'] ?? '',
    ':agency' => $data['agency'] ?? '',
    ':status' => $data['status'] ?? '',
    ':storageFile' => $data['storageFile'] ?? ''
  ]);

  if ($success) {
    echo json_encode([
      'success' => true,
      'id' => $pdo->lastInsertId(),
      'controlNo' => $controlNo,
      'message' => 'Document added successfully'
    ]);
  } else {
    throw new PDOException('Insert failed');
  }
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
