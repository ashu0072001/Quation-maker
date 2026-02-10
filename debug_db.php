<?php
/**
 * TechRedo Database Diagnostic Tool
 * Run this script on your live server to test the connection.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain');

// --- PULL CONFIG FROM API.PHP ---
$api_content = file_get_contents('api.php');

function get_var($content, $var_name) {
    preg_match('/\$' . $var_name . '\s*=\s*\'(.*?)\'/', $content, $matches);
    return $matches[1] ?? 'NOT FOUND';
}

$host = get_var($api_content, 'db_host');
$user = get_var($api_content, 'db_user');
$pass = get_var($api_content, 'db_pass');
$name = get_var($api_content, 'db_name');

echo "=== DATABASE DIAGNOSTIC START ===\n";
echo "Testing Connection with current settings:\n";
echo "Host: " . $host . "\n";
echo "User: " . $user . "\n";
echo "Pass: " . ($pass ? "********" : "[EMPTY]") . "\n";
echo "DB Name: " . $name . "\n";
echo "---------------------------------\n";

$conn = @new mysqli($host, $user, $pass, $name);

if ($conn->connect_error) {
    echo "❌ CONNECTION FAILED!\n";
    echo "Error Number: " . $conn->connect_errno . "\n";
    echo "Error Message: " . $conn->connect_error . "\n";
    
    if ($conn->connect_errno == 1045) {
        echo "\nADVICE: Access Denied. Check your DB USERNAME and PASSWORD.\n";
    } elseif ($conn->connect_errno == 1044) {
        echo "\nADVICE: Access Denied for this specific database. Check DB NAME or User Privileges.\n";
    } elseif ($conn->connect_errno == 2002) {
        echo "\nADVICE: Host unreachable. This usually means 'localhost' isn't correct for your host.\n";
    }
} else {
    echo "✅ SUCCESS! Database connected perfectly.\n";
    
    // Test if table exists
    $result = $conn->query("SHOW TABLES LIKE 'quotations'");
    if ($result->num_rows > 0) {
        echo "✅ Table 'quotations' found.\n";
    } else {
        echo "❌ Table 'quotations' NOT FOUND in database '$name'.\n";
        echo "ADVICE: Please run the SQL import from 'integf_techredo_quotations.sql'.\n";
    }
    $conn->close();
}

echo "\n=== DIAGNOSTIC END ===\n";
?>
