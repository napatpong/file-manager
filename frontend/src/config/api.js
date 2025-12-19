// API URL configuration
// Use environment variable if provided, otherwise use /api relative path
const BASE_URL = import.meta.env.VITE_API_URL || ''
const API_URL = BASE_URL ? `${BASE_URL}/api` : '/api'

export default API_URL
