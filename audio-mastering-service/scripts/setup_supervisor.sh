#!/bin/bash

# Setup Supervisor for Crys Garage Audio Mastering Service
# This script configures supervisor to manage the FastAPI service

set -e

echo "Setting up Supervisor for Crys Garage Audio Mastering Service..."

# Install supervisor if not already installed
if ! command -v supervisord &> /dev/null; then
    echo "Installing supervisor..."
    apt-get update
    apt-get install -y supervisor
fi

# Create supervisor configuration directory if it doesn't exist
mkdir -p /etc/supervisor/conf.d

# Copy supervisor configuration
echo "Copying supervisor configuration..."
cp supervisor/crysgarage-python.conf /etc/supervisor/conf.d/

# Create log directories
mkdir -p /var/log
touch /var/log/crysgarage-python.log
touch /var/log/crysgarage-python-error.log

# Set proper permissions
chown root:root /etc/supervisor/conf.d/crysgarage-python.conf
chmod 644 /etc/supervisor/conf.d/crysgarage-python.conf

# Reload supervisor configuration
echo "Reloading supervisor configuration..."
supervisorctl reread
supervisorctl update

# Start the service
echo "Starting Crys Garage Python service..."
supervisorctl start crysgarage-python

# Check status
echo "Service status:"
supervisorctl status crysgarage-python

echo "Supervisor setup complete!"
echo "Use 'supervisorctl status' to check service status"
echo "Use 'supervisorctl restart crysgarage-python' to restart the service"
echo "Use 'supervisorctl tail -f crysgarage-python' to view logs"
