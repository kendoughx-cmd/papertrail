<?php
include 'cors.php';

session_start();

// Clear the session data
$_SESSION = array();

// Destroy the session
session_destroy();

// Clear the session cookie
setcookie(session_name(), '', time() - 3600, '/'); // Ensure the path '/' is correct

// Clear the custom 'logged_in' cookie
setcookie('logged_in', '', time() - 3600, '/'); // Make sure this path matches where the cookie was set

// Optionally, regenerate the session ID for security reasons
session_regenerate_id(true);

// Respond with a success message
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
