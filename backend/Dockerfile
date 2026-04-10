FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y 
    git 
    curl 
    libpng-dev 
    libonig-dev 
    libxml2-dev 
    zip 
    unzip 
    libpq-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy existing application directory contents
COPY . /var/www

# Install composer dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Expose port 8080
EXPOSE 8080

# Start PHP-FPM and use built-in server for simplicity in free tiers
CMD php artisan serve --host=0.0.0.0 --port=8080
