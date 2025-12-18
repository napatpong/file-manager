// API URL configuration
// Use relative /api path for most requests - Cloudflare Worker proxies to backend
// For large file uploads, use direct backend URL to avoid Worker 30s timeout
const API_URL = '/api'

// Direct backend URL for file uploads (bypasses Worker timeout)
// Note: This will fail on HTTPS domains without backend SSL - use chunked upload instead
const DIRECT_BACKEND_URL = 'http://driveback.itc-group.co.th:2087/api'

export default API_URL
export { DIRECT_BACKEND_URL }
