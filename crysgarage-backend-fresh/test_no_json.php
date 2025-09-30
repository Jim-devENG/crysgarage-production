<?php
// Test without JSON functions
header('Content-Type: text/plain');

echo "PHP is working without JSON!\n";
echo "Current time: " . date('Y-m-d H:i:s') . "\n";
echo "PHP version: " . phpversion() . "\n";

// Test if json_encode is available
if (function_exists('json_encode')) {
    echo "json_encode is available\n";
} else {
    echo "json_encode is NOT available\n";
}
?>
