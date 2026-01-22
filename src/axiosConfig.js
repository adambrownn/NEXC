import axios from "axios";
import AuthHeader from "./services/auth-header";
import authService from "./services/auth.service";

// const isDevelopment = process.env.NODE_ENV !== 'production';

const baseURL = process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? "https://api.nexc.co.uk"
    : `${window.location.protocol}//${window.location.hostname}:8080`);

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json'
    // Content-Type is set per-request to support both JSON and FormData
  },
  withCredentials: true
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Add version prefix to URL if not already present
      const url = config.url || '';

      // Add /v1 prefix if the URL doesn't already have it and isn't a health check
      if (!url.startsWith('/v1') && !url.startsWith('/health')) {
        config.url = `/v1${url}`;
      }

      // Set Content-Type for non-FormData requests
      // Check both instanceof and constructor name for browser compatibility
      const isFormData = config.data instanceof FormData || 
                        (config.data && config.data.constructor && config.data.constructor.name === 'FormData');
      
      if (!isFormData) {
        config.headers['Content-Type'] = 'application/json';
      } else {
        // Explicitly delete Content-Type for FormData - let browser/axios generate it
        delete config.headers['Content-Type'];
        console.log('[Axios] FormData detected, Content-Type will be auto-generated with boundary');
      }

      const headerAccessToken = await AuthHeader.getAuthHeaderToken();
      if (headerAccessToken?.authorizationToken) {
        config.headers.authorization = headerAccessToken.authorizationToken;
      }
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Check if response is HTML when we expect JSON
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html') && !response.config.url.includes('/health')) {
      return Promise.reject(new Error('Received HTML response when expecting JSON'));
    }

    if (response.data?.err && ["JWT expired.", "Auth token missing", "Invalid Token."].includes(response.data.err)) {
      authService.logout();
      window.location.replace("/auth/login");
      return Promise.reject(new Error('Authentication failed'));
    }

    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 404) {
        console.error('404 Error: Resource not found');
      } else if (error.response.status === 401) {
        authService.logout();
        window.location.replace("/auth/login");
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error: No response received');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
