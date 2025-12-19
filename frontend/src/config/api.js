// API URL configuration
// Use environment variable if provided, otherwise use /api relative path
const BASE_URL = import.meta.env.VITE_API_URL || ''
const API_URL = BASE_URL ? `${BASE_URL}/api` : '/api'

// Direct backend URL for file uploads (bypasses Worker limits)
const DIRECT_BACKEND_URL = BASE_URL ? `${BASE_URL}/api` : 'https://drive.itc.in.th:2087/api'

export default API_URL
export { DIRECT_BACKEND_URL }
