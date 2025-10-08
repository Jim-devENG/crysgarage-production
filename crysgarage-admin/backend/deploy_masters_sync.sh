#!/bin/bash

# Deploy real-time masters sync service
set -e

echo "Deploying CrysGarage Masters Sync Service..."

# Copy service file
sudo cp crysgarage-masters-sync.service /etc/systemd/system/
sudo chmod 644 /etc/systemd/system/crysgarage-masters-sync.service

# Make sync script executable
chmod +x realtime_masters_sync.py

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable crysgarage-masters-sync.service
sudo systemctl start crysgarage-masters-sync.service

# Check status
echo "Service status:"
sudo systemctl status crysgarage-masters-sync.service --no-pager

echo "Masters sync service deployed and started!"
echo "Check logs with: sudo journalctl -u crysgarage-masters-sync.service -f"
