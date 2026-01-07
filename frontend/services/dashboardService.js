import apiClient from '@/services/authService';

// --- Credit Endpoints ---

/**
 * Get the current user's credit balance (daily free + purchased)
 * Endpoint: GET /api/dashboard/credits/
 */
export const getCredits = () => apiClient.get('/dashboard/credits/');


// --- API Key Endpoints ---

/**
 * List all API keys belonging to the user
 * Endpoint: GET /api/dashboard/list_keys/
 */
export const getAPIKeys = () => apiClient.get('/dashboard/list_keys/');

/**
 * Create a new API key
 * @param {Object} data - { name: string, daily_limit: number }
 * Endpoint: POST /api/dashboard/create_key/
 */
export const createAPIKey = (data) => apiClient.post('/dashboard/create_key/', data);

/**
 * Revoke (deactivate) a specific API key
 * @param {number} id - The ID of the API key to revoke
 * Endpoint: POST /api/dashboard/{id}/revoke_key/
 */
export const revokeAPIKey = (id) => apiClient.post(`/dashboard/${id}/revoke_key/`);


// --- Logs & Analytics Endpoints ---

/**
 * Get usage logs
 * @param {Object} params - Optional filters like { time_range: '7d', status_filter: 'error' }
 * Endpoint: GET /api/dashboard/logs/
 */
export const getLogs = (params = {}) => apiClient.get('/dashboard/logs/', { params });

const dashboardService = {
  getCredits,
  getAPIKeys,
  createAPIKey,
  revokeAPIKey,
  getLogs,
};

export default dashboardService;