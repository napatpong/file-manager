// API URL configuration
// For Cloudflare Workers: /api/* requests are proxied by the worker
// For local development: VITE_API_URL points to backend
const isCloudflare = typeof window !== 'undefined' && window.location.hostname.includes('drive.itc-group.co.th')

let API_URL
if (isCloudflare) {
  // Use same origin (worker proxies to backend)
  API_URL = `${window.location.protocol}//${window.location.hostname}`
} else {
  // Use environment variable
  if (import.meta.env.VITE_API_URL) {
    API_URL = import.meta.env.VITE_API_URL
  } else {
    // For any other cases, use same protocol and construct API URL using current hostname:2087
    if (typeof window !== 'undefined') {
      API_URL = `${window.location.protocol}//${window.location.hostname}:2087`
    } else {
      // Fallback for SSR
      API_URL = 'http://localhost:2087'
    }
  }
}

export default API_URL
