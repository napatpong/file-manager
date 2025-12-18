// API URL configuration
// Always use relative /api path - Cloudflare Worker will proxy to backend
// This avoids Mixed Content issues (HTTPS frontend -> HTTP backend)
const API_URL = '/api'

export default API_URL
