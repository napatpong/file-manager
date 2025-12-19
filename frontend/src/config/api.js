// API URL configuration
// Use environment variable if provided, otherwise use /api relative path
// Try primary URL first, fallback to alternative if provided
const BASE_URL = import.meta.env.VITE_API_URL || ''
const API_URL = BASE_URL ? `${BASE_URL}/api` : '/api'

export default API_URL
export const API_URL_PRIMARY = import.meta.env.VITE_API_URL
export const API_URL_ALT = import.meta.env.VITE_API_URL_ALT
