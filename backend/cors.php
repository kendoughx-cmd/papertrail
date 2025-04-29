<?php
// cors.php

// List of allowed origins
$allowedOrigins = [
  'http://localhost:5173',
  'http://172.24.0.252:5173',
  'https://1000-27-110-167-200.ngrok-free.app',
  // Add other domains as needed
];

// Check if HTTP_ORIGIN is set and matches allowed origins
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
  header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
  header("Vary: Origin"); // Helps with caching
}

// Configure session settings for cross-site cookies
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', true);

// Allow credentials (cookies, authorization headers)
header("Access-Control-Allow-Credentials: true");

// Allow specific HTTP methods
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");

// Allow specific headers
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Cache preflight response for 1 hour
header("Access-Control-Max-Age: 3600");

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit();
}
