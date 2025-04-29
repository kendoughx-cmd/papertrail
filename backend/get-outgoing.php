<?php
header('Content-Type: application/json');
require_once 'cors.php';
require_once 'db.php';

try {
  // Join with documents table to get document type name
  $stmt = $pdo->query("
    SELECT 
      o.id,
      o.controlNo,
      o.dateReleased,
      o.description,
      o.particulars,
      o.qty,
      o.amount,
      o.totalAmount,
      o.agency,
      o.status,
      o.receivedBy,
      o.storageFile,
      o.document_type,
      d.document_type as documentType
    FROM outgoing o
    LEFT JOIN documents d ON o.document_type = d.id
    ORDER BY o.controlNo ASC
  ");

  $outgoing = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Process each item to ensure consistent data format
  $processedOutgoing = array_map(function ($item) {
    // Helper function to safely parse JSON or return array
    $safeParse = function ($data) {
      if (is_array($data)) return $data;
      if (is_string($data)) {
        $decoded = json_decode($data, true);
        return is_array($decoded) ? $decoded : [];
      }
      return [];
    };

    // Parse the particulars, qty, and amount
    $particulars = $safeParse($item['particulars'] ?? '[]');
    $qty = $safeParse($item['qty'] ?? '[]');
    $amount = $safeParse($item['amount'] ?? '[]');

    return [
      'id' => $item['id'] ?? null,
      'controlNo' => $item['controlNo'] ?? null,
      'dateReleased' => $item['dateReleased'] ?? null,
      'documentType' => $item['documentType'] ?? 'AOM Release',
      'document_type' => $item['document_type'] ?? null,
      'description' => $item['description'] ?? null,
      'particulars' => $particulars,
      'qty' => $qty,
      'amount' => $amount,
      'totalAmount' => $item['totalAmount'] ?? 0,
      'agency' => $item['agency'] ?? null,
      'status' => $item['status'] ?? null,
      'receivedBy' => $item['receivedBy'] ?? null,
      'storageFile' => $item['storageFile'] ?? null
    ];
  }, $outgoing);

  echo json_encode($processedOutgoing);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Failed to fetch outgoing items: ' . $e->getMessage()]);
}
