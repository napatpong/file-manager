# Ubuntu Deployment Guide

## Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git (if not already installed)
sudo apt install -y git
```

## Deployment Steps

### 1. Clone the repository

```bash
cd /opt  # or your preferred location
sudo git clone https://github.com/napatpong/file-manager.git
cd file-manager
sudo chown -R $USER:$USER .
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
npm run build
cd ..
```

### 3. Set environment variables

```bash
# Backend production config should already be in place
cat backend/.env.production
```

Update if needed:
```bash
PORT=2087
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
DATABASE_PATH=./database/filemanager.db
NODE_ENV=production
```

### 4. Make startup scripts executable

```bash
chmod +x start-pm2.sh
```

### 5. Start the application with PM2

```bash
pm2 start ecosystem.config.js

# Or use the convenience script
./start-pm2.sh
```

### 6. Setup PM2 startup on system boot

```bash
pm2 startup
# Follow the instructions provided by PM2
# Usually it's something like:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

# Save PM2 processes
pm2 save
```

## Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs file-manager-backend

# Monitor resources
pm2 monit

# Save current setup
pm2 save
```

## Common Commands

```bash
# Start all services
pm2 start ecosystem.config.js

# Restart all services
pm2 restart all

# Stop all services
pm2 stop all

# Delete all services
pm2 delete all

# View logs
pm2 logs

# Tail specific app logs
pm2 logs file-manager-backend
```

## Firewall Configuration (if needed)

```bash
# Allow ports through firewall
sudo ufw allow 2087/tcp   # Backend API
sudo ufw allow 12443/tcp  # Frontend
sudo ufw reload
```

## Reverse Proxy Setup (Optional - Nginx)

### Install Nginx

```bash
sudo apt install -y nginx
```

### Configure Nginx for frontend

Edit `/etc/nginx/sites-available/file-manager`:

```nginx
server {
    listen 80;
    server_name your_domain.com;

    # Redirect HTTP to HTTPS (if you have SSL)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your_domain.com;

    # Frontend static files
    root /opt/file-manager/frontend/dist;
    index index.html;

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:2087;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header Authorization $http_authorization;
    }

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # SSL configuration (if using Let's Encrypt)
    # ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;
}
```

Enable and test:

```bash
sudo ln -s /etc/nginx/sites-available/file-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Database

The application uses SQLite by default, stored in `./database/filemanager.db`. 

To backup:
```bash
sudo cp ./database/filemanager.db ./database/filemanager.db.backup
```

## Troubleshooting

### Port already in use
```bash
# Find process using port
sudo lsof -i :2087
sudo kill -9 <PID>
```

### Permission issues
```bash
# Ensure proper permissions
sudo chown -R $USER:$USER /opt/file-manager
chmod +x /opt/file-manager/start-pm2.sh
```

### Check logs
```bash
pm2 logs file-manager-backend
tail -f ./logs/backend-error.log
```

## Performance Tuning

For production, consider:

1. **Node.js memory limit** - Update ecosystem.config.js
2. **Worker processes** - Increase `instances: 'max'` in ecosystem.config.js
3. **Nginx caching** - Add caching headers for static assets
4. **Database optimization** - Add indexes to frequently queried columns
5. **SSL/TLS** - Use Let's Encrypt for HTTPS

## Security Notes

- Change default admin credentials immediately
- Use strong JWT_SECRET
- Setup firewall rules
- Keep system and packages updated
- Monitor logs regularly
- Use HTTPS in production
