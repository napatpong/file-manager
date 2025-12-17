# 🚀 Cloudflare Workers Deployment Guide

## Status: Ready to Deploy

Your frontend is configured and ready to deploy to Cloudflare Workers at **drive.itc-group.co.th**

---

## Quick Start (3 Steps)

### 1️⃣ Authenticate with Cloudflare
```powershell
wrangler login
```

### 2️⃣ Get Account ID & Create KV Namespace
1. Visit: https://dash.cloudflare.com/
2. Go to: Workers & Pages > Overview
3. Copy your **Account ID**
4. Create a new KV Namespace and get its **ID**

### 3️⃣ Update Configuration & Deploy
```powershell
# Edit wrangler.toml with your Account ID and KV namespace IDs
# Then deploy:
wrangler deploy --env production
```

---

## Configuration Files Created

### ✅ `wrangler.toml`
Main Cloudflare Workers configuration file
- Routes to: `drive.itc-group.co.th/*`
- API proxy endpoint: `/api/*` → backend
- KV storage for static files

### ✅ `src/index.js`
Worker script that:
- Serves static frontend files from KV
- Proxies `/api/*` requests to backend
- Handles SPA routing (returns index.html for unknown routes)
- Sets CORS headers for API requests

### ✅ `frontend/src/config/api.js`
Updated to:
- Auto-detect Cloudflare environment
- Use same-origin API calls (proxied by worker)
- Fall back to `VITE_API_URL` for local development

### ✅ `frontend/dist/`
Built frontend ready for deployment
- HTML: `index.html` (0.47 kB)
- CSS: `assets/index-*.css` (3.90 kB gzipped)
- JS: `assets/index-*.js` (74.42 kB gzipped)

---

## Detailed Setup Instructions

### Step 1: Install Wrangler
```bash
npm install -g wrangler
```

### Step 2: Authenticate
```bash
wrangler login
```
Browser will open for Cloudflare authorization.

### Step 3: Get Account Information

**Account ID:**
- https://dash.cloudflare.com/
- Workers & Pages > Overview
- Copy Account ID

**KV Namespace:**
- Workers > KV > Create namespace
- Name: `file-manager-storage` (or any name)
- Copy the **Production ID** and **Preview ID**

### Step 4: Update wrangler.toml
```toml
account_id = "YOUR_ACCOUNT_ID"

kv_namespaces = [
  { binding = "__STATIC_CONTENT", id = "YOUR_KV_ID", preview_id = "YOUR_PREVIEW_ID" }
]
```

### Step 5: Deploy
```bash
# Deploy to production
wrangler deploy --env production

# Or deploy to development
wrangler deploy --env development
```

### Step 6: Verify Deployment
```bash
# Check deployment status
wrangler deployments list
```

---

## What Gets Deployed

✅ **Frontend Files**
- All files from `frontend/dist/`
- Stored in Cloudflare KV

✅ **Worker Script**
- Serves static files
- Proxies API requests
- Handles routing

✅ **Route Configuration**
- `drive.itc-group.co.th/*` → Your Worker

---

## How It Works

```
User Request
    ↓
Cloudflare Edge (drive.itc-group.co.th)
    ↓
Worker Script (src/index.js)
    ├─ /api/* → Proxied to backend (http://your-backend:2087)
    └─ /* → Served from KV storage (frontend/dist/)
```

---

## API Requests Flow

1. Frontend makes request to `/api/files`
2. Browser sends to `https://drive.itc-group.co.th/api/files`
3. Worker intercepts `/api/*` request
4. Worker proxies to backend: `https://api.drive.itc-group.co.th/api/files`
5. Response returned to frontend

**Backend Configuration:**
Update `API_URL` in `wrangler.toml` [env.production]:
```toml
vars = { API_URL = "https://api.drive.itc-group.co.th" }
```

---

## File Structure

```
file-manager-app/
├── wrangler.toml              # Cloudflare config
├── src/
│   └── index.js              # Worker script
├── frontend/
│   ├── dist/                 # Built files (ready to deploy)
│   │   ├── index.html
│   │   └── assets/
│   ├── src/
│   │   └── config/
│   │       └── api.js        # Updated for Cloudflare
│   ├── package.json
│   └── vite.config.js
├── CLOUDFLARE_DEPLOYMENT.md  # This guide
└── deploy-cloudflare.ps1     # Deploy script
```

---

## Environment Variables

### Production Environment
```toml
[env.production]
vars = { API_URL = "https://api.drive.itc-group.co.th" }
routes = [
  { pattern = "drive.itc-group.co.th/*", zone_name = "itc-group.co.th" }
]
```

### Development Environment
```toml
[env.development]
vars = { API_URL = "http://localhost:2087" }
```

---

## Troubleshooting

### ❌ "Account ID not found"
→ Update `account_id` in wrangler.toml

### ❌ "KV namespace not found"
→ Create namespace and update `id` and `preview_id`

### ❌ "Zone not found"
→ Your domain `itc-group.co.th` must be registered in Cloudflare

### ❌ API calls fail
→ Check `API_URL` in wrangler.toml matches your backend

### ❌ Static files not loading
→ Run `npm run build` in frontend folder first

---

## Rollback / Redeploy

```bash
# View deployment history
wrangler deployments list

# Rollback to previous version
wrangler rollback

# Or deploy new version
npm run build
wrangler deploy
```

---

## Next Steps

1. ✅ Frontend is built and ready
2. ⏳ Run `wrangler login`
3. ⏳ Update wrangler.toml with Account ID and KV IDs
4. ⏳ Run `wrangler deploy --env production`
5. ⏳ Access https://drive.itc-group.co.th/

---

## Support

**Cloudflare Docs:** https://developers.cloudflare.com/workers/
**Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
**KV Storage:** https://developers.cloudflare.com/workers/runtime-apis/kv/

---

**Status**: ✅ Ready for Production Deployment
**Created**: 2025-12-16
**Frontend Version**: Production Build
