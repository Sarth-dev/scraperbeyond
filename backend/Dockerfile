FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev \
    && docker-php-ext-install zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Create SQLite DB directory
RUN mkdir -p /tmp

# Expose port
EXPOSE 10000

# Start Laravel
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=10000
