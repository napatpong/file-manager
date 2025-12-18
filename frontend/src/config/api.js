// API URL configuration
// For Cloudflare Workers: /api/* requests are proxied by the worker
// For local development: VITE_API_URL points to backend
const isCloudflare = typeof window !== 'undefined' && window.location.hostname.includes('drive.itc-group.co.th')

let API_URL
if (isCloudflare) {
  // Use same origin with port 2087
  API_URL = `${window.location.protocol}//${window.location.hostname}:2087`
} else {
  // Use environment variable
  if (import.meta.env.VITE_API_URL) {
    API_URL = import.meta.env.VITE_API_URL
  } else {
    // For any other cases, use same protocol and construct API URL using current hostname:2087
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      // For domain access, try to use 172.16.0.22 as fallback
      const isDomain = hostname.includes('itc.in.th') || hostname.includes('itc-group.co.th') || hostname.includes('.')
      if (isDomain && hostname !== '172.16.0.22') {
        // Try domain first, but have IP as fallback
        API_URL = `${window.location.protocol}//${hostname}:2087`
      } else {
        API_URL = `${window.location.protocol}//${hostname}:2087`
      }
    } else {
      // Fallback for SSR
      API_URL = 'http://drive.itc-group.co.th:2087'
    }
  }
}

export default API_URL
