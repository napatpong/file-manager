# 🚀 Production Deployment Commands

## Quick Command Reference

### Development Mode (Default)
```powershell
# Terminal 1 - Backend (Port 5000)
cd d:\app\download\file-manager-app\backend
npm start

# Terminal 2 - Frontend (Port 3000)  
cd d:\app\download\file-manager-app\frontend
npm run dev
```

**Access**: http://localhost:3000

---

### Production Mode

**Option 1: Using PowerShell Commands** (Recommended for Windows)
```powershell
# Terminal 1 - Backend (Port 2087)
cd d:\app\download\file-manager-app\backend
$env:NODE_ENV='production'; npm start

# Terminal 2 - Frontend (Port 443)
cd d:\app\download\file-manager-app\frontend
$env:NODE_ENV='production'; npm run dev
```

**Option 2: Using Startup Scripts** (Easiest)
```powershell
# From the app root directory
.\start-production.ps1

# Or for development
.\start-development.ps1
```

**Access**: https://localhost:443

---

## 🎯 Startup Scripts (Easiest Way!)

### For Development
```powershell
cd d:\app\download\file-manager-app
.\start-development.ps1
```
- Starts backend on port 5000
- Starts frontend on port 3000
- Auto-opens browser to http://localhost:3000

### For Production
```powershell
cd d:\app\download\file-manager-app
.\start-production.ps1
```
- Starts backend on port 2087
- Starts frontend on port 443 (HTTPS)
- Opens in separate terminal windows

---

### Backend (.env.production)
```
PORT=2087
JWT_SECRET=your_secure_secret_key
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
DATABASE_PATH=./database/filemanager.db
NODE_ENV=production
```

### Frontend (.env.production)
```
VITE_API_URL=http://localhost:2087
VITE_ENV=production
```

---

## Features Included

✅ User Authentication & Registration
✅ Role-Based Access Control (Admin, Uploader, Downloader)
✅ File Upload, Download, Delete
✅ User Management (Create, Edit, Delete)
✅ File Access Control (Grant/Revoke Permissions)
✅ Thai Language Support
✅ List/Grid View Toggle for Files
✅ Persistent Data Storage (JSON-based)
✅ JWT Token Authentication
✅ Responsive Design

---

## Default Login

```
Username: admin
Password: admin123
```

---

## Configuration Details

| Aspect | Development | Production |
|--------|------------|-----------|
| **Backend Port** | 5000 | 2087 |
| **Frontend Port** | 3000 | 443 (HTTPS) |
| **Backend API URL** | http://localhost:5000 | http://localhost:2087 |
| **Env File** | `.env` | `.env.production` |
| **Auto-open** | Yes | No |

---

## API Endpoints

All API calls are automatically routed to the configured backend URL:

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Files**: `/api/files`, `/api/files/upload`, `/api/files/{id}/download`
- **Users**: `/api/users`, `/api/users/{id}`
- **File Access**: `/api/files/{fileId}/access`

---

## Production Deployment Checklist

- [ ] Change `JWT_SECRET` to a secure value
- [ ] Update `VITE_API_URL` to production domain
- [ ] Update CORS settings in backend for production domain
- [ ] Configure SSL/TLS certificates
- [ ] Set up reverse proxy (Nginx/Apache) if needed
- [ ] Test all features in production mode
- [ ] Backup database files
- [ ] Monitor application logs

---

**Last Updated**: 2025-12-16
**Status**: ✅ Production Ready
