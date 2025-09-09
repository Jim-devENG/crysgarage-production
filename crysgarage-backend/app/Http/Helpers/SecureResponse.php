<?php

namespace App\Http\Helpers;

class SecureResponse
{
    /**
     * Create a secure API response that doesn't expose internal details
     */
    public static function success($data = null, $message = 'Success', $statusCode = 200)
    {
        $response = [
            'status' => 'success',
            'message' => $message,
            'timestamp' => now()->toISOString(),
        ];

        if ($data !== null) {
            $response['data'] = self::sanitizeData($data);
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Create a secure error response
     */
    public static function error($message = 'An error occurred', $statusCode = 400, $errors = null)
    {
        $response = [
            'status' => 'error',
            'message' => $message,
            'timestamp' => now()->toISOString(),
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Sanitize data to remove sensitive information
     */
    private static function sanitizeData($data)
    {
        if (is_array($data)) {
            $sanitized = [];
            foreach ($data as $key => $value) {
                // Remove sensitive keys
                if (in_array(strtolower($key), ['password', 'token', 'secret', 'key', 'path', 'file_path', 'internal_id'])) {
                    continue;
                }
                
                // Recursively sanitize nested arrays
                if (is_array($value)) {
                    $sanitized[$key] = self::sanitizeData($value);
                } else {
                    $sanitized[$key] = $value;
                }
            }
            return $sanitized;
        }

        return $data;
    }

    /**
     * Create a secure file response
     */
    public static function file($filePath, $filename = null, $headers = [])
    {
        if (!file_exists($filePath)) {
            return self::error('File not found', 404);
        }

        $filename = $filename ?: basename($filePath);
        
        $defaultHeaders = [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'X-Content-Type-Options' => 'nosniff',
        ];

        $headers = array_merge($defaultHeaders, $headers);

        return response()->download($filePath, $filename, $headers);
    }

    /**
     * Create a secure audio processing response
     */
    public static function processingResponse($fileId, $status = 'processing')
    {
        return self::success([
            'file_id' => $fileId,
            'status' => $status,
            'download_url' => '/api/download/' . $fileId,
            'expires_at' => now()->addHours(24)->toISOString(),
        ], 'Audio processing initiated');
    }
}
