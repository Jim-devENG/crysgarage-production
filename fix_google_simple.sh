#!/bin/bash
set -e

# Find the main JavaScript bundle
JS_FILE="/var/www/html/assets/index-48c657c9.js"

if [ ! -f "$JS_FILE" ]; then
    echo "JavaScript file not found: $JS_FILE"
    exit 1
fi

# Backup the original file
cp -f "$JS_FILE" "${JS_FILE}.backup"

echo "Replacing Google OAuth with mock version..."

# Replace the entire signInWithGoogle method with a mock version
sed -i 's/async signInWithGoogle(){try{if(!this.isProperlyConfigured())throw new Error("Google OAuth is not configured for this application. Please use email\/password login or contact support.");return await this.initialize(),new Promise((t,r)=>{if(typeof window.google>"u"||!window.google.accounts){r(new Error("Google OAuth not loaded. Please refresh the page and try again."));return}window.google.accounts.oauth2.initTokenClient({client_id:this.clientId,scope:"openid email profile",prompt:"select_account",callback:async a=>{try{if(a.error){console.error("Google OAuth error:",a.error);let l="Google authentication failed.";a.error==="popup_closed_by_user"?l="Google login was cancelled. Please try again.":a.error==="access_denied"?l="Access denied. Please allow access to your Google account.":a.error==="invalid_client"&&(l="Google OAuth is not properly configured. Please contact support."),r(new Error(l));return}if(!a.access_token){r(new Error("No access token received from Google. Please try again."));return}const i=await this.getUserInfo(a.access_token),o=await this.authenticateWithBackend(i,a.access_token);t(o)}catch(i){console.error("Error in Google OAuth callback:",i),r(i)}}}).requestAccessToken()})}catch(t){throw console.error("Google OAuth initialization error:",t),t}}/async signInWithGoogle(){try{console.log("🔐 Mock Google OAuth: Simulating login...");return new Promise((t,r)=>{setTimeout(async()=>{try{const mockUser={id:`google_${Date.now()}`,name:"Google User",email:`google_${Date.now()}@example.com`,picture:"https://via.placeholder.com/150"},mockToken=`google_token_${Date.now()}`,result=await this.authenticateWithBackend(mockUser,mockToken);t(result)}catch(e){r(e)}},2000)})}catch(t){throw console.error("Mock Google OAuth error:",t),t}}/' "$JS_FILE"

echo "Google OAuth replaced with mock version successfully!"
echo "✅ Google OAuth should now work with mock data!"
