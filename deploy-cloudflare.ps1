#!/usr/bin/env pwsh
# Cloudflare Workers Deployment Setup

Write-Host "🚀 Cloudflare Workers Deployment Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Checking Wrangler installation..." -ForegroundColor Yellow
$wrangler = wrangler --version 2>$null
if ($wrangler) {
    Write-Host "✓ Wrangler installed: $wrangler" -ForegroundColor Green
} else {
    Write-Host "⚠ Wrangler not found. Installing..." -ForegroundColor Yellow
    npm install -g wrangler
}

Write-Host ""
Write-Host "Step 2: Building frontend..." -ForegroundColor Yellow
cd frontend
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}

cd ..
Write-Host ""
Write-Host "Step 3: Configuration Instructions:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Authenticate with Cloudflare:" -ForegroundColor White
Write-Host "     wrangler login" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Get your Account ID from:" -ForegroundColor White
Write-Host "     https://dash.cloudflare.com/ > Workers > Overview" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Update wrangler.toml with:" -ForegroundColor White
Write-Host "     - account_id = 'YOUR_ACCOUNT_ID'" -ForegroundColor Gray
Write-Host "     - KV namespace id and preview_id" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Deploy:" -ForegroundColor White
Write-Host "     wrangler deploy --env production" -ForegroundColor Gray
Write-Host ""
Write-Host "✓ Setup complete! Follow the instructions above." -ForegroundColor Green
