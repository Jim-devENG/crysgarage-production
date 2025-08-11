<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

function getContainerStatus() {
    $output = shell_exec('cd /var/www/crysgarage-deploy && docker-compose ps --format json 2>/dev/null');
    if (!$output) {
        return ['error' => 'Cannot check containers'];
    }
    
    $containers = json_decode($output, true);
    if (!$containers) {
        return ['error' => 'Invalid container data'];
    }
    
    $status = [];
    foreach ($containers as $container) {
        $status[] = [
            'name' => $container['Name'],
            'status' => $container['State'],
            'health' => $container['Health'] ?? 'N/A'
        ];
    }
    
    return $status;
}

function getAppHealth() {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://crysgarage.studio/health');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'CrysGarage-Status-Check');
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'status' => $httpCode === 200 ? 'online' : 'offline',
        'response_code' => $httpCode,
        'response' => $response
    ];
}

function getSystemInfo() {
    $load = sys_getloadavg();
    $memory = file_get_contents('/proc/meminfo');
    $disk = disk_free_space('/') / disk_total_space('/') * 100;
    
    return [
        'load_average' => $load,
        'memory_usage' => $memory,
        'disk_free_percent' => round($disk, 2),
        'uptime' => file_get_contents('/proc/uptime')
    ];
}

function getRecentLogs() {
    $logs = shell_exec('cd /var/www/crysgarage-deploy && docker-compose logs --tail=20 2>/dev/null');
    return $logs ?: 'No logs available';
}

$action = $_GET['action'] ?? 'status';

switch ($action) {
    case 'containers':
        echo json_encode([
            'timestamp' => date('Y-m-d H:i:s'),
            'containers' => getContainerStatus()
        ]);
        break;
        
    case 'health':
        echo json_encode([
            'timestamp' => date('Y-m-d H:i:s'),
            'health' => getAppHealth()
        ]);
        break;
        
    case 'system':
        echo json_encode([
            'timestamp' => date('Y-m-d H:i:s'),
            'system' => getSystemInfo()
        ]);
        break;
        
    case 'logs':
        echo json_encode([
            'timestamp' => date('Y-m-d H:i:s'),
            'logs' => getRecentLogs()
        ]);
        break;
        
    default:
        echo json_encode([
            'timestamp' => date('Y-m-d H:i:s'),
            'status' => 'online',
            'containers' => getContainerStatus(),
            'health' => getAppHealth(),
            'system' => getSystemInfo()
        ]);
}
?> 