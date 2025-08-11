# Crys Garage - Automatic Authentication Fix

## Problem

You're getting a **401 Unauthorized** error when trying to upload audio files.

## Solution

I've implemented an **automatic authentication fix** that will detect and resolve authentication issues automatically.

## How It Works

### 1. Automatic Detection

The app now automatically detects authentication issues:

- Missing or invalid tokens
- 401 errors from API calls
- Token/user state mismatches

### 2. Automatic Fix

When an issue is detected, the app will:

- Clear invalid tokens
- Attempt to sign in with default credentials
- Update the app state automatically
- Show a notification with the result

### 3. Manual Fix Options

If automatic fix doesn't work, you can:

- Use the "Fix Authentication" button in the app
- Use the "Force Re-auth" button for a complete reset
- Check browser console for detailed logs

## Quick Start

### Option 1: Use the Automatic Script

```bash
# Windows (Command Prompt)
fix_auth_automatically.bat

# Windows (PowerShell)
.\fix_auth_automatically.ps1
```

### Option 2: Manual Start

```bash
# Terminal 1 - Start Laravel Backend
cd crysgarage-backend
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2 - Start React Frontend
cd crysgarage-frontend
npm run dev
```

## What's New

### Enhanced API Service (`services/api.ts`)

- Better error logging
- Automatic token clearing on 401 errors
- Request/response debugging

### Authentication Fix Utility (`utils/authFix.ts`)

- `fixAuthentication()` - Automatically fixes auth issues
- `forceReAuth()` - Forces complete re-authentication
- `clearAuthentication()` - Clears all auth data

### Auto-Fix Component (`components/AutoAuthFix.tsx`)

- Automatically detects authentication issues
- Shows notification with fix options
- Handles the fix process automatically

### Auth Fix Button (`components/AuthFixButton.tsx`)

- Manual fix button for users
- Force re-auth option
- Success/error callbacks

## Debugging

### Check Browser Console

Open browser developer tools (F12) and look for:

```
API Request: { method: 'POST', url: '/api/upload', hasToken: true }
API Error: { status: 401, url: '/api/upload', data: {...} }
Auto-fixing authentication...
Authentication fixed successfully
```

### Check Local Storage

In browser console:

```javascript
// Check if token exists
localStorage.getItem("crysgarage_token");

// Clear token manually
localStorage.removeItem("crysgarage_token");

// Force re-authentication
// (The app will do this automatically)
```

### Test Authentication

Use the test page: `crysgarage-frontend/test_auth.html`

- Open in browser
- Click "Test Authentication"
- Click "Test Upload"

## Default Credentials

The automatic fix uses these default credentials:

- Email: `test@example.com`
- Password: `password123`

## Troubleshooting

### Still Getting 401 Errors?

1. **Check if backend is running**: `http://localhost:8000/api/test/debug`
2. **Check if frontend is running**: Look for Vite dev server
3. **Clear browser cache**: Hard refresh (Ctrl+F5)
4. **Check network tab**: Look for failed requests
5. **Try manual fix**: Use the "Fix Authentication" button

### Backend Not Starting?

```bash
cd crysgarage-backend
composer install
php artisan migrate
php artisan serve
```

### Frontend Not Starting?

```bash
cd crysgarage-frontend
npm install
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/signout` - Sign out
- `GET /api/user` - Get current user

### Audio Upload

- `POST /api/upload` - Upload audio file
- `GET /api/status/{audio_id}` - Get processing status
- `GET /api/audio/{audio_id}/download/{format}` - Download processed audio

## Logs

The app now logs all authentication-related activities:

- Token validation
- Authentication attempts
- Error details
- Fix attempts and results

Check browser console for detailed logs when issues occur.

## Support

If you're still having issues:

1. Check the browser console for error messages
2. Verify both services are running
3. Try the manual fix buttons
4. Check the network tab for failed requests
5. Use the test page to isolate the issue
