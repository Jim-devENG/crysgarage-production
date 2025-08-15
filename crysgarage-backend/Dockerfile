FROM php:8.2-fpm

# Install system dependencies with proper cleanup
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy composer files first
COPY composer*.json ./

# Install PHP dependencies (skip scripts to avoid artisan issues)
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Copy application code
COPY . .

# Set permissions
RUN chown -R www-data:www-data /var/www

EXPOSE 8000

# Start simple PHP server instead of Laravel artisan
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"] 