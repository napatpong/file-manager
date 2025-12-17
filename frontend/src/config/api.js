// API URL configuration
// For Cloudflare Workers: /api/* requests are proxied by the worker
// For local development: VITE_API_URL points to backend
const isCloudflare = typeof window !== 'undefined' && window.location.hostname.includes('drive.itc-group.co.th')

let API_URL
if (isCloudflare) {
  // Use same origin (worker proxies to backend)
  API_URL = `${window.location.protocol}//${window.location.hostname}`
} else {
  // Check for env variable, fall back to port 2087 for production, 5000 for dev
  API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? 'http://localhost:2087' : 'http://localhost:5000')
}

export default API_URL
