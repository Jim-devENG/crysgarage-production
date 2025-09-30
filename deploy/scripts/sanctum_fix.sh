#!/bin/sh
set -e
cd /var/www

# Ensure dependencies
composer require laravel/sanctum:^4 -W --no-interaction --no-progress || true

# Ensure .env exists (fallback minimal for production)
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env || true
  else
    cat > .env <<EOF
APP_NAME=CrysGarage
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://localhost
LOG_CHANNEL=stack
LOG_LEVEL=info
DB_CONNECTION=sqlite
DB_DATABASE=:memory:
EOF
  fi
fi

# Generate key and cache config
php artisan key:generate || true
php artisan config:cache || true
echo "SANCTUM_FIX_DONE"

