import axios from 'axios';
import Cookies from 'js-cookie';

// Create the main API client instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Flag to prevent multiple refresh requests occurring at once
let isRefreshing = false;
let failedQueue = [];

// Helper to process the queue of failed requests
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- REQUEST INTERCEPTOR ---
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR (The Refresh Logic) ---
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and ensure it's not a retry of a retry
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // Safety check: If the request URL is the refresh endpoint itself, reject to avoid infinite loops
      // Adjust '/accounts/jwt/refresh/' if your URL is different
      if (originalRequest.url.includes('/jwt/refresh/')) {
         return Promise.reject(error);
      }

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return apiClient(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get('refresh_token');

      if (!refreshToken) {
        // No refresh token available? Logout user locally.
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        // Note: We use a generic axios call here to avoid using the interceptors defined on apiClient
        const response = await axios.post(
            `${apiClient.defaults.baseURL}/accounts/jwt/refresh/`, 
            { refresh: refreshToken }
        );

        if (response.status === 200) {
          const { access } = response.data;
          
          // 1. Save new access token
          Cookies.set('access_token', access, { secure: true, sameSite: 'strict' });
          
          // 2. Update default header for future requests on this instance
          apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + access;
          
          // 3. Retry the original request with new token
          originalRequest.headers['Authorization'] = 'Bearer ' + access;
          
          // 4. Process all queued requests with the new token
          processQueue(null, access);
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed (token expired or invalid)
        processQueue(refreshError, null);
        
        // Clear auth data
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        
        // Redirect to login
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors, just return the error
    return Promise.reject(error);
  }
);

// --- API Methods ---

export const login = (credentials) => apiClient.post('/accounts/jwt/create/', credentials);
export const signup = (userData) => apiClient.post('/accounts/users/', userData);
export const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    // Note: Djoser doesn't strictly require a backend logout for JWT unless using blacklisting
    // But it's good practice if you have blacklist enabled.
    return apiClient.post('/accounts/token/logout/'); 
};
export const fetchUser = () => apiClient.get('/accounts/users/me/');
export const updateUser = (userData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  return apiClient.patch('/accounts/users/me/', userData, config);
};
export const changePassword = (data) => apiClient.post('/accounts/users/set_password/', data);

/**
 * Activate user account using UID and Token from email
 * Endpoint: POST /accounts/users/activation/
 */
export const activateAccount = (uid, token) => {
  return apiClient.post('/accounts/users/activation/', { uid, token });
};

/**
 * Request a password reset email
 * Endpoint: POST /accounts/users/reset_password/
 */
export const resetPassword = (email) => {
  return apiClient.post('/accounts/users/reset_password/', { email });
};

/**
 * Confirm new password using UID and Token from email
 * Endpoint: POST /accounts/users/reset_password_confirm/
 */
export const resetPasswordConfirm = (data) => {
  // data should contain: { uid, token, new_password, re_new_password }
  return apiClient.post('/accounts/users/reset_password_confirm/', data);
};

export default apiClient;