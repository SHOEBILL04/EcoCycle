## EcoCycle Backend

Laravel API backend for EcoCycle.

## Production Deploy

Recommended Render configuration:

- Root directory: `backend`
- Runtime: Docker
- Exposed port: `8080`
- Start command: handled by the Docker image via `scripts/start-production.sh`

The production startup script does the following on boot:

- clears stale caches
- runs `php artisan migrate --force`
- runs `php artisan db:seed --force`
- creates the public storage symlink if needed
- rebuilds Laravel caches
- starts the app on `0.0.0.0:$PORT`

## Required Environment Variables

- `APP_KEY`
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL`
- `DB_CONNECTION=pgsql`
- `DB_HOST`
- `DB_PORT=5432`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_SSLMODE=require`

Optional seeded account passwords:

- `SEED_ADMIN_PASSWORD`
- `SEED_MODERATOR_PASSWORD`
- `SEED_TEST_PASSWORD`

## Seeded Accounts

The production seed is idempotent, so it can run safely on repeated deploys.

- Admin: `rockstar@gmail.com`
- Moderator: `moderator@ecocycle.com`
- Citizen: `test@example.com`
