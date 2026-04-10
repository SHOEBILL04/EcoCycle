#!/usr/bin/env sh
set -eu

PORT="${PORT:-8080}"

php artisan optimize:clear
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link || true
php artisan config:cache
php artisan view:cache

exec php artisan serve --host=0.0.0.0 --port="$PORT"
