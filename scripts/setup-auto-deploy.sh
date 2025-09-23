#!/bin/bash

# Setup script for automatic deployment
# Run this on the VPS to prepare it for GitHub Actions deployment

set -e

echo "Setting up automatic deployment..."

# Ensure the crysgarage user has proper permissions
sudo chown -R crysgarage:crysgarage /opt/crysgarage
sudo chmod -R 755 /opt/crysgarage

# Create a deployment script
sudo tee /opt/crysgarage/deploy.sh > /dev/null << 'EOF'
#!/bin/bash
set -e

echo "Starting deployment..."

# Update repository
cd /opt/crysgarage
sudo -u crysgarage git pull origin master

# Update Python dependencies if requirements.txt changed
cd /opt/crysgarage/audio-mastering-service
if [ -f requirements.txt ]; then
    source .venv/bin/activate
    pip install -r requirements.txt
    deactivate
fi

# Restart services
sudo systemctl restart crysgarage-python.service
sudo systemctl restart nginx

echo "Deployment completed successfully!"
EOF

sudo chmod +x /opt/crysgarage/deploy.sh

# Create a systemd service for deployment
sudo tee /etc/systemd/system/crysgarage-deploy.service > /dev/null << 'EOF'
[Unit]
Description=Crysgarage Auto Deploy
After=network.target

[Service]
Type=oneshot
User=root
WorkingDirectory=/opt/crysgarage
ExecStart=/opt/crysgarage/deploy.sh
StandardOutput=journal
StandardError=journal
EOF

echo "Auto-deployment setup completed!"
echo ""
echo "Next steps:"
echo "1. Add these secrets to your GitHub repository:"
echo "   - VPS_HOST: 209.74.80.162"
echo "   - VPS_USERNAME: root"
echo "   - VPS_SSH_KEY: (your private SSH key content)"
echo ""
echo "2. Push this workflow to your repository"
echo "3. Every push to master/main will automatically deploy!"
