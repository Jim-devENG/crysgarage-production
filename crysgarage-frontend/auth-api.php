<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple file-based user storage (for demo purposes)
$usersFile = __DIR__ . '/users.json';
$tokensFile = __DIR__ . '/tokens.json';

// Initialize files if they don't exist
if (!file_exists($usersFile)) {
    file_put_contents($usersFile, json_encode([]));
}
if (!file_exists($tokensFile)) {
    file_put_contents($tokensFile, json_encode([]));
}

// Get request path
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Get the endpoint (last part of the path)
$endpoint = end($pathParts);

// Get request data
$input = json_decode(file_get_contents('php://input'), true);
$method = $_SERVER['REQUEST_METHOD'];

// Load existing data
$users = json_decode(file_get_contents($usersFile), true) ?: [];
$tokens = json_decode(file_get_contents($tokensFile), true) ?: [];

// Helper functions
function generateToken() {
    return bin2hex(random_bytes(32));
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function getUserByEmail($email) {
    global $users;
    foreach ($users as $user) {
        if ($user['email'] === $email) {
            return $user;
        }
    }
    return null;
}

function saveData() {
    global $users, $usersFile, $tokens, $tokensFile;
    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
    file_put_contents($tokensFile, json_encode($tokens, JSON_PRETTY_PRINT));
}

// Route handling
switch ($endpoint) {
    case 'signup':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit();
        }
        
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        
        if (empty($name) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'All fields are required']);
            exit();
        }
        
        if (getUserByEmail($email)) {
            http_response_code(409);
            echo json_encode(['error' => 'User already exists']);
            exit();
        }
        
        $userId = count($users) + 1;
        $user = [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'password' => hashPassword($password),
            'tier' => 'free',
            'credits' => 10,
            'join_date' => date('Y-m-d H:i:s'),
            'total_tracks' => 0,
            'total_spent' => 0
        ];
        
        $users[] = $user;
        $token = generateToken();
        $tokens[$token] = $userId;
        saveData();
        
        // Remove password from response
        unset($user['password']);
        
        echo json_encode([
            'user' => $user,
            'token' => $token
        ]);
        break;
        
    case 'signin':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit();
        }
        
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        
        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            exit();
        }
        
        $user = getUserByEmail($email);
        if (!$user || !verifyPassword($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            exit();
        }
        
        $token = generateToken();
        $tokens[$token] = $user['id'];
        saveData();
        
        // Remove password from response
        unset($user['password']);
        
        echo json_encode([
            'user' => $user,
            'token' => $token
        ]);
        break;
        
    case 'signout':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit();
        }
        
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);
        
        if (isset($tokens[$token])) {
            unset($tokens[$token]);
            saveData();
        }
        
        echo json_encode(['message' => 'Logged out successfully']);
        break;
        
    case 'user':
        if ($method !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit();
        }
        
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);
        
        if (!isset($tokens[$token])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }
        
        $userId = $tokens[$token];
        $user = null;
        foreach ($users as $u) {
            if ($u['id'] == $userId) {
                $user = $u;
                break;
            }
        }
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit();
        }
        
        // Remove password from response
        unset($user['password']);
        
        echo json_encode(['user' => $user]);
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}
?>

