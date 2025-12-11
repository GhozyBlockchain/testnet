
// Use VITE_BACKEND_URL from environment or fallback to localhost
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
