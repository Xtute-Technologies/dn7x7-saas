import apiClient from '@/services/authService'; // Importing your existing axios instance

const BASE_URL = '/accounts/admin/users/';

/**
 * Fetch all users (supports pagination/search if your viewset does)
 * @param {Object} params - e.g. { page: 1, search: "john" }
 */
export const getAllUsers = (params = {}) => {
  return apiClient.get(BASE_URL, { params });
};

/**
 * Get a single user by ID
 */
export const getUser = (id) => {
  return apiClient.get(`${BASE_URL}${id}/`);
};

/**
 * Create a new user (Admin action)
 * @param {Object} data - { email, name, password, organization }
 */
export const createUser = (data) => {
  return apiClient.post(BASE_URL, data);
};

/**
 * Update user details
 * @param {number} id
 * @param {Object} data - { name, organization, etc. }
 */
export const updateUser = (id, data) => {
  return apiClient.patch(`${BASE_URL}${id}/`, data);
};

/**
 * Delete a user
 */
export const deleteUser = (id) => {
  return apiClient.delete(`${BASE_URL}${id}/`);
};

// --- CUSTOM ACTIONS ---

/**
 * Add credits to a user account
 * @param {number} id - User ID
 * @param {number} amount - Amount of credits to add
 */
export const addUserCredits = (id, amount) => {
  return apiClient.post(`${BASE_URL}${id}/add_credits/`, { credits: amount });
};

/**
 * Toggle user active status (Ban/Unban)
 * @param {number} id - User ID
 */
export const toggleUserActive = (id) => {
  return apiClient.post(`${BASE_URL}${id}/toggle_active/`);
};

/**
 * Get logs for a specific user
 * @param {number} userId 
 * @param {Object} params - { page, time_range }
 */
export const getUserLogs = (userId, params = {}) => {
  // Assuming your backend supports filtering logs by user_id via query param
  // OR has a specific nested route like /admin/users/{id}/logs/
  // Based on standard DRF ViewSets, usually we use a filter on the main log endpoint
  // But let's assume a custom action or filter:
  return apiClient.get(`${BASE_URL}${userId}/logs/`, { params });
};

/**
 * Toggle user staff status (Make/Remove Admin)
 * @param {number} id - User ID
 */
export const toggleUserStaff = (id) => {
  return apiClient.post(`${BASE_URL}${id}/toggle_staff/`);
};

const adminUserService = {
  getUserLogs,
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  addUserCredits,
  toggleUserActive,
  toggleUserStaff, // Added
};

export default adminUserService;