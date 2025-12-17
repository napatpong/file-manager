#!/usr/bin/env pwsh
# File Manager App - PM2 Production Start Script

Write-Host "🚀 File Manager App - PM2 Production Mode" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✓ Backend will run on: http://localhost:2087" -ForegroundColor Green
Write-Host "✓ Frontend will run on: http://localhost:12443" -ForegroundColor Green
Write-Host ""

$appPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start backend and frontend with PM2
Write-Host "Starting backend and frontend with PM2..." -ForegroundColor Yellow
pm2 start ecosystem.config.js

Start-Sleep -Seconds 2

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
Write-Host ""
Write-Host "📊 PM2 Status:" -ForegroundColor Cyan
Write-Host "   pm2 status      - View process status" -ForegroundColor White
Write-Host "   pm2 logs        - View backend logs" -ForegroundColor White
Write-Host "   pm2 monit       - Monitor resources" -ForegroundColor White
Write-Host "   pm2 stop all    - Stop all processes" -ForegroundColor White
