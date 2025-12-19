# File Manager Application

A unified file management application with React frontend and Node.js backend.

## Quick Start

### Installation
```bash
npm run install:all
```

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### PM2 Deployment
```bash
pm2 start ecosystem.config.cjs
pm2 logs file-manager
```

## Configuration

Edit `.env` or `.env.production` to configure:
- `PORT`: HTTPS port (default: 2087)
- `HTTP_PORT`: HTTP port (default: 2086)
- `UPLOAD_DIR`: Upload directory path
- `JWT_SECRET`: JWT secret key
- `NODE_ENV`: development or production

## Default Credentials
- Username: `admin`
- Password: `*#482Admin#`
