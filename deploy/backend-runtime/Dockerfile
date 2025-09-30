FROM php:8.2-cli
WORKDIR /var/www
RUN apt-get update \
  && apt-get install -y --no-install-recommends git unzip zlib1g-dev libzip-dev \
  && docker-php-ext-configure zip \
  && docker-php-ext-install pdo pdo_mysql zip \
  && rm -rf /var/lib/apt/lists/*
# provide composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
# copy app from build context at compose time
COPY . /var/www
# permissions
RUN mkdir -p storage bootstrap/cache \
  && chown -R www-data:www-data storage bootstrap/cache \
  && chmod -R u+rwX,g+rwX storage bootstrap/cache
## provide a minimal .env at build time so container can boot
RUN if [ ! -f .env ]; then \
      if [ -f .env.example ]; then cp .env.example .env; \
      else printf "APP_ENV=production\nAPP_KEY=\nAPP_DEBUG=false\nAPP_URL=http://localhost\nDB_CONNECTION=sqlite\nDB_DATABASE=:memory:\n" > .env; fi; \
    fi
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh
EXPOSE 8000
CMD ["/usr/local/bin/start.sh"]

