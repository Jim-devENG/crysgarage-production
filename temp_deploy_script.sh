#!/bin/bash
set -e

# Clear the web directory
rm -rf /var/www/html/*

# Copy files from temp to web directory
cp -r /tmp/frontend/* /var/www/html/

# Set proper permissions
chown -R nginx:nginx /var/www/html/
chmod -R 755 /var/www/html/

# Test and reload nginx
nginx -t
systemctl reload nginx

echo "Deployment completed successfully"