// API URL configuration
// For Cloudflare Workers: /api/* requests are proxied by the worker
// For local development: VITE_API_URL points to backend
const isCloudflare = typeof window !== 'undefined' && window.location.hostname.includes('drive.itc-group.co.th')

let API_URL
if (isCloudflare) {
  // Use backend API server
  API_URL = 'http://driveback.itc-group.co.th:2087'
} else {
  // Use environment variable
  if (import.meta.env.VITE_API_URL) {
    API_URL = import.meta.env.VITE_API_URL
  } else {
    // For any other cases, use backend URL
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      // For domain access, use driveback
      const isDomain = hostname.includes('itc-group.co.th') || hostname.includes('itc.in.th') || hostname.includes('.')
      if (isDomain && hostname !== '172.16.0.22') {
        API_URL = 'http://driveback.itc-group.co.th:2087'
      } else {
        API_URL = `http://${hostname}:2087`
      }
    } else {
      // Fallback for SSR
      API_URL = 'http://driveback.itc-group.co.th:2087'
    }
  }
}

export default API_URL
