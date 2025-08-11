@echo off
echo ========================================
echo Crys Garage - Complete Nginx & Ruby Clean Install
echo ========================================
echo.

echo [1/8] Stopping all services...
ssh root@209.74.80.162 "systemctl stop crysgarage-backend crysgarage-ruby nginx"
if %errorlevel% neq 0 echo Warning: Some services may not have stopped properly

echo [2/8] Killing all related processes...
ssh root@209.74.80.162 "pkill -f nginx && pkill -f ruby && pkill -f puma && pkill -f sinatra && sleep 3"
if %errorlevel% neq 0 echo Warning: Some processes may still be running

echo [3/8] Completely removing Nginx...
ssh root@209.74.80.162 "apt-get remove --purge nginx nginx-common nginx-full -y"
ssh root@209.74.80.162 "apt-get autoremove -y"
ssh root@209.74.80.162 "rm -rf /etc/nginx /var/log/nginx /var/cache/nginx /run/nginx.pid"
ssh root@209.74.80.162 "rm -f /etc/systemd/system/nginx.service"

echo [4/8] Cleaning up Ruby/RVM completely...
ssh root@209.74.80.162 "rm -rf /usr/local/rvm"
ssh root@209.74.80.162 "rm -rf /var/www/crysgarage/crysgarage-ruby"
ssh root@209.74.80.162 "rm -f /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.80.162 "systemctl daemon-reload"

echo [5/8] Installing fresh Nginx...
ssh root@209.74.80.162 "apt-get update"
ssh root@209.74.80.162 "apt-get install nginx -y"
ssh root@209.74.80.162 "systemctl enable nginx"
ssh root@209.74.80.162 "systemctl start nginx"

echo [6/8] Installing fresh Ruby with RVM...
ssh root@209.74.80.162 "curl -sSL https://get.rvm.io | bash -s stable"
ssh root@209.74.80.162 "source /etc/profile.d/rvm.sh && rvm install 3.0.0"
ssh root@209.74.80.162 "source /etc/profile.d/rvm.sh && rvm use 3.0.0 --default"
ssh root@209.74.80.162 "source /etc/profile.d/rvm.sh && gem install bundler"

echo [7/8] Recreating Ruby application...
ssh root@209.74.80.162 "mkdir -p /var/www/crysgarage/crysgarage-ruby"
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-ruby && cat > Gemfile << 'EOF'
source 'https://rubygems.org'

gem 'sinatra', '~> 3.0'
gem 'json', '~> 2.6'
gem 'fileutils', '~> 1.6'
gem 'securerandom', '~> 0.2'
gem 'sinatra-cors', '~> 1.0'

group :development do
  gem 'puma', '~> 6.0'
  gem 'rack', '~> 2.2'
end
EOF"

ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-ruby && source /etc/profile.d/rvm.sh && bundle install"

echo [8/8] Recreating Ruby service files...
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-ruby && cat > start_ruby_service.sh << 'EOF'
#!/bin/bash
source /etc/profile.d/rvm.sh
cd /var/www/crysgarage/crysgarage-ruby
exec bundle exec ruby mastering_server.rb
EOF"

ssh root@209.74.80.162 "chmod +x /var/www/crysgarage/crysgarage-ruby/start_ruby_service.sh"

ssh root@209.74.80.162 "cat > /etc/systemd/system/crysgarage-ruby.service << 'EOF'
[Unit]
Description=Crys Garage Ruby Audio Processor
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/var/www/crysgarage/crysgarage-ruby
ExecStart=/var/www/crysgarage/crysgarage-ruby/start_ruby_service.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF"

ssh root@209.74.80.162 "systemctl daemon-reload"
ssh root@209.74.80.162 "systemctl enable crysgarage-ruby"
ssh root@209.74.80.162 "systemctl start crysgarage-ruby"

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Checking service status...
ssh root@209.74.80.162 "systemctl status nginx crysgarage-ruby --no-pager"
echo.
echo Testing Nginx...
ssh root@209.74.80.162 "curl -s -o /dev/null -w '%%{http_code}' http://localhost"
echo.
echo Testing Ruby service...
ssh root@209.74.80.162 "curl -s -o /dev/null -w '%%{http_code}' http://localhost:4567"
echo.
echo ========================================
echo Clean installation completed!
echo ========================================
pause