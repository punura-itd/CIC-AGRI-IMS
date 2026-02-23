import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // your backend root for development
  //baseURL: "https://svr-sql-ssrs:5172/api", // your backend root for production
  //baseURL: "https://svr-sql-sfa_uat:5172/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies
});

// Add request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    // Token is automatically included via cookies with withCredentials: true
    // No need to manually add Authorization header since backend uses HTTP-only cookies
    console.log('API Request:', config.url, 'withCredentials:', config.withCredentials);
    console.log('Request headers:', config.headers);
    console.log('Current cookies:', document.cookie);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    console.log('Response headers:', response.headers);
    if (response.headers['set-cookie']) {
      console.log('Set-Cookie headers:', response.headers['set-cookie']);
    }
    return response;
  },
  (error) => {
    console.log('API Error:', error.config?.url, error.response?.status, error.message);
    if (error.response?.status === 401) {
      // Handle unauthorized access - clear any stored user data
      localStorage.removeItem('user');
      // Don't redirect automatically, let the AuthContext handle it
      console.log('Unauthorized access - token may be expired or invalid');
      console.log('Error response headers:', error.response?.headers);
    }
    return Promise.reject(error);
  }
);

export default api;
