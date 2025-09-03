#!/bin/bash

# Fast Frontend Deploy Script for Crys Garage (No Auth Prompts)
# This script deploys the updated frontend to the live server using SSH key auth

echo "🚀 Starting fast frontend deployment (no auth prompts)..."

# Set variables
SERVER_IP="209.74.80.162"
SERVER_USER="root"
SERVER_PATH="/var/www/html"
LOCAL_BUILD_PATH="crysgarage-frontend/dist"

# Check if build directory exists
if [ ! -d "$LOCAL_BUILD_PATH" ]; then
    echo "❌ Build directory not found. Please run 'npm run build' first."
    exit 1
fi

echo "📦 Deploying frontend files to $SERVER_USER@$SERVER_IP:$SERVER_PATH"

# Deploy using scp with SSH key authentication (no password prompts)
# The -o BatchMode=yes option ensures no password prompts
scp -o BatchMode=yes -o StrictHostKeyChecking=no -r "$LOCAL_BUILD_PATH"/* "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"

if [ $? -eq 0 ]; then
    echo "✅ Frontend deployment completed successfully!"
    echo "🌐 Your updated site should be live at: https://crysgarage.studio"
    echo "🔄 Please test the authentication flow on the live server."
    
    # Clear browser cache hint
    echo "💡 Tip: If you don't see changes, try hard refresh (Ctrl+F5) or clear browser cache"
else
    echo "❌ Deployment failed. Please check your SSH key setup and try again."
    echo "🔑 Make sure your SSH key is added to the server's authorized_keys"
    exit 1
fi

echo "🎉 Deployment script completed!"
