<?php
include 'middleware.php'; // The file with the authenticate() function

// This will validate the token and return user data if valid
$user_data = authenticate();

// Now you can use $user_data in your endpoint
echo json_encode([
  'success' => true,
  'user' => $user_data,
  'message' => 'Authenticated successfully'
]);
