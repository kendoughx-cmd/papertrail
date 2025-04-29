<?php
$host = 'localhost';
$dbname = 'tracker';
$username = 'root';
$password = '';
$port = 3306;

try {
  $pdo = new PDO(
    "mysql:host=$host;port=$port;dbname=$dbname",
    $username,
    $password,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
  );

  // Connection successful feedback
  if ($pdo) {
    error_log("Database connection established successfully");
  }
} catch (PDOException $e) {
  error_log("Database connection failed: " . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    "status" => "error",
    "message" => "Database connection failed",
    "error_code" => $e->getCode()
  ]);
  exit();
}
