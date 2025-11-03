# Simple script to disable watsonx Orchestrate security
# Based on IBM's official embed chat security configuration

$ErrorActionPreference = "Stop"

# Configuration - UPDATE THESE VALUES
$API_KEY = "RsqNRdz-VvzT5MrxLBo_UUwkPLMZtNaDg2EgdVecMUzE"
$INSTANCE_ID = "6e4a398d-0f34-42ad-9706-1f16af156856"
$API_URL = "https://api.us-south.watson-orchestrate.cloud.ibm.com"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Disabling watsonx Orchestrate Security" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Instance ID: $INSTANCE_ID" -ForegroundColor White
Write-Host "API URL: $API_URL" -ForegroundColor White
Write-Host ""

# Disable security
Write-Host "[1/2] Disabling security..." -ForegroundColor Yellow

try {
    $payload = @{
        public_key = ""
        client_public_key = ""
        is_security_enabled = $false
    } | ConvertTo-Json

    $headers = @{
        "IAM-API_KEY" = $API_KEY
        "Content-Type" = "application/json"
    }

    $response = Invoke-RestMethod `
        -Uri "$API_URL/instances/$INSTANCE_ID/v1/embed/secure/config" `
        -Method Post `
        -Headers $headers `
        -Body $payload

    Write-Host "✓ Security disabled successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to disable security:" -ForegroundColor Red
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "  Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    exit 1
}

# Verify
Write-Host "[2/2] Verifying security status..." -ForegroundColor Yellow

try {
    $headers = @{
        "IAM-API_KEY" = $API_KEY
        "accept" = "application/json"
    }

    $verifyResponse = Invoke-RestMethod `
        -Uri "$API_URL/instances/$INSTANCE_ID/v1/embed/secure/config" `
        -Method Get `
        -Headers $headers

    $status = if ($verifyResponse.is_security_enabled) { "ENABLED" } else { "DISABLED" }
    Write-Host "✓ Current security status: $status" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($verifyResponse | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "⚠ Could not verify security status" -ForegroundColor Yellow
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your dev server (Ctrl+C in the terminal running npm run dev, then npm run dev again)" -ForegroundColor White
Write-Host "2. Hard reload your browser (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "3. The chat should now connect without authentication" -ForegroundColor White
