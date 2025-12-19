// API URL configuration
// Use environment variable if provided, otherwise use /api relative path
const API_URL = import.meta.env.VITE_API_URL || '/api'

// Direct backend URL for file uploads (bypasses Worker limits)
const DIRECT_BACKEND_URL = import.meta.env.VITE_API_URL || 'https://drive.itc.in.th:2087/api'

export default API_URL
export { DIRECT_BACKEND_URL }
