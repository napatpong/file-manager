#!/usr/bin/env pwsh
# File Manager App - Development Start Script

Write-Host "🚀 File Manager App - Development Mode" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$appPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "✓ Backend will run on: http://localhost:5000" -ForegroundColor Green
Write-Host "✓ Frontend will run on: http://localhost:3000" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "Starting backend in development mode..." -ForegroundColor Yellow
$backendPath = Join-Path $appPath "backend"
Start-Process pwsh -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendPath'; npm start"
) -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting frontend in development mode..." -ForegroundColor Yellow
$frontendPath = Join-Path $appPath "frontend"
Start-Process pwsh -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendPath'; npm run dev"
) -WindowStyle Normal

Write-Host ""
Write-Host "✅ Both servers started in development mode!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000/" -ForegroundColor White
Write-Host "   Backend API: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Login credentials:" -ForegroundColor Cyan
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
