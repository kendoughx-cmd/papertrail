<?php
header('Content-Type: application/json');
require_once 'cors.php';
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['id'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid data']);
  exit;
}

try {
  // First get the existing record
  $stmt = $pdo->prepare("SELECT * FROM outgoing WHERE id = ?");
  $stmt->execute([$data['id']]);
  $existingData = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$existingData) {
    http_response_code(404);
    echo json_encode(['error' => 'Document not found']);
    exit;
  }

  // Validate required fields if they are being updated
  if (isset($data['documentType']) && empty($data['documentType'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Document type is required']);
    exit;
  }

  if (isset($data['receivedBy']) && empty($data['receivedBy'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Received by is required']);
    exit;
  }

  if (isset($data['agency']) && empty($data['agency'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Agency is required']);
    exit;
  }

  if (isset($data['status']) && empty($data['status'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Status is required']);
    exit;
  }

  // Validate particulars if they are being updated
  if (isset($data['items'])) {
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
  }

  // Only update fields that were explicitly provided
  $updateFields = [];
  $params = [':id' => $data['id']];

  // Document type handling
  if (!empty($data['documentType'])) {
    $stmt = $pdo->prepare("SELECT id FROM documents WHERE document_type = ?");
    $stmt->execute([$data['documentType']]);
    $docType = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$docType) {
      http_response_code(400);
      echo json_encode(['error' => 'Invalid document type']);
      exit;
    }
    $updateFields[] = "document_type = :docType";
    $params[':docType'] = $docType['id'];
  }

  // Date released
  if (isset($data['dateReleased'])) {
    $updateFields[] = "dateReleased = :dateReleased";
    $params[':dateReleased'] = $data['dateReleased'];
  }

  // Description
  if (isset($data['description'])) {
    $updateFields[] = "description = :description";
    $params[':description'] = $data['description'];
  }

  // Storage file
  if (isset($data['storageFile'])) {
    $updateFields[] = "storageFile = :storageFile";
    $params[':storageFile'] = $data['storageFile'];
  }

  // Agency
  if (isset($data['agency'])) {
    $updateFields[] = "agency = :agency";
    $params[':agency'] = $data['agency'];
  }

  // Status
  if (isset($data['status'])) {
    $updateFields[] = "status = :status";
    $params[':status'] = $data['status'];
  }

  // Received by
  if (isset($data['receivedBy'])) {
    $updateFields[] = "receivedBy = :receivedBy";
    $params[':receivedBy'] = $data['receivedBy'];
  }

  // Only update particulars if they were explicitly provided
  if (isset($data['items']) && isset($data['quantities']) && isset($data['amounts'])) {
    $items = $data['items'];
    $quantities = $data['quantities'];
    $amounts = $data['amounts'];

    // Calculate total amount with decimal precision
    $totalAmount = 0;
    for ($i = 0; $i < count($items); $i++) {
      $qty = is_numeric($quantities[$i]) ? (int)$quantities[$i] : 0;
      $amt = is_numeric($amounts[$i]) ? (float)$amounts[$i] : 0;
      $totalAmount += $qty * $amt;
    }

    // Round to 2 decimal places for storage
    $totalAmount = round($totalAmount, 2);

    $updateFields = array_merge($updateFields, [
      "particulars = :particulars",
      "qty = :qty",
      "amount = :amount",
      "totalAmount = :totalAmount"
    ]);

    $params[':particulars'] = json_encode($items);
    $params[':qty'] = json_encode($quantities);
    $params[':amount'] = json_encode($amounts);
    $params[':totalAmount'] = $totalAmount;
  }

  // Only proceed if there are fields to update
  if (empty($updateFields)) {
    echo json_encode([
      'success' => true,
      'message' => 'No fields to update'
    ]);
    exit;
  }

  // Construct and execute the update query
  $query = "UPDATE outgoing SET " . implode(', ', $updateFields) . " WHERE id = :id";
  $stmt = $pdo->prepare($query);
  $success = $stmt->execute($params);

  if ($success) {
    echo json_encode([
      'success' => true,
      'message' => 'Outgoing document updated successfully'
    ]);
  } else {
    throw new PDOException('Update failed');
  }
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
