<?php

/**
 * CloudKu phpMyAdmin Signon Bridge
 * 
 * This script enables automatic login to phpMyAdmin by:
 * 1. Receiving credentials via POST from CloudKu backend
 * 2. Creating a session with those credentials
 * 3. Redirecting to phpMyAdmin which reads from this session
 * 
 * This is the same method used by cPanel, InfinityFree, and other shared hosting providers.
 */

// Start session for signon
session_name('SignonSession');
session_start();

// CloudKu Backend URL (Internal Docker Access)
$validation_url = 'http://host.docker.internal:3001/api/v1/internal/phpmyadmin/validate';

// Get token from GET request
$token = isset($_GET['token']) ? $_GET['token'] : '';

if (empty($token)) {
    header('HTTP/1.1 400 Bad Request');
    die('Missing token.');
}

// Prepare validation request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $validation_url . '?token=' . urlencode($token));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5); // 5 seconds timeout
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

// Execute request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);


if ($http_code !== 200 || !$response) {
    header('HTTP/1.1 401 Unauthorized');
    echo 'Token validation failed. ';
    if ($curl_error) echo 'Error: ' . $curl_error;
    die();
}

// Parse response
$data = json_decode($response, true);

if (!isset($data['success']) || !$data['success']) {
    header('HTTP/1.1 401 Unauthorized');
    die('Invalid token.');
}

// Store credentials in session for phpMyAdmin signon auth
$_SESSION['PMA_single_signon_user'] = $data['database_user'];
$_SESSION['PMA_single_signon_password'] = $data['database_password'];
$_SESSION['PMA_single_signon_host'] = 'cloudku-mysql';
$_SESSION['PMA_single_signon_port'] = 3306;

// Set database
$_SESSION['PMA_single_signon_db'] = $data['database_name'];

// Optional: Set session CFGAUTH for config authentication mode
$_SESSION['PMA_single_signon_cfgauth_type'] = 'signon';

// Security: Mark token timestamp
$_SESSION['PMA_single_signon_created'] = time();

// Redirect to phpMyAdmin
$phpmyadmin_url = 'index.php';
if (!empty($data['database_name'])) {
    $phpmyadmin_url .= '?route=/database/structure&db=' . urlencode($data['database_name']);
}

header('Location: ' . $phpmyadmin_url);
exit;
