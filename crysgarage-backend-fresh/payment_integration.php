<?php
/**
 * Payment Integration for Crys Garage ML Pipeline
 * Connects the existing payment/credit system with the queue processing
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple autoloader for our classes
spl_autoload_register(function ($class) {
    $file = __DIR__ . '/app/' . str_replace('App\\', '', $class) . '.php';
    $file = str_replace('\\', '/', $file);
    if (file_exists($file)) {
        require_once $file;
    }
});

class PaymentIntegration
{
    private $storageFile;
    private $usersFile;
    private $creditsFile;

    public function __construct()
    {
        $this->storageFile = __DIR__ . '/storage.json';
        $this->usersFile = __DIR__ . '/users.json';
        $this->creditsFile = __DIR__ . '/credits.json';
        
        // Initialize files if they don't exist
        $this->initializeFiles();
    }

    private function initializeFiles()
    {
        if (!file_exists($this->usersFile)) {
            file_put_contents($this->usersFile, json_encode([]));
        }
        
        if (!file_exists($this->creditsFile)) {
            file_put_contents($this->creditsFile, json_encode([]));
        }
    }

    /**
     * Get user credit balance
     */
    public function getCreditBalance($userId)
    {
        $users = $this->loadUsers();
        $user = $users[$userId] ?? null;
        
        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found'
            ];
        }

        return [
            'success' => true,
            'credits' => $user['credits'] ?? 5,
            'tier' => $user['tier'] ?? 'free',
            'total_tracks' => $user['total_tracks'] ?? 0,
            'total_spent' => $user['total_spent'] ?? 0.00
        ];
    }

    /**
     * Check if user can process audio
     */
    public function canProcessAudio($userId, $tier = null)
    {
        $users = $this->loadUsers();
        $user = $users[$userId] ?? null;
        
        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found'
            ];
        }

        $userTier = $tier ?? $user['tier'] ?? 'free';
        $userCredits = $user['credits'] ?? 5;

        // Tier-based processing rules
        switch ($userTier) {
            case 'one_on_one':
                return [
                    'success' => true,
                    'can_process' => true,
                    'reason' => 'One-on-one tier has unlimited processing'
                ];
                
            case 'free':
                return [
                    'success' => true,
                    'can_process' => true,
                    'reason' => 'Free tier uses pay-per-download'
                ];
                
            case 'pro':
            case 'advanced':
                if ($userCredits > 0) {
                    return [
                        'success' => true,
                        'can_process' => true,
                        'reason' => 'User has sufficient credits'
                    ];
                } else {
                    return [
                        'success' => false,
                        'can_process' => false,
                        'reason' => 'Insufficient credits',
                        'required_credits' => 1,
                        'current_credits' => $userCredits
                    ];
                }
                
            default:
                return [
                    'success' => false,
                    'can_process' => false,
                    'reason' => 'Invalid tier'
                ];
        }
    }

    /**
     * Deduct credits for processing
     */
    public function deductCredits($userId, $amount = 1)
    {
        $users = $this->loadUsers();
        $user = $users[$userId] ?? null;
        
        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found'
            ];
        }

        $userTier = $user['tier'] ?? 'free';
        $userCredits = $user['credits'] ?? 5;

        // Free and one-on-one tiers don't use credits
        if ($userTier === 'free' || $userTier === 'one_on_one') {
            return [
                'success' => true,
                'credits_deducted' => 0,
                'remaining_credits' => $userCredits,
                'reason' => 'Tier does not use credits'
            ];
        }

        // Check if user has sufficient credits
        if ($userCredits >= $amount) {
            $user['credits'] = $userCredits - $amount;
            $user['total_tracks'] = ($user['total_tracks'] ?? 0) + 1;
            
            $users[$userId] = $user;
            $this->saveUsers($users);
            
            // Log credit transaction
            $this->logCreditTransaction($userId, -$amount, 'audio_processing', 'Audio processing credit deduction');
            
            return [
                'success' => true,
                'credits_deducted' => $amount,
                'remaining_credits' => $user['credits'],
                'total_tracks' => $user['total_tracks']
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Insufficient credits',
                'required_credits' => $amount,
                'current_credits' => $userCredits
            ];
        }
    }

    /**
     * Add credits (for purchases)
     */
    public function addCredits($userId, $amount, $reason = 'credit_purchase')
    {
        $users = $this->loadUsers();
        $user = $users[$userId] ?? null;
        
        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found'
            ];
        }

        $user['credits'] = ($user['credits'] ?? 0) + $amount;
        $user['total_spent'] = ($user['total_spent'] ?? 0) + ($amount * 100); // Assuming 1 credit = 100 kobo
        
        $users[$userId] = $user;
        $this->saveUsers($users);
        
        // Log credit transaction
        $this->logCreditTransaction($userId, $amount, $reason, 'Credit purchase');
        
        return [
            'success' => true,
            'credits_added' => $amount,
            'total_credits' => $user['credits'],
            'total_spent' => $user['total_spent']
        ];
    }

    /**
     * Get credit history
     */
    public function getCreditHistory($userId, $limit = 10)
    {
        $credits = $this->loadCredits();
        $userCredits = array_filter($credits, function($transaction) use ($userId) {
            return $transaction['user_id'] === $userId;
        });
        
        // Sort by date (newest first)
        usort($userCredits, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        return array_slice($userCredits, 0, $limit);
    }

    /**
     * Process payment for tier upgrade
     */
    public function processTierUpgrade($userId, $tier, $amount)
    {
        $users = $this->loadUsers();
        $user = $users[$userId] ?? null;
        
        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found'
            ];
        }

        // Validate tier
        $validTiers = ['free', 'pro', 'advanced', 'one_on_one'];
        if (!in_array($tier, $validTiers)) {
            return [
                'success' => false,
                'message' => 'Invalid tier'
            ];
        }

        // Update user tier
        $user['tier'] = $tier;
        $user['total_spent'] = ($user['total_spent'] ?? 0) + $amount;
        
        $users[$userId] = $user;
        $this->saveUsers($users);
        
        // Log credit transaction
        $this->logCreditTransaction($userId, 0, 'tier_upgrade', "Upgraded to {$tier} tier");
        
        return [
            'success' => true,
            'new_tier' => $tier,
            'total_spent' => $user['total_spent']
        ];
    }

    /**
     * Get tier pricing
     */
    public function getTierPricing()
    {
        return [
            'free' => [
                'name' => 'Free',
                'price' => 0,
                'credits' => 5,
                'features' => [
                    'Pay-per-download',
                    'Basic mastering',
                    'WAV & MP3 formats'
                ]
            ],
            'pro' => [
                'name' => 'Professional',
                'price' => 5000, // 5000 kobo = 50 NGN
                'credits' => 20,
                'features' => [
                    '20 credits included',
                    'Professional mastering',
                    'WAV, MP3 & FLAC formats',
                    'Priority processing'
                ]
            ],
            'advanced' => [
                'name' => 'Advanced',
                'price' => 10000, // 10000 kobo = 100 NGN
                'credits' => 50,
                'features' => [
                    '50 credits included',
                    'Advanced mastering',
                    'All formats (WAV, MP3, FLAC, AIFF)',
                    'Highest quality processing',
                    'Priority support'
                ]
            ],
            'one_on_one' => [
                'name' => 'One-on-One',
                'price' => 50000, // 50000 kobo = 500 NGN
                'credits' => 'unlimited',
                'features' => [
                    'Unlimited processing',
                    'Personal consultation',
                    'Custom mastering',
                    'All formats',
                    'Direct communication'
                ]
            ]
        ];
    }

    private function loadUsers()
    {
        if (!file_exists($this->usersFile)) {
            return [];
        }
        
        $content = file_get_contents($this->usersFile);
        return json_decode($content, true) ?: [];
    }

    private function saveUsers($users)
    {
        file_put_contents($this->usersFile, json_encode($users, JSON_PRETTY_PRINT));
    }

    private function loadCredits()
    {
        if (!file_exists($this->creditsFile)) {
            return [];
        }
        
        $content = file_get_contents($this->creditsFile);
        return json_decode($content, true) ?: [];
    }

    private function saveCredits($credits)
    {
        file_put_contents($this->creditsFile, json_encode($credits, JSON_PRETTY_PRINT));
    }

    private function logCreditTransaction($userId, $amount, $type, $description)
    {
        $credits = $this->loadCredits();
        
        $transaction = [
            'id' => uniqid(),
            'user_id' => $userId,
            'type' => $type,
            'amount' => $amount,
            'description' => $description,
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        $credits[] = $transaction;
        $this->saveCredits($credits);
    }

    /**
     * Create or update user
     */
    public function createOrUpdateUser($userId, $userData)
    {
        $users = $this->loadUsers();
        
        $users[$userId] = array_merge($users[$userId] ?? [], [
            'id' => $userId,
            'name' => $userData['name'] ?? 'User',
            'email' => $userData['email'] ?? 'user@example.com',
            'tier' => $userData['tier'] ?? 'free',
            'credits' => $userData['credits'] ?? 5,
            'total_tracks' => $userData['total_tracks'] ?? 0,
            'total_spent' => $userData['total_spent'] ?? 0.00,
            'created_at' => $userData['created_at'] ?? date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        
        $this->saveUsers($users);
        
        return [
            'success' => true,
            'user' => $users[$userId]
        ];
    }
}

// Handle API requests
$paymentIntegration = new PaymentIntegration();
$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($request_uri, PHP_URL_PATH);
$segments = array_filter(explode('/', $path));

function sendResponse($data) {
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit();
}

function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'status' => 'error',
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

// Route handling
if (empty($segments)) {
    // Root path
    sendResponse([
        'status' => 'success',
        'service' => 'Crys Garage Payment Integration',
        'version' => '1.0.0',
        'timestamp' => date('Y-m-d H:i:s'),
        'endpoints' => [
            'GET /api/credits/balance' => 'Get credit balance',
            'POST /api/credits/deduct' => 'Deduct credits',
            'POST /api/credits/add' => 'Add credits',
            'GET /api/credits/history' => 'Get credit history',
            'POST /api/tier/upgrade' => 'Upgrade tier',
            'GET /api/tier/pricing' => 'Get tier pricing',
            'POST /api/user/create' => 'Create or update user'
        ]
    ]);
} elseif ($segments[0] === 'api') {
    if (count($segments) >= 2) {
        $endpoint = implode('/', array_slice($segments, 1));
        
        switch ($endpoint) {
            case 'credits/balance':
                if ($method === 'GET') {
                    $userId = $_GET['user_id'] ?? null;
                    if (!$userId) {
                        sendError('User ID is required', 400);
                    }
                    
                    $result = $paymentIntegration->getCreditBalance($userId);
                    sendResponse($result);
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'credits/deduct':
                if ($method === 'POST') {
                    $input = json_decode(file_get_contents('php://input'), true);
                    $userId = $input['user_id'] ?? null;
                    $amount = $input['amount'] ?? 1;
                    
                    if (!$userId) {
                        sendError('User ID is required', 400);
                    }
                    
                    $result = $paymentIntegration->deductCredits($userId, $amount);
                    sendResponse($result);
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'credits/add':
                if ($method === 'POST') {
                    $input = json_decode(file_get_contents('php://input'), true);
                    $userId = $input['user_id'] ?? null;
                    $amount = $input['amount'] ?? 0;
                    $reason = $input['reason'] ?? 'credit_purchase';
                    
                    if (!$userId) {
                        sendError('User ID is required', 400);
                    }
                    
                    $result = $paymentIntegration->addCredits($userId, $amount, $reason);
                    sendResponse($result);
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'credits/history':
                if ($method === 'GET') {
                    $userId = $_GET['user_id'] ?? null;
                    $limit = $_GET['limit'] ?? 10;
                    
                    if (!$userId) {
                        sendError('User ID is required', 400);
                    }
                    
                    $result = $paymentIntegration->getCreditHistory($userId, $limit);
                    sendResponse([
                        'success' => true,
                        'transactions' => $result
                    ]);
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'tier/upgrade':
                if ($method === 'POST') {
                    $input = json_decode(file_get_contents('php://input'), true);
                    $userId = $input['user_id'] ?? null;
                    $tier = $input['tier'] ?? null;
                    $amount = $input['amount'] ?? 0;
                    
                    if (!$userId || !$tier) {
                        sendError('User ID and tier are required', 400);
                    }
                    
                    $result = $paymentIntegration->processTierUpgrade($userId, $tier, $amount);
                    sendResponse($result);
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'tier/pricing':
                if ($method === 'GET') {
                    $result = $paymentIntegration->getTierPricing();
                    sendResponse([
                        'success' => true,
                        'pricing' => $result
                    ]);
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'user/create':
                if ($method === 'POST') {
                    $input = json_decode(file_get_contents('php://input'), true);
                    $userId = $input['user_id'] ?? null;
                    
                    if (!$userId) {
                        sendError('User ID is required', 400);
                    }
                    
                    $result = $paymentIntegration->createOrUpdateUser($userId, $input);
                    sendResponse($result);
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            default:
                sendError('API endpoint not found', 404);
                break;
        }
    } else {
        sendError('API endpoint not found', 404);
    }
} else {
    sendError('Invalid path', 404);
}
?>
