# Restart Backend on Ubuntu Server
# Run this on the backend server (driveback.itc-group.co.th)

Write-Host "Updating backend code..." -ForegroundColor Yellow

# Go to project directory
cd /var/www/file-manager-app

# Pull latest changes
git pull

# Restart backend with PM2
pm2 restart file-manager-backend

# Show status
pm2 status

Write-Host "`n✓ Backend restarted successfully!" -ForegroundColor Green
Write-Host "Check logs: pm2 logs file-manager-backend" -ForegroundColor Cyan
