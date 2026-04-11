# EcoCycle API Documentation & Testing Tools

This directory contains resources to help judges and developers test and reproduce the EcoCycle API endpoints.

## 1. Postman Collection

The file `ecocycle_api_collection.json` is a standard Postman Collection (v2.1).

### How to use:
1. Open [Postman](https://www.postman.com/).
2. Click **Import** and select the `ecocycle_api_collection.json` file.
3. Once imported, you will see an "EcoCycle API Collection" in your collections sidebar.
4. **Environment Variables**:
   - The collection uses two variables: `{{base_url}}` (default: `http://localhost:8000`) and `{{token}}`.
   - After running the **Login** request, copy the `access_token` from the response.
   - Click on the collection name, go to the **Variables** tab, and paste the token into the `token` variable's current value.
   - Save the changes.

## 2. cURL Script (PowerShell)

The file `test_api.ps1` is a PowerShell script that performs a complete "Happy Path" flow:
- **Registration**: Creates a unique test user.
- **Authentication**: Logs in to retrieve a Bearer Token.
- **Profile Extraction**: Fetches the authenticated user's profile.
- **Dashboard & Rewards**: Validates that system data is accessible.

### How to run:
1. Open a PowerShell terminal.
2. Navigate to the backend directory.
3. Run the script:
   ```powershell
   .\test_api.ps1
   ```

## 3. Direct cURL Examples (Bash/Terminal)

If you prefer using standard cURL in a terminal, here are the core commands:

### Register
```bash
curl -X POST http://localhost:8000/api/register \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123",
        "password_confirmation": "password123",
        "country": "Bangladesh",
        "district": "Dhaka",
        "sub_district": "Gulshan"
     }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/login \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{
        "email": "john@example.com",
        "password": "password123"
     }'
```

### Get Dashboard (Authenticated)
```bash
curl -X GET http://localhost:8000/api/dashboard \
     -H "Accept: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Endpoint Categories
- **Auth**: Management of users and sessions.
- **Submissions**: Core waste classification engine (`/submit-waste`).
- **Social**: Following system and activity feeds.
- **Rewards**: Points redemption and available items.
- **Moderator**: Access to the dispute queue and verdict logic.
- **Admin**: System-wide configuration and audit trails.
