<?php
// Ultra simple test without JSON
header('Content-Type: text/plain');

echo "PHP Server is working!\n";
echo "Current time: " . date('Y-m-d H:i:s') . "\n";
echo "PHP version: " . phpversion() . "\n";
echo "Request URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "Request Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
?>
