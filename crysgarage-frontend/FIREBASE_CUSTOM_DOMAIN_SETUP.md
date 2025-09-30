# Firebase Custom Domain Setup

## Problem
The Google OAuth modal shows "Continue to crys-garage-61dd7.firebaseapp.com" instead of your custom domain "crysgarage.studio".

## Solution
You need to configure Firebase Console to allow your custom domain for authentication.

## Steps to Fix

### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com/
- Select your project: `crys-garage-61dd7`

### 2. Configure Authentication Domain
- Go to **Authentication** → **Settings** → **Authorized domains**
- Click **Add domain**
- Add: `crysgarage.studio`
- Add: `localhost` (for local development)
- Add: `127.0.0.1` (for local development)

### 3. Configure Google OAuth (if needed)
- Go to **Authentication** → **Sign-in method**
- Click on **Google** provider
- In **Authorized domains**, make sure your custom domain is listed
- Add `crysgarage.studio` if not already there

### 4. Update OAuth Consent Screen (Google Cloud Console)
- Go to: https://console.cloud.google.com/
- Select project: `crys-garage-61dd7`
- Go to **APIs & Services** → **OAuth consent screen**
- In **Authorized domains**, add: `crysgarage.studio`

### 5. Test the Changes
After making these changes:
1. Deploy your updated frontend code
2. Test Google authentication on your live site
3. The modal should now show "Continue to crysgarage.studio"

## Current Configuration
- **Custom Domain**: crysgarage.studio
- **Firebase Project**: crys-garage-61dd7
- **Auth Domain**: crysgarage.studio (updated in code)

## Notes
- Changes may take a few minutes to propagate
- Clear browser cache if you still see the old domain
- Make sure your DNS is properly configured to point to your server

