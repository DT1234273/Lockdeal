import axios from 'axios';

// Set default base URL from the proxy in package.json
// This will be used in development. In production, you would set the actual API URL
// No need to set baseURL when using the proxy in development
// axios.defaults.baseURL = 'http://localhost:8000';

export default axios;

// Add a request interceptor for handling common headers, etc.
axios.interceptors.request.use(
  (config) => {
    // Get the token from localStorage if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for handling common errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors globally
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // Remove the default 'not found' popup by not showing any toast notification here
    // This ensures no popup appears for any API error unless explicitly handled in components
    return Promise.reject(error);
  }
);