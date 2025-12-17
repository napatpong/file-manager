#!/bin/bash
# File Manager App - PM2 Production Start Script (Linux/Ubuntu)

echo -e "\033[36m🚀 File Manager App - PM2 Production Mode\033[0m"
echo -e "\033[36m=========================================\033[0m"
echo ""

echo -e "\033[32m✓ Backend will run on: http://localhost:2087\033[0m"
echo -e "\033[32m✓ Frontend will run on: http://localhost:12443\033[0m"
echo ""

APP_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start backend and frontend with PM2
echo -e "\033[33mStarting backend and frontend with PM2...\033[0m"
pm2 start ecosystem.config.cjs

sleep 2

echo ""
echo -e "\033[32m✅ Both servers started in production mode!\033[0m"
echo ""
echo -e "\033[36m📍 Access the application:\033[0m"
echo -e "\033[37m   Frontend: http://localhost:12443/\033[0m"
echo -e "\033[37m   Backend API: http://localhost:2087\033[0m"
echo ""
echo -e "\033[36m🔐 Login credentials:\033[0m"
echo -e "\033[37m   Username: admin\033[0m"
echo -e "\033[37m   Password: admin123\033[0m"
echo ""
echo -e "\033[36m📊 PM2 Status:\033[0m"
echo -e "\033[37m   pm2 status      - View process status\033[0m"
echo -e "\033[37m   pm2 logs        - View backend logs\033[0m"
echo -e "\033[37m   pm2 monit       - Monitor resources\033[0m"
echo -e "\033[37m   pm2 stop all    - Stop all processes\033[0m"
