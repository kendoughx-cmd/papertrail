<?php
header('Content-Type: application/json');
require_once 'cors.php';
require_once 'db.php';

try {
  // Join with documents table to get document type name
  $stmt = $pdo->query("
        SELECT 
            i.id,
            i.controlNo,
            i.dateReceived,
            i.dateOfAda,
            i.adaNo,
            i.jevNo,
            i.orNo,
            i.poNo,
            i.description,
            i.particulars,
            i.qty,
            i.amount,
            i.totalAmount,
            i.payee,
            i.natureOfPayment,
            i.agency,
            i.status,
            i.storageFile,
            i.document_type,
            d.document_type as documentType
        FROM incoming i
        LEFT JOIN documents d ON i.document_type = d.id
        ORDER BY i.controlNo ASC
    ");

  $incoming = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Process each item to ensure consistent data format
  $processedIncoming = array_map(function ($item) {
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
      'dateReceived' => $item['dateReceived'] ?? null,
      'dateOfAda' => $item['dateOfAda'] ?? null,
      'documentType' => $item['documentType'] ?? 'Disbursement Voucher',
      'document_type' => $item['document_type'] ?? null,
      'adaNo' => $item['adaNo'] ?? null,
      'jevNo' => $item['jevNo'] ?? null,
      'orNo' => $item['orNo'] ?? null,
      'poNo' => $item['poNo'] ?? null,
      'description' => $item['description'] ?? null,
      'particulars' => $particulars,
      'qty' => $qty,
      'amount' => $amount,
      'totalAmount' => $item['totalAmount'] ?? 0,
      'payee' => $item['payee'] ?? null,
      'natureOfPayment' => $item['natureOfPayment'] ?? null,
      'agency' => $item['agency'] ?? null,
      'status' => $item['status'] ?? null,
      'storageFile' => $item['storageFile'] ?? null
    ];
  }, $incoming);

  echo json_encode($processedIncoming);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Failed to fetch incoming items: ' . $e->getMessage()]);
}
