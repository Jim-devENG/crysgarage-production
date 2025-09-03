<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Payment;

class PaystackController extends Controller
{
    private $secretKey;
    private $publicKey;

    public function __construct()
    {
        // Read from configuration (works with config cache)
        $this->secretKey = trim((string) config('paystack.secret', ''));
        $this->publicKey = trim((string) config('paystack.public', ''));
    }

    public function initializePayment(Request $request)
    {
        try {
            // Use framework JSON parsing; fallback to form data
            $payload = $request->json()->all();
            if (empty($payload)) {
                $payload = $request->all();
            }

            $amount = $payload['amount'] ?? null;
            $email = $payload['email'] ?? null;
            $reference = $payload['reference'] ?? null;
            $metadata = $payload['metadata'] ?? [];
            $callbackUrl = $payload['callback_url'] ?? null;

            // Normalize amount to integer cents to satisfy gateway validation
            if ($amount !== null) {
                $amount = (int) round((float) $amount);
            }

            Log::info('Paystack initialize request received', [
                'amount' => $amount,
                'email' => $email,
                'reference' => $reference,
                'metadata' => $metadata,
                'callback_url' => $callbackUrl
            ]);

            // Validate required fields
            if ($amount === null || $email === null || $reference === null) {
                return response()->json([
                    'status' => false,
                    'message' => 'Missing required fields: amount, email, reference'
                ], 400);
            }
            
            // Validate amount (USD cents). Minimum $1.00
            if ($amount < 100) {
                return response()->json([
                    'status' => false,
                    'message' => 'Amount must be at least 100 cents ($1.00)'
                ], 400);
            }

            // Try to get authenticated user first, then fallback to email lookup
            $user = $request->user();
            if (!$user) {
                // Fallback: Find user by email
                $user = User::where('email', $email)->first();
                if (!$user) {
                    // Create a temporary user record for payment processing
                    $user = User::create([
                        'name' => 'Guest User',
                        'email' => $email,
                        'password' => bcrypt('temp_password_' . time()),
                        'tier' => 'free',
                        'credits' => 0
                    ]);
                    Log::info('Created temporary user for payment', [
                        'user_id' => $user->id,
                        'email' => $user->email
                    ]);
                }
            }
            
            Log::info('User for payment', [
                'user_id' => $user->id,
                'email' => $user->email,
                'authenticated' => $request->user() ? 'yes' : 'no'
            ]);

            // Guard against missing credentials
            if (empty($this->secretKey)) {
                Log::error('Paystack secret key is missing or empty');
                return response()->json([
                    'success' => false,
                    'status' => 500,
                    'message' => 'Payment gateway not configured. Please contact support.'
                ], 500);
            }

            // Debug: log key fingerprint
            Log::info('Paystack key fingerprint', [
                'starts_with' => substr($this->secretKey, 0, 7),
                'length' => strlen($this->secretKey)
            ]);

            // Call Paystack API ensuring Authorization header format
            $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->secretKey,
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->post('https://api.paystack.co/transaction/initialize', [
                'amount' => $amount,
                'email' => $email,
                'reference' => $reference,
                'callback_url' => $callbackUrl ?? url('/payment/callback'),
                'metadata' => array_merge($metadata, [
                    'user_id' => $user->id,
                    'email' => $email,
                ]),
            ]);

            Log::info('Paystack API response', [
                'status' => $response->status(),
                'data' => $response->json()
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $authUrl = $data['data']['authorization_url'] ?? null;
                $ref = $data['data']['reference'] ?? $reference;

                // Create payment record
                Payment::create([
                    'user_id' => $user->id,
                    'reference' => $ref,
                    'amount' => $amount / 100, // Convert cents to USD for storage
                    'currency' => 'NGN',
                    'status' => 'pending',
                    'metadata' => json_encode($metadata)
                ]);

                return response()->json([
                    'status' => true,
                    'data' => [
                        'authorization_url' => $authUrl,
                        'reference' => $ref
                    ]
                ], 200);
            } else {
                $respJson = $response->json();
                Log::error('Paystack API failed', [
                    'status' => $response->status(),
                    'response' => $respJson
                ]);
                return response()->json([
                    'status' => false,
                    'error' => [
                        'message' => $respJson['message'] ?? 'Unknown error',
                        'code' => $respJson['code'] ?? 'unknown'
                    ]
                ], $response->status());
            }
        } catch (\Exception $e) {
            Log::error('Paystack initialization error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'paystack_response' => null,
                'status' => 500,
                'success' => false,
                'message' => 'Payment initialization failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function verifyPayment($reference)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->get("https://api.paystack.co/transaction/verify/{$reference}");

            if ($response->successful()) {
                $data = $response->json();
                
                // Update payment record
                $payment = Payment::where('reference', $reference)->first();
                if ($payment) {
                    $payment->update([
                        'status' => $data['data']['status'],
                        'gateway_response' => $data['data']['gateway_response'] ?? '',
                        'paid_at' => $data['data']['paid_at'] ?? null
                    ]);
                }

                return response()->json($data);
            } else {
                Log::error('Paystack verification failed', [
                    'reference' => $reference,
                    'response' => $response->json()
                ]);
                
                return response()->json([
                    'status' => false,
                    'message' => 'Payment verification failed'
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Paystack verification error', [
                'reference' => $reference,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Payment verification failed'
            ], 500);
        }
    }

    public function getPaymentHistory(Request $request)
    {
        try {
            $payments = Payment::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'status' => true,
                'data' => $payments
            ]);
        } catch (\Exception $e) {
            Log::error('Payment history error', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch payment history'
            ], 500);
        }
    }

    public function handleWebhook(Request $request)
    {
        try {
            $payload = $request->all();
            $signature = $request->header('X-Paystack-Signature');
            
            // Verify webhook signature
            if (!$this->verifyWebhookSignature($request->getContent(), $signature)) {
                Log::warning('Invalid Paystack webhook signature');
                return response()->json(['status' => 'error'], 400);
            }

            $event = $payload['event'];
            $data = $payload['data'];

            switch ($event) {
                case 'charge.success':
                    $this->handleSuccessfulPayment($data);
                    break;
                case 'transfer.success':
                    $this->handleSuccessfulTransfer($data);
                    break;
                default:
                    Log::info('Unhandled Paystack webhook event', ['event' => $event]);
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Webhook handling error', [
                'error' => $e->getMessage(),
                'payload' => $request->all()
            ]);
            
            return response()->json(['status' => 'error'], 500);
        }
    }

    private function verifyWebhookSignature($payload, $signature)
    {
        $computedSignature = hash_hmac('sha512', $payload, $this->secretKey);
        return hash_equals($computedSignature, $signature);
    }

    private function handleSuccessfulPayment($data)
    {
        try {
            $payment = Payment::where('reference', $data['reference'])->first();
            
            if ($payment) {
                $payment->update([
                    'status' => 'success',
                    'paid_at' => now()
                ]);

                // Add credits to user based on metadata
                $metadata = json_decode($payment->metadata, true);
                if (isset($metadata['credits'])) {
                    $user = User::find($payment->user_id);
                    if ($user) {
                        $user->increment('credits', $metadata['credits']);
                        Log::info('Credits added to user', [
                            'user_id' => $user->id,
                            'credits_added' => $metadata['credits']
                        ]);
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Error handling successful payment', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
        }
    }

    private function handleSuccessfulTransfer($data)
    {
        // Handle successful transfers if needed
        Log::info('Successful transfer received', $data);
    }
}
