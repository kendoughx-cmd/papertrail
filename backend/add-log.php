<?php
include 'cors.php';
include 'db.php'; // Include your database connection file

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Check if the required data is present
  $action = $data['action'] ?? '';
  $description = $data['description'] ?? '';
  $user = $data['user'] ?? '';
  $documentType = $data['documentType'] ?? '';  // Added for document-specific logging
  $controlNo = $data['controlNo'] ?? '';  // Added for document-specific logging
  $changes = $data['changes'] ?? null;  // For change tracking

  // Generate log ID (LOG_XXX_YYYY-MM-DD)
  $date = date('Y-m-d');
  $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM logs WHERE DATE(timestamp) = ?");
  $stmt->execute([$date]);
  $result = $stmt->fetch(PDO::FETCH_ASSOC);
  $logNumber = str_pad($result['count'] + 1, 3, '0', STR_PAD_LEFT);
  $logId = "LOG_" . $logNumber . "_" . $date;

  try {
    // If the action involves a document (CREATE, UPDATE, DELETE)
    if (in_array($action, ['CREATE', 'UPDATE', 'DELETE'])) {
      $logDescription = generateLogDescription($action, $documentType, $controlNo, $changes);
      $stmt = $pdo->prepare("INSERT INTO logs (log_id, action, description, user) VALUES (?, ?, ?, ?)");
      $stmt->execute([$logId, $action, $logDescription, $user]);
    } else {
      // General logging for other actions
      $stmt = $pdo->prepare("INSERT INTO logs (log_id, action, description, user) VALUES (?, ?, ?, ?)");
      $stmt->execute([$logId, $action, $description, $user]);
    }

    echo json_encode(['success' => true, 'message' => 'Log added successfully']);
  } catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
  }
} else {
  echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

// Helper function to generate log description based on action and changes
function generateLogDescription($action, $documentType, $controlNo, $changes = null)
{
  $actionVerb = '';
  $description = '';

  // Define common and incoming fields for logging
  $commonFields = ['storageFile', 'description', 'agency', 'status', 'receivedBy'];
  $incomingFields = ['dateOfAda', 'adaNo', 'jevNo', 'orNo', 'poNo', 'payee', 'natureOfPayment'];

  switch ($action) {
    case 'CREATE':
      $actionVerb = 'Created';
      $description = "$actionVerb $documentType";
      if ($controlNo) $description .= " with Control No. $controlNo";
      break;

    case 'UPDATE':
      $actionVerb = 'Updated';
      $description = "$actionVerb $documentType";
      if ($controlNo) $description .= " ($controlNo)";

      if ($changes) {
        $changedFields = [];

        // Track common fields
        foreach ($commonFields as $field) {
          if (isset($changes[$field]) && $changes[$field]['from'] !== $changes[$field]['to']) {
            $changedFields[] = "$field: {$changes[$field]['from']} → {$changes[$field]['to']}";
          }
        }

        // Track incoming fields
        foreach ($incomingFields as $field) {
          if (isset($changes[$field]) && $changes[$field]['from'] !== $changes[$field]['to']) {
            $changedFields[] = "$field: {$changes[$field]['from']} → {$changes[$field]['to']}";
          }
        }

        if (!empty($changedFields)) {
          $description .= ": " . implode(", ", $changedFields);
        }

        // Simply show if particulars changed (no details)
        if (isset($changes['particularsUpdated']) && $changes['particularsUpdated']) {
          $description .= ' [Particulars Updated]';
        }
      }
      break;

    case 'DELETE':
      $actionVerb = 'Deleted';
      $description = "$actionVerb $documentType";
      if ($controlNo) $description .= " (Control No. $controlNo)";
      break;

    default:
      $actionVerb = 'Performed action on';
      $description = "$actionVerb $documentType";
      if ($controlNo) $description .= " ($controlNo)";
  }

  return $description;
}
