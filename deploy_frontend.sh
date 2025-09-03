#!/bin/bash

# Fast Frontend Deploy Script for Crys Garage
# This script deploys the updated frontend to the live server

echo "🚀 Starting fast frontend deployment..."

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

# Deploy using scp with progress
scp -r "$LOCAL_BUILD_PATH"/* "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"

if [ $? -eq 0 ]; then
    echo "✅ Frontend deployment completed successfully!"
    echo "🌐 Your updated site should be live at: https://crysgarage.studio"
    echo "🔄 Please test the authentication flow on the live server."
else
    echo "❌ Deployment failed. Please check your connection and try again."
    exit 1
fi

echo "🎉 Deployment script completed!"
