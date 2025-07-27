@echo off
echo ========================================
echo Crys Garage FAST Deployment
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Testing connection...
ssh root@209.74.80.162 "echo 'Connected successfully'"

echo.
echo Step 2: Cleaning and preparing server...
ssh root@209.74.80.162 "rm -rf /var/www/crysgarage && mkdir -p /var/www/crysgarage"

echo.
echo Step 3: Installing all software at once...
ssh root@209.74.80.162 "dnf update -y && dnf install -y epel-release php php-fpm php-mysqlnd php-xml php-mbstring php-curl php-zip php-gd php-bcmath php-soap php-intl php-redis php-sqlite3 ruby ruby-devel ruby-bundler gcc gcc-c++ make ffmpeg mysql-server mysql nginx git unzip wget curl && curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - && dnf install -y nodejs && curl -sS https://getcomposer.org/installer | php && mv composer.phar /usr/local/bin/composer"

echo.
echo Step 4: Setting up MySQL...
ssh root@209.74.80.162 "systemctl start mysqld && systemctl enable mysqld && mysql -u root -e \"CREATE DATABASE IF NOT EXISTS crysgarage; CREATE USER IF NOT EXISTS 'crysgarage_user'@'localhost' IDENTIFIED BY 'CrysGarage2024!'; GRANT ALL PRIVILEGES ON crysgarage.* TO 'crysgarage_user'@'localhost'; FLUSH PRIVILEGES;\""

echo.
echo Step 5: Building frontend locally...
cd crysgarage-frontend
call npm run build
cd ..

echo.
echo Step 6: Creating deployment package...
if exist temp_deploy rmdir /s /q temp_deploy
mkdir temp_deploy
mkdir temp_deploy\crysgarage-backend
mkdir temp_deploy\crysgarage-frontend
mkdir temp_deploy\crysgarage-ruby

xcopy crysgarage-backend\* temp_deploy\crysgarage-backend\ /E /I /Y
xcopy crysgarage-frontend\dist\* temp_deploy\crysgarage-frontend\ /E /I /Y
xcopy crysgarage-ruby\* temp_deploy\crysgarage-ruby\ /E /I /Y

echo.
echo Step 7: Uploading ALL files at once...
scp -r temp_deploy\* root@209.74.80.162:/var/www/crysgarage/

echo.
echo Step 8: Installing dependencies on server...
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-backend && composer install --no-dev --optimize-autoloader && cd /var/www/crysgarage/crysgarage-ruby && bundle install"

echo.
echo Step 9: Setting permissions and creating services...
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage && chmod -R 755 /var/www/crysgarage && echo '[Unit]' > /etc/systemd/system/crysgarage-backend.service && echo 'Description=Crys Garage Backend' >> /etc/systemd/system/crysgarage-backend.service && echo 'After=network.target' >> /etc/systemd/system/crysgarage-backend.service && echo '[Service]' >> /etc/systemd/system/crysgarage-backend.service && echo 'Type=simple' >> /etc/systemd/system/crysgarage-backend.service && echo 'User=nginx' >> /etc/systemd/system/crysgarage-backend.service && echo 'WorkingDirectory=/var/www/crysgarage/crysgarage-backend' >> /etc/systemd/system/crysgarage-backend.service && echo 'ExecStart=/usr/bin/php artisan serve --host=0.0.0.0 --port=8000' >> /etc/systemd/system/crysgarage-backend.service && echo 'Restart=always' >> /etc/systemd/system/crysgarage-backend.service && echo '[Install]' >> /etc/systemd/system/crysgarage-backend.service && echo 'WantedBy=multi-user.target' >> /etc/systemd/system/crysgarage-backend.service"

ssh root@209.74.80.162 "echo '[Unit]' > /etc/systemd/system/crysgarage-ruby.service && echo 'Description=Crys Garage Ruby' >> /etc/systemd/system/crysgarage-ruby.service && echo 'After=network.target' >> /etc/systemd/system/crysgarage-ruby.service && echo '[Service]' >> /etc/systemd/system/crysgarage-ruby.service && echo 'Type=simple' >> /etc/systemd/system/crysgarage-ruby.service && echo 'User=nginx' >> /etc/systemd/system/crysgarage-ruby.service && echo 'WorkingDirectory=/var/www/crysgarage/crysgarage-ruby' >> /etc/systemd/system/crysgarage-ruby.service && echo 'ExecStart=/usr/bin/ruby mastering_server.rb' >> /etc/systemd/system/crysgarage-ruby.service && echo 'Restart=always' >> /etc/systemd/system/crysgarage-ruby.service && echo '[Install]' >> /etc/systemd/system/crysgarage-ruby.service && echo 'WantedBy=multi-user.target' >> /etc/systemd/system/crysgarage-ruby.service"

echo.
echo Step 10: Starting everything...
ssh root@209.74.80.162 "systemctl daemon-reload && systemctl enable crysgarage-backend && systemctl enable crysgarage-ruby && systemctl start crysgarage-backend && systemctl start crysgarage-ruby && echo 'server { listen 80; server_name crysgarage.studio www.crysgarage.studio; root /var/www/crysgarage/crysgarage-frontend; index index.html; location / { try_files \$uri \$uri/ /index.html; } location /api { proxy_pass http://127.0.0.1:8000; proxy_set_header Host \$host; proxy_set_header X-Real-IP \$remote_addr; proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto \$scheme; } location /audio { proxy_pass http://127.0.0.1:4567; proxy_set_header Host \$host; proxy_set_header X-Real-IP \$remote_addr; proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto \$scheme; } }' > /etc/nginx/conf.d/crysgarage.conf && systemctl start nginx && systemctl enable nginx && firewall-cmd --permanent --add-service=http && firewall-cmd --permanent --add-service=https && firewall-cmd --permanent --add-port=8000/tcp && firewall-cmd --permanent --add-port=4567/tcp && firewall-cmd --reload"

echo.
echo Step 11: Cleaning up...
rmdir /s /q temp_deploy

echo.
echo ========================================
echo FAST DEPLOYMENT COMPLETED!
echo ========================================
echo.
echo Your Crys Garage is now deployed!
echo Test at http://crysgarage.studio
echo.
pause 