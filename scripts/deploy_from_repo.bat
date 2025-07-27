@echo off
echo ========================================
echo Crys Garage - Deploy from GitHub
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo Repo: https://github.com/Jim-devENG/crys-garage.git
echo.

echo Step 1: Testing connection...
ssh root@209.74.80.162 "echo 'Connected successfully'"

echo.
echo Step 2: Cleaning existing installation...
ssh root@209.74.80.162 "rm -rf /var/www/crysgarage && mkdir -p /var/www/crysgarage"

echo.
echo Step 3: Installing software...
ssh root@209.74.80.162 "dnf update -y && dnf install -y epel-release php php-fpm php-mysqlnd php-xml php-mbstring php-curl php-zip php-gd php-bcmath php-soap php-intl php-redis php-sqlite3 ruby ruby-devel ruby-bundler gcc gcc-c++ make ffmpeg mysql-server mysql nginx git unzip wget curl && curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - && dnf install -y nodejs && curl -sS https://getcomposer.org/installer | php && mv composer.phar /usr/local/bin/composer"

echo.
echo Step 4: Setting up MySQL...
ssh root@209.74.80.162 "systemctl start mysqld && systemctl enable mysqld && mysql -u root -e \"CREATE DATABASE IF NOT EXISTS crysgarage; CREATE USER IF NOT EXISTS 'crysgarage_user'@'localhost' IDENTIFIED BY 'CrysGarage2024!'; GRANT ALL PRIVILEGES ON crysgarage.* TO 'crysgarage_user'@'localhost'; FLUSH PRIVILEGES;\"" 

echo.
echo Step 5: Cloning from GitHub...
ssh root@209.74.80.162 "cd /var/www && git clone https://github.com/Jim-devENG/crys-garage.git crysgarage"

echo.
echo Step 6: Building frontend on server...
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-frontend && npm install && npm run build"

echo.
echo Step 7: Installing backend dependencies...
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-backend && composer install --no-dev --optimize-autoloader"

echo.
echo Step 8: Installing Ruby dependencies...
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-ruby && bundle install"

echo.
echo Step 9: Setting permissions...
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage && chmod -R 755 /var/www/crysgarage"

echo.
echo Step 10: Creating services...
ssh root@209.74.80.162 "echo '[Unit]' > /etc/systemd/system/crysgarage-backend.service && echo 'Description=Crys Garage Backend' >> /etc/systemd/system/crysgarage-backend.service && echo 'After=network.target' >> /etc/systemd/system/crysgarage-backend.service && echo '[Service]' >> /etc/systemd/system/crysgarage-backend.service && echo 'Type=simple' >> /etc/systemd/system/crysgarage-backend.service && echo 'User=nginx' >> /etc/systemd/system/crysgarage-backend.service && echo 'WorkingDirectory=/var/www/crysgarage/crysgarage-backend' >> /etc/systemd/system/crysgarage-backend.service && echo 'ExecStart=/usr/bin/php artisan serve --host=0.0.0.0 --port=8000' >> /etc/systemd/system/crysgarage-backend.service && echo 'Restart=always' >> /etc/systemd/system/crysgarage-backend.service && echo '[Install]' >> /etc/systemd/system/crysgarage-backend.service && echo 'WantedBy=multi-user.target' >> /etc/systemd/system/crysgarage-backend.service"

ssh root@209.74.80.162 "echo '[Unit]' > /etc/systemd/system/crysgarage-ruby.service && echo 'Description=Crys Garage Ruby' >> /etc/systemd/system/crysgarage-ruby.service && echo 'After=network.target' >> /etc/systemd/system/crysgarage-ruby.service && echo '[Service]' >> /etc/systemd/system/crysgarage-ruby.service && echo 'Type=simple' >> /etc/systemd/system/crysgarage-ruby.service && echo 'User=nginx' >> /etc/systemd/system/crysgarage-ruby.service && echo 'WorkingDirectory=/var/www/crysgarage/crysgarage-ruby' >> /etc/systemd/system/crysgarage-ruby.service && echo 'ExecStart=/usr/bin/ruby mastering_server.rb' >> /etc/systemd/system/crysgarage-ruby.service && echo 'Restart=always' >> /etc/systemd/system/crysgarage-ruby.service && echo '[Install]' >> /etc/systemd/system/crysgarage-ruby.service && echo 'WantedBy=multi-user.target' >> /etc/systemd/system/crysgarage-ruby.service"

echo.
echo Step 11: Starting services...
ssh root@209.74.80.162 "systemctl daemon-reload && systemctl enable crysgarage-backend && systemctl enable crysgarage-ruby && systemctl start crysgarage-backend && systemctl start crysgarage-ruby"

echo.
echo Step 12: Configuring Nginx...
ssh root@209.74.80.162 "echo 'server { listen 80; server_name crysgarage.studio www.crysgarage.studio; root /var/www/crysgarage/crysgarage-frontend/dist; index index.html; location / { try_files \$uri \$uri/ /index.html; } location /api { proxy_pass http://127.0.0.1:8000; proxy_set_header Host \$host; proxy_set_header X-Real-IP \$remote_addr; proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto \$scheme; } location /audio { proxy_pass http://127.0.0.1:4567; proxy_set_header Host \$host; proxy_set_header X-Real-IP \$remote_addr; proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto \$scheme; } }' > /etc/nginx/conf.d/crysgarage.conf && systemctl start nginx && systemctl enable nginx && firewall-cmd --permanent --add-service=http && firewall-cmd --permanent --add-service=https && firewall-cmd --permanent --add-port=8000/tcp && firewall-cmd --permanent --add-port=4567/tcp && firewall-cmd --reload"

echo.
echo ========================================
echo DEPLOYMENT FROM REPO COMPLETED!
echo ========================================
echo.
echo Your Crys Garage is now deployed from GitHub!
echo Test at http://crysgarage.studio
echo.
echo To update in the future:
echo 1. Push changes to GitHub
echo 2. Run: ssh root@209.74.80.162 "cd /var/www/crysgarage && git pull && cd crysgarage-frontend && npm run build && cd ../crysgarage-backend && composer install && systemctl restart crysgarage-backend"
echo.
pause 