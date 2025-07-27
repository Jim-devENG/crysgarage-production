@echo off
echo ========================================
echo Crys Garage Fresh Deployment to VPS
echo ========================================
echo.
echo Server: 209.74.80.162 (crysgarage.studio)
echo OS: AlmaLinux 8
echo.
echo WARNING: This will COMPLETELY OVERRIDE existing installation!
echo.
pause

echo.
echo Step 1: Testing SSH connection...
ssh root@209.74.80.162 "echo 'Connection successful'"
if %errorlevel% neq 0 (
    echo ERROR: SSH connection failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Cleaning existing installation...
ssh root@209.74.80.162 "systemctl stop crysgarage-backend 2>/dev/null || true"
ssh root@209.74.80.162 "systemctl stop crysgarage-ruby 2>/dev/null || true"
ssh root@209.74.80.162 "systemctl stop nginx 2>/dev/null || true"
ssh root@209.74.80.162 "rm -rf /var/www/crysgarage"
ssh root@209.74.80.162 "rm -f /etc/systemd/system/crysgarage-*.service"
ssh root@209.74.80.162 "rm -f /etc/nginx/conf.d/crysgarage.conf"

echo.
echo Step 3: Installing dependencies...
ssh root@209.74.80.162 "dnf update -y"
ssh root@209.74.80.162 "dnf install -y epel-release"
ssh root@209.74.80.162 "dnf install -y php php-fpm php-mysqlnd php-xml php-mbstring php-curl php-zip php-gd php-bcmath php-soap php-intl php-redis php-sqlite3"
ssh root@209.74.80.162 "curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -"
ssh root@209.74.80.162 "dnf install -y nodejs"
ssh root@209.74.80.162 "dnf install -y ruby ruby-devel ruby-bundler gcc gcc-c++ make"
ssh root@209.74.80.162 "curl -sS https://getcomposer.org/installer | php"
ssh root@209.74.80.162 "mv composer.phar /usr/local/bin/composer"
ssh root@209.74.80.162 "dnf install -y ffmpeg mysql-server mysql nginx git unzip wget curl"

echo.
echo Step 4: Setting up MySQL...
ssh root@209.74.80.162 "systemctl start mysqld"
ssh root@209.74.80.162 "systemctl enable mysqld"
ssh root@209.74.80.162 "mysql -u root -e \"CREATE DATABASE IF NOT EXISTS crysgarage;\""
ssh root@209.74.80.162 "mysql -u root -e \"CREATE USER IF NOT EXISTS 'crysgarage_user'@'localhost' IDENTIFIED BY 'CrysGarage2024!';\""
ssh root@209.74.80.162 "mysql -u root -e \"GRANT ALL PRIVILEGES ON crysgarage.* TO 'crysgarage_user'@'localhost';\""
ssh root@209.74.80.162 "mysql -u root -e \"FLUSH PRIVILEGES;\""

echo.
echo Step 5: Creating directories...
ssh root@209.74.80.162 "mkdir -p /var/www/crysgarage/crysgarage-backend"
ssh root@209.74.80.162 "mkdir -p /var/www/crysgarage/crysgarage-frontend"
ssh root@209.74.80.162 "mkdir -p /var/www/crysgarage/crysgarage-ruby"
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage"

echo.
echo Step 6: Deploying backend...
scp -r crysgarage-backend\* root@209.74.80.162:/var/www/crysgarage/crysgarage-backend/

echo.
echo Step 7: Building and deploying frontend...
cd crysgarage-frontend
call npm run build
cd ..
scp -r crysgarage-frontend\dist\* root@209.74.80.162:/var/www/crysgarage/crysgarage-frontend/

echo.
echo Step 8: Deploying Ruby processor...
scp -r crysgarage-ruby\* root@209.74.80.162:/var/www/crysgarage/crysgarage-ruby/

echo.
echo Step 9: Installing dependencies on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-backend && composer install --no-dev --optimize-autoloader"
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-frontend && npm install && npm run build"
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-ruby && bundle install"

echo.
echo Step 10: Setting up services...
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage"
ssh root@209.74.80.162 "chmod -R 755 /var/www/crysgarage/crysgarage-backend/storage"
ssh root@209.74.80.162 "chmod -R 755 /var/www/crysgarage/crysgarage-backend/bootstrap/cache"

echo.
echo Step 11: Creating systemd services...
ssh root@209.74.80.162 "echo '[Unit]' > /etc/systemd/system/crysgarage-backend.service"
ssh root@209.74.80.162 "echo 'Description=Crys Garage Laravel Backend' >> /etc/systemd/system/crysgarage-backend.service"
ssh root@209.74.80.162 "echo 'After=network.target' >> /etc/systemd/system/crysgarage-backend.service"
ssh root@209.74.80.162 "echo '' >> /etc/systemd/system/crysgarage-backend.service"
ssh root@209.74.80.162 "echo '[Service]' >> /etc/systemd/system/crysgarage-backend.service"
ssh root@209.74.80.162 "echo 'Type=simple' >> /etc/systemd/system/crysgarage-backend.service"
ssh root@209.74.80.162 "echo 'User=nginx' >> /etc/systemd/system/crysgarage-backend.service"
ssh root@209.74.80.162 "echo 'Group=nginx' >> /etc/systemd/system/crysgarage-backend.service"
ssh root@209.74.80.162 "echo 'WorkingDirectory=/var/www/crysgarage/crysgarage-backend' >> /etc/systemd/system/crysgarage-backend.service"
ssh root@209.74.80.162 "echo 'ExecStart=/usr/bin/php artisan serve --host=0.0.0.0 --port=8000' >> /etc/systemd/system/crysgarage-backend.service"
ssh root@209.74.80.162 "echo 'Restart=always' >> /etc/systemd/system/crysgarage-backend.service"
ssh root@209.74.80.162 "echo 'RestartSec=10' >> /etc/systemd/system/crysgarage-backend.service"
ssh root@209.74.80.162 "echo '' >> /etc/systemd/system/crysgarage-backend.service"
ssh root@209.74.80.162 "echo '[Install]' >> /etc/systemd/system/crysgarage-backend.service"
ssh root@209.74.80.162 "echo 'WantedBy=multi-user.target' >> /etc/systemd/system/crysgarage-backend.service"

ssh root@209.74.80.162 "echo '[Unit]' > /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.74.80.162 "echo 'Description=Crys Garage Ruby Audio Processor' >> /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.74.80.162 "echo 'After=network.target' >> /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.74.80.162 "echo '' >> /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.74.80.162 "echo '[Service]' >> /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.74.80.162 "echo 'Type=simple' >> /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.74.80.162 "echo 'User=nginx' >> /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.74.80.162 "echo 'Group=nginx' >> /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.74.80.162 "echo 'WorkingDirectory=/var/www/crysgarage/crysgarage-ruby' >> /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.74.80.162 "echo 'ExecStart=/usr/bin/ruby mastering_server.rb' >> /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.74.80.162 "echo 'Restart=always' >> /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.74.80.162 "echo 'RestartSec=10' >> /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.74.80.162 "echo '' >> /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.74.80.162 "echo '[Install]' >> /etc/systemd/system/crysgarage-ruby.service"
ssh root@209.74.80.162 "echo 'WantedBy=multi-user.target' >> /etc/systemd/system/crysgarage-ruby.service"

echo.
echo Step 12: Starting services...
ssh root@209.74.80.162 "systemctl daemon-reload"
ssh root@209.74.80.162 "systemctl enable crysgarage-backend"
ssh root@209.74.80.162 "systemctl enable crysgarage-ruby"
ssh root@209.74.80.162 "systemctl start crysgarage-backend"
ssh root@209.74.80.162 "systemctl start crysgarage-ruby"

echo.
echo Step 13: Configuring Nginx...
ssh root@209.74.80.162 "echo 'server {' > /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '    listen 80;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '    server_name crysgarage.studio www.crysgarage.studio;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '    root /var/www/crysgarage/crysgarage-frontend;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '    index index.html;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '    location / {' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '        try_files \$uri \$uri/ /index.html;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '    }' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '    location /api {' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '        proxy_pass http://127.0.0.1:8000;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '        proxy_set_header Host \$host;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '        proxy_set_header X-Real-IP \$remote_addr;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '        proxy_set_header X-Forwarded-Proto \$scheme;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '    }' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '    location /audio {' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '        proxy_pass http://127.0.0.1:4567;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '        proxy_set_header Host \$host;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '        proxy_set_header X-Real-IP \$remote_addr;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '        proxy_set_header X-Forwarded-Proto \$scheme;' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '    }' >> /etc/nginx/conf.d/crysgarage.conf"
ssh root@209.74.80.162 "echo '}' >> /etc/nginx/conf.d/crysgarage.conf"

echo.
echo Step 14: Starting Nginx and firewall...
ssh root@209.74.80.162 "systemctl start nginx"
ssh root@209.74.80.162 "systemctl enable nginx"
ssh root@209.74.80.162 "firewall-cmd --permanent --add-service=http"
ssh root@209.74.80.162 "firewall-cmd --permanent --add-service=https"
ssh root@209.74.80.162 "firewall-cmd --permanent --add-port=8000/tcp"
ssh root@209.74.80.162 "firewall-cmd --permanent --add-port=4567/tcp"
ssh root@209.74.80.162 "firewall-cmd --reload"

echo.
echo ========================================
echo DEPLOYMENT COMPLETED!
echo ========================================
echo.
echo Your Crys Garage application is now deployed!
echo.
echo Next steps:
echo 1. Configure .env file in /var/www/crysgarage/crysgarage-backend/
echo 2. Run migrations: php artisan migrate
echo 3. Set up SSL certificate
echo 4. Test at http://crysgarage.studio
echo.
pause 