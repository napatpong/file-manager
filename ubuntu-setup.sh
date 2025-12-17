#!/bin/bash
# Quick Setup Script for Ubuntu Deployment

set -e  # Exit on error

echo "🚀 File Manager App - Ubuntu Setup"
echo "===================================="
echo ""

# Check if running on Linux
if [[ "$OSTYPE" != "linux"* ]]; then
    echo "❌ This script is designed for Linux/Ubuntu systems"
    exit 1
fi

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
   echo "⚠️  This script should be run as root or with sudo"
   exit 1
fi

echo "📦 Installing dependencies..."

# Update system
apt update
apt upgrade -y

# Install Node.js
echo "📥 Installing Node.js v20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
echo "📥 Installing PM2..."
npm install -g pm2

# Install Nginx (optional)
read -p "Install Nginx for reverse proxy? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    echo "✅ Nginx installed and started"
fi

# Install Git
apt install -y git

# Create application directory
APP_DIR="/opt/file-manager"
if [ ! -d "$APP_DIR" ]; then
    echo "📁 Creating application directory..."
    mkdir -p "$APP_DIR"
fi

echo ""
echo "✅ System dependencies installed!"
echo ""
echo "📋 Next steps:"
echo "1. Clone the repository: git clone https://github.com/napatpong/file-manager.git $APP_DIR"
echo "2. cd $APP_DIR"
echo "3. Install app dependencies: npm run install:all"
echo "4. Build frontend: cd frontend && npm run build && cd .."
echo "5. Start the app: pm2 start ecosystem.config.js"
echo "6. Setup PM2 boot: pm2 startup"
echo "7. Save PM2: pm2 save"
echo ""
