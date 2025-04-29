<?php
include 'cors.php';
include 'db.php'; // Include your database connection file

try {
    $stmt = $pdo->query("SELECT * FROM logs ORDER BY timestamp ASC");
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'logs' => $logs]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
