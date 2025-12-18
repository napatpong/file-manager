// API URL configuration
// Use relative /api path for most requests - Cloudflare Worker proxies to backend
// For large file uploads, use direct backend URL to avoid Worker 100MB limit and 30s timeout
const API_URL = '/api'

// Direct backend URL for file uploads (bypasses Worker limits)
const DIRECT_BACKEND_URL = 'https://driveback.itc-group.co.th:2087/api'

export default API_URL
export { DIRECT_BACKEND_URL }
