#!/bin/bash

echo "🔧 Setting up Git hooks for automatic deployment"
echo "================================================"

# Navigate to the deployment directory
cd /var/www/crysgarage-deploy

# Create post-receive hook
echo "📝 Creating Git post-receive hook..."
cat > .git/hooks/post-receive << 'EOF'
#!/bin/bash

echo "🚀 Git hook triggered - deploying changes..."

# Navigate to the deployment directory
cd /var/www/crysgarage-deploy

# Pull latest changes
git pull origin master

# Restart Docker containers
docker-compose down
docker-compose up -d

# Wait for containers to start
sleep 10

# Test the application
curl -s -o /dev/null -w "Deployment Status: %{http_code}\n" https://crysgarage.studio/ 2>/dev/null || echo "Deployment test failed"

echo "✅ Automatic deployment completed!"
EOF

# Make the hook executable
chmod +x .git/hooks/post-receive

# Create a simple deployment script
echo "📝 Creating simple deployment script..."
cat > deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Simple deployment script"
echo "==========================="

cd /var/www/crysgarage-deploy

# Pull latest changes
git pull origin master

# Restart containers
docker-compose restart

echo "✅ Deployment completed!"
EOF

chmod +x deploy.sh

echo "✅ Git hooks setup completed!"
echo "📋 Available deployment methods:"
echo "   1. Run ./deploy.sh on VPS"
echo "   2. Use deploy_pipeline.bat from local"
echo "   3. Use quick_deploy.bat from local" 