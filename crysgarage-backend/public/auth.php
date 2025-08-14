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

// Database configuration
$db_host = 'localhost';
$db_name = 'crysgarage';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed',
        'details' => $e->getMessage(),
        'database' => $db_name,
        'host' => $db_host
    ]);
    exit();
}

// Create users table if it doesn't exist
$create_table_sql = "
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tier ENUM('free', 'pro', 'advanced') DEFAULT 'free',
    credits INT DEFAULT 3,
    join_date DATE DEFAULT CURRENT_DATE,
    total_tracks INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

try {
    $pdo->exec($create_table_sql);
} catch(PDOException $e) {
    // Table might already exist, continue
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Get the action from the path
$action = end($path_parts);

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Authentication endpoints
switch($action) {
    case 'signup':
        if ($method === 'POST') {
            handleSignup($pdo, $input);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    case 'signin':
        if ($method === 'POST') {
            handleSignin($pdo, $input);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    case 'signout':
        if ($method === 'POST') {
            handleSignout();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    case 'user':
        if ($method === 'GET') {
            handleGetUser($pdo);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}

function handleSignup($pdo, $input) {
    if (!isset($input['name']) || !isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }
    
    $name = trim($input['name']);
    $email = trim($input['email']);
    $password = $input['password'];
    
    // Validate input
    if (empty($name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields are required']);
        return;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }
    
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters']);
        return;
    }
    
    try {
        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already registered']);
            return;
        }
        
        // Hash password
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert new user
        $stmt = $pdo->prepare("
            INSERT INTO users (name, email, password_hash, tier, credits) 
            VALUES (?, ?, ?, 'free', 3)
        ");
        $stmt->execute([$name, $email, $password_hash]);
        
        $user_id = $pdo->lastInsertId();
        
        // Get the created user
        $stmt = $pdo->prepare("
            SELECT id, name, email, tier, credits, join_date, total_tracks, total_spent 
            FROM users WHERE id = ?
        ");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Generate JWT token (simplified for now)
        $token = generateToken($user);
        
        echo json_encode([
            'user' => $user,
            'token' => $token
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Registration failed',
            'details' => $e->getMessage()
        ]);
    }
}

function handleSignin($pdo, $input) {
    if (!isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        return;
    }
    
    $email = trim($input['email']);
    $password = $input['password'];
    
    try {
        // Get user by email
        $stmt = $pdo->prepare("
            SELECT id, name, email, password_hash, tier, credits, join_date, total_tracks, total_spent 
            FROM users WHERE email = ?
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            return;
        }
        
        // Remove password hash from response
        unset($user['password_hash']);
        
        // Generate JWT token
        $token = generateToken($user);
        
        echo json_encode([
            'user' => $user,
            'token' => $token
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Login failed']);
    }
}

function handleSignout() {
    // In a real implementation, you might want to blacklist the token
    // For now, just return success
    echo json_encode(['message' => 'Signed out successfully']);
}

function handleGetUser($pdo) {
    $headers = getallheaders();
    $token = null;
    
    // Extract token from Authorization header
    if (isset($headers['Authorization'])) {
        $auth_header = $headers['Authorization'];
        if (strpos($auth_header, 'Bearer ') === 0) {
            $token = substr($auth_header, 7);
        }
    }
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        return;
    }
    
    try {
        // Decode token (simplified)
        $user_data = decodeToken($token);
        
        if (!$user_data || !isset($user_data['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            return;
        }
        
        // Get user from database
        $stmt = $pdo->prepare("
            SELECT id, name, email, tier, credits, join_date, total_tracks, total_spent 
            FROM users WHERE id = ?
        ");
        $stmt->execute([$user_data['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'User not found']);
            return;
        }
        
        echo json_encode($user);
        
    } catch(Exception $e) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
    }
}

function generateToken($user) {
    // Simple token generation (in production, use proper JWT)
    $payload = [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ];
    
    return base64_encode(json_encode($payload));
}

function decodeToken($token) {
    try {
        $payload = json_decode(base64_decode($token), true);
        
        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            return null;
        }
        
        return $payload;
    } catch(Exception $e) {
        return null;
    }
}
?> 