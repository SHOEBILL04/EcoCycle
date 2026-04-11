# EcoCycle API Verification Script
# This script demonstrates core API flows using PowerShell (Invoke-RestMethod)

$BaseUrl = "http://localhost:8000/api"
$Headers = @{
    "Accept" = "application/json"
    "Content-Type" = "application/json"
}

Write-Host "--- EcoCycle API Test Script ---" -ForegroundColor Emerald

# 1. Registration
$RegPayload = @{
    name = "Tester"
    email = "test_$(Get-Random)@example.com"
    password = "password123"
    password_confirmation = "password123"
    country = "Bangladesh"
    district = "Dhaka"
    sub_district = "Tejgaon"
} | ConvertTo-Json

Write-Host "[1/4] Registering new user..." -NoNewline
try {
    $RegRes = Invoke-RestMethod -Uri "$BaseUrl/register" -Method Post -Body $RegPayload -Headers $Headers
    Write-Host " DONE" -ForegroundColor Green
    $Token = $RegRes.access_token
    Write-Host "      User: $($RegRes.user.name) | Role: $($RegRes.role)"
} catch {
    Write-Host " FAILED" -ForegroundColor Red
    Write-Error $_.Exception.Message
    exit
}

# Add Authorization Header
$Headers.Add("Authorization", "Bearer $Token")

# 2. Get User Details
Write-Host "[2/4] Fetching user profile..." -NoNewline
try {
    $UserRes = Invoke-RestMethod -Uri "$BaseUrl/user" -Method Get -Headers $Headers
    Write-Host " DONE" -ForegroundColor Green
    Write-Host "      Email: $($UserRes.email)"
} catch {
    Write-Host " FAILED" -ForegroundColor Red
}

# 3. Get Dashboard
Write-Host "[3/4] Fetching citizen dashboard..." -NoNewline
try {
    $DashRes = Invoke-RestMethod -Uri "$BaseUrl/dashboard" -Method Get -Headers $Headers
    Write-Host " DONE" -ForegroundColor Green
    Write-Host "      Points: $($DashRes.stats.points) | Rank: $($DashRes.stats.rank)"
} catch {
    Write-Host " FAILED" -ForegroundColor Red
}

# 4. List Rewards
Write-Host "[4/4] Fetching available rewards..." -NoNewline
try {
    $RewardsRes = Invoke-RestMethod -Uri "$BaseUrl/rewards" -Method Get -Headers $Headers
    Write-Host " DONE" -ForegroundColor Green
    Write-Host "      Available: $($RewardsRes.rewards.Count) items"
} catch {
    Write-Host " FAILED" -ForegroundColor Red
}

Write-Host "`n--- Verification Complete ---" -ForegroundColor Emerald
Write-Host "Access Token saved to variable `$Token for manual use."
