# EcoCycle CI/CD

## What This Setup Does

- Runs backend tests and backend asset build on pull requests and pushes to `main`
- Runs frontend production build on pull requests and pushes to `main`
- Triggers a Render backend deploy when backend files change on `main`
- Triggers a Vercel frontend deploy when frontend files change on `main`

## GitHub Secrets You Need

Add these in GitHub:

- `RENDER_DEPLOY_HOOK_URL`
- `VERCEL_DEPLOY_HOOK_URL`

## How To Get The Deploy Hooks

### Render

1. Open your backend service in Render
2. Go to `Settings`
3. Find `Deploy Hook`
4. Copy the hook URL into `RENDER_DEPLOY_HOOK_URL`

### Vercel

1. Open your frontend project in Vercel
2. Go to `Settings`
3. Open `Git` or `Deploy Hooks`
4. Create a production deploy hook
5. Copy the hook URL into `VERCEL_DEPLOY_HOOK_URL`

## Workflow Files

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-backend.yml`
- `.github/workflows/deploy-frontend.yml`

## Notes

- The frontend CI build uses a placeholder `VITE_API_URL` because the build only needs the variable to exist.
- The backend deploy still relies on your Render service configuration and environment variables.
- Your Render startup script already runs migrations and seeders, so the deploy workflow only needs to trigger Render.
