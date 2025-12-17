# Production Deployment Guide

## Configuration Summary

### Backend - Port 2087
- **Development Port**: 5000 (default)
- **Production Port**: 2087

**Environment Variables** (.env.production):
```
PORT=2087
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
DATABASE_PATH=./database/filemanager.db
NODE_ENV=production
```

### Frontend - Port 443
- **Development Port**: 3000
- **Production Port**: 443 (HTTPS)

**Environment Variables** (.env.production):
```
VITE_API_URL=http://localhost:2087
VITE_ENV=production
```

## Running in Production

### Backend
```bash
cd backend
NODE_ENV=production npm start
```
The server will use port 2087 as configured in `.env.production`

### Frontend
```bash
cd frontend
NODE_ENV=production npm run dev
```
The server will run on port 443 with HTTPS support as configured in `vite.config.js`

## API Configuration

All API URLs are now configurable via environment variables:
- Frontend automatically uses `VITE_API_URL` from `.env.production`
- For production: `VITE_API_URL=http://localhost:2087` (or your domain)

### Files Updated with Dynamic API URL:
1. `frontend/src/config/api.js` - Central API URL configuration
2. `frontend/src/context/AuthContext.jsx` - Authentication
3. `frontend/src/pages/Dashboard.jsx` - File listing and download
4. `frontend/src/pages/Upload.jsx` - File uploads
5. `frontend/src/pages/FileAccess.jsx` - File access control
6. `frontend/src/pages/Users.jsx` - User management

## Switching Between Development and Production

### Development Mode (default)
```bash
# Backend on port 5000
cd backend && npm start

# Frontend on port 3000
cd frontend && npm run dev
```

### Production Mode
```bash
# Backend on port 2087
cd backend && NODE_ENV=production npm start

# Frontend on port 443
cd frontend && NODE_ENV=production npm run dev
```

## HTTPS Configuration for Production

The frontend Vite server in production mode (`NODE_ENV=production`) will:
1. Run on port 443 (HTTPS)
2. Automatically enable HTTPS support
3. Auto-open is disabled in production

For proper HTTPS, you should:
- Use a reverse proxy like Nginx with SSL certificates
- Or configure proper SSL certificates in Vite config if needed

## Important Notes

1. **JWT Secret**: Change the `JWT_SECRET` in `.env.production` for production use
2. **CORS**: Backend is configured with CORS for `localhost`. Update for production domains if needed
3. **Environment Detection**: Uses `process.env.NODE_ENV` to automatically switch between configurations
4. **API URL**: All frontend components automatically use the configured `VITE_API_URL`

## Database & Uploads

- Database: `backend/database/data.json` (file-based storage)
- Uploads: `backend/uploads/` directory
- Both persist across restarts
