<?php
/**
 * TechRedo Quotation System API
 * Handles saving and retrieving quotations from MySQL
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// --- DATABASE CONFIGURATION ---
// Replace with your cPanel MySQL credentials
$db_host = 'localhost';
$db_user = 'root';      // Update this
$db_pass = '';          // Update this
$db_name = 'techredo_quotations'; // Update this

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => "Connection failed: " . $conn->connect_error]));
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'save':
        handleSave($conn);
        break;
    case 'list':
        handleList($conn);
        break;
    case 'view':
        handleView($conn);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function handleSave($conn) {
    // Check if both data and file are present
    if (!isset($_POST['json_data']) || !isset($_FILES['pdf_file'])) {
        echo json_encode(['success' => false, 'message' => 'Missing data or file']);
        return;
    }

    $data = json_decode($_POST['json_data'], true);
    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }

    $quote_no = $data['quoteNumber'];
    $client_name = $data['clientName'];
    $location = $data['location'];
    $mobile = $data['mobile'];
    $total_amount = $data['amount'];
    $q_date = $data['date'];
    $json_string = $_POST['json_data'];

    // Read PDF file binary
    $pdf_blob = file_get_contents($_FILES['pdf_file']['tmp_name']);

    // Check if quote exists (to update or insert)
    $stmt = $conn->prepare("SELECT id FROM quotations WHERE quote_no = ?");
    $stmt->bind_param("s", $quote_no);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // Update
        $stmt_update = $conn->prepare("UPDATE quotations SET client_name=?, location=?, mobile=?, total_amount=?, q_date=?, json_data=?, pdf_blob=? WHERE quote_no=?");
        $stmt_update->bind_param("ssssssbs", $client_name, $location, $mobile, $total_amount, $q_date, $json_string, $pdf_null, $quote_no);
        $stmt_update->send_long_data(6, $pdf_blob);
        $res = $stmt_update->execute();
    } else {
        // Insert
        $stmt_insert = $conn->prepare("INSERT INTO quotations (quote_no, client_name, location, mobile, total_amount, q_date, json_data, pdf_blob) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt_insert->bind_param("sssssssb", $quote_no, $client_name, $location, $mobile, $total_amount, $q_date, $json_string, $pdf_null);
        $stmt_insert->send_long_data(7, $pdf_blob);
        $res = $stmt_insert->execute();
    }

    if ($res) {
        echo json_encode(['success' => true, 'message' => 'Quotation saved successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error saving quotation: ' . $conn->error]);
    }
}

function handleList($conn) {
    // We don't fetch the heavy pdf_blob for the list
    $sql = "SELECT id, quote_no, client_name, location, mobile, total_amount, q_date, created_at FROM quotations ORDER BY created_at DESC";
    $result = $conn->query($sql);
    $quotes = [];

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $quotes[] = [
                'id' => $row['id'],
                'quoteNumber' => $row['quote_no'],
                'clientName' => $row['client_name'],
                'location' => $row['location'],
                'mobile' => $row['mobile'],
                'amount' => $row['total_amount'],
                'date' => $row['q_date'],
                'createdAt' => $row['created_at']
            ];
        }
    }

    echo json_encode($quotes);
}

function handleView($conn) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) die("Invalid ID");

    $stmt = $conn->prepare("SELECT pdf_blob, quote_no FROM quotations WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        $filename = "Quotation_" . str_replace(['/', '\\'], '_', $row['quote_no']) . ".pdf";
        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="' . $filename . '"');
        echo $row['pdf_blob'];
    } else {
        echo "Quotation not found";
    }
}

$conn->close();
?>
