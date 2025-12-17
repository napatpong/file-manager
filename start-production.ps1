#!/usr/bin/env pwsh
# File Manager App - Production Start Script

Write-Host "🚀 File Manager App - Production Mode" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$appPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "✓ Backend will run on: http://localhost:2087" -ForegroundColor Green
Write-Host "✓ Frontend will run on: http://localhost:12443" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "Starting backend in production mode..." -ForegroundColor Yellow
$backendPath = Join-Path $appPath "backend"
Start-Process cmd -ArgumentList @(
    "/k",
    "cd /d `"$backendPath`" && set NODE_ENV=production && set PORT=2087 && npm start"
) -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting frontend in production mode..." -ForegroundColor Yellow
Write-Host "Building frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $appPath "frontend"
Set-Location $frontendPath
npm run build
Start-Process cmd -ArgumentList @(
    "/k",
    "cd /d `"$frontendPath`" && npm run preview"
) -WindowStyle Normal

Write-Host ""
Write-Host "✅ Both servers started in production mode!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:12443/" -ForegroundColor White
Write-Host "   Backend API: http://localhost:2087" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Login credentials:" -ForegroundColor Cyan
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
