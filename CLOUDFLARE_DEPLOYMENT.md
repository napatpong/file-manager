# Deploy Frontend to Cloudflare Workers

## Pre-requisites
1. Cloudflare account with domain itc-group.co.th
2. Wrangler CLI installed: `npm install -g wrangler`
3. Frontend built: `npm run build` (already done)

## Step 1: Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser to authorize Wrangler with your Cloudflare account.

## Step 2: Update wrangler.toml

Edit `wrangler.toml` and update:
```toml
account_id = "YOUR_ACCOUNT_ID"  # Find this in Cloudflare Dashboard > Workers
```

To find your Account ID:
1. Go to https://dash.cloudflare.com/
2. Click Workers > Overview
3. Your Account ID is displayed on the right

## Step 3: Build Frontend

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

## Step 4: Deploy to Cloudflare Workers

```bash
wrangler deploy
```

This will:
- Upload your built frontend files to Cloudflare KV storage
- Deploy the worker script to handle requests
- Configure the route: `drive.itc-group.co.th/*`

## Step 5: Test Deployment

Once deployed, access your site at:
```
https://drive.itc-group.co.th/
```

## API Proxy Configuration

The worker automatically proxies `/api/*` requests to your backend:
- For production: Update `API_URL` in wrangler.toml
- Default: `https://api.drive.itc-group.co.th`

## Manual Deployment (Alternative)

If you prefer not to use Wrangler CLI:

1. Create a Cloudflare Worker manually in the dashboard
2. Copy the content from `src/index.js` into the worker editor
3. Add the KV binding for static content
4. Deploy manually

## Files Structure

```
file-manager-app/
├── wrangler.toml          # Wrangler configuration
├── src/
│   └── index.js          # Worker entry point
└── frontend/
    └── dist/             # Built frontend files
```

## Environment Variables (in wrangler.toml)

- `API_URL`: Backend API URL for proxying
  - Production: `https://api.drive.itc-group.co.th`
  - Development: `http://localhost:2087`

## Troubleshooting

**Build fails?**
```bash
cd frontend
npm install
npm run build
```

**Authentication fails?**
```bash
wrangler logout
wrangler login
```

**KV binding issues?**
- Go to Cloudflare Workers dashboard
- Create a KV namespace
- Bind it in wrangler.toml as `__STATIC_CONTENT`

## Next Steps

1. Run `wrangler login`
2. Update `account_id` in wrangler.toml
3. Run `wrangler deploy`
4. Access https://drive.itc-group.co.th/

For more info: https://developers.cloudflare.com/workers/
