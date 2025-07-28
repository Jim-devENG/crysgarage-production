@echo off
echo ========================================
echo Crys Garage - Setup Ruby Service
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Creating systemd service file...
ssh crysgarage "cat > /etc/systemd/system/crysgarage-ruby.service << 'EOF'
[Unit]
Description=Crys Garage Ruby Audio Processor
After=network.target

[Service]
Type=simple
User=nginx
WorkingDirectory=/var/www/crysgarage/crysgarage-ruby
ExecStart=/usr/bin/ruby mastering_server.rb
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF"
echo ✅ Service file created
echo.

echo Step 2: Reloading systemd...
ssh crysgarage "systemctl daemon-reload"
echo ✅ Systemd reloaded
echo.

echo Step 3: Enabling and starting service...
ssh crysgarage "systemctl enable crysgarage-ruby && systemctl start crysgarage-ruby"
echo ✅ Service started
echo.

echo Step 4: Checking service status...
ssh crysgarage "systemctl status crysgarage-ruby --no-pager"
echo.

echo Step 5: Checking if listening on port 4567...
ssh crysgarage "netstat -tlnp | grep :4567"
echo.

echo Step 6: Testing health endpoint...
ssh crysgarage "curl -s http://localhost:4567/health || echo 'Health check failed'"
echo.

echo ========================================
echo Ruby service setup complete!
echo ========================================
echo 🔧 Service: crysgarage-ruby
echo 📊 Status: systemctl status crysgarage-ruby
echo 📝 Logs: journalctl -u crysgarage-ruby -f
echo 🌐 Test: https://crysgarage.studio
echo.
pause 
