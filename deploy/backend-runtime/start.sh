#!/bin/bash
set -e

# Purge any stale Laravel cached files that may reference missing providers
rm -f bootstrap/cache/*.php || true

# Ensure .env exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        echo "APP_ENV=production" > .env
        echo "APP_KEY=" >> .env
        echo "APP_DEBUG=false" >> .env
        echo "APP_URL=http://localhost" >> .env
        echo "DB_CONNECTION=sqlite" >> .env
        echo "DB_DATABASE=:memory:" >> .env
    fi
fi

# Install Composer dependencies if vendor directory is missing
if [ ! -d vendor ]; then
    composer install --no-dev --prefer-dist --no-interaction --no-progress
fi

# Generate application key if missing
if grep -q "APP_KEY=$" .env; then
    php artisan key:generate
fi

# Clear and cache configuration
php artisan config:clear
php artisan config:cache

# Run Laravel development server
php artisan serve --host 0.0.0.0 --port 8000

