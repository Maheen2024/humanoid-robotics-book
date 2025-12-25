import axios from 'axios';
import { getApiConfig } from '../../config/apiConfig';

/**
 * API client for communicating with the RAG backend service.
 * Handles authentication, error handling, and request/response transformations.
 */

// Load configuration using the config module
const API_BASE_URL = getApiConfig('API_BASE_URL');
const API_KEY = getApiConfig('API_KEY');
const DEFAULT_TIMEOUT = getApiConfig('TIMEOUT_MS');
const RETRY_ATTEMPTS = getApiConfig('RETRY_ATTEMPTS');

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {}),
    ...(API_KEY ? { 'X-API-Key': API_KEY } : {})
  }
});

// Request interceptor for logging and preprocessing
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and post-processing
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Received response from: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response || error.message);
    return Promise.reject(error);
  }
);

/**
 * Query the RAG backend with a question
 * @param {Object} params - Query parameters
 * @param {string} params.query - The user's question
 * @param {number} [params.max_chunks=5] - Maximum number of document chunks to retrieve
 * @param {number} [params.temperature=0.1] - Temperature parameter for response generation
 * @param {boolean} [params.include_sources=true] - Whether to include source citations
 * @param {number} [params.timeout=30] - Request timeout in seconds
 * @param {string} [params.pageContext] - Context of the current documentation page
 * @returns {Promise<Object>} Response from the backend
 */
const queryRag = async (params) => {
  const {
    query,
    max_chunks = 5,
    temperature = 0.1,
    include_sources = true,
    timeout = 30,
    pageContext
  } = params;

  // Validate required parameters
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('Query is required and must be a non-empty string');
  }

  if (query.length > 1000) {
    throw new Error('Query exceeds maximum length of 1000 characters');
  }

  // Prepare request payload
  const payload = {
    query: query.trim(),
    max_chunks: Math.min(Math.max(max_chunks, 1), 10),
    temperature: Math.min(Math.max(temperature, 0.0), 1.0),
    include_sources,
    timeout: Math.min(Math.max(timeout, 5), 60)
  };

  // Add page context if provided
  if (pageContext) {
    payload.pageContext = pageContext;
  }

  try {
    // Make API call with retry logic
    const response = await makeRequestWithRetry('/api/v1/rag/query', 'POST', payload);

    // Validate response structure
    if (!response.data) {
      throw new Error('Invalid response structure: missing data property');
    }

    return response.data;
  } catch (error) {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 400) {
        throw new Error(`Bad Request: ${data.error?.message || 'Invalid parameters'}`);
      } else if (status === 401) {
        throw new Error('Unauthorized: Invalid API key');
      } else if (status === 408) {
        throw new Error('Request Timeout: The query took too long to process');
      } else if (status === 429) {
        throw new Error('Rate Limited: Too many requests, please try again later');
      } else if (status >= 500) {
        throw new Error(`Server Error (${status}): ${data.error?.message || 'Internal server error'}`);
      } else {
        throw new Error(`HTTP Error (${status}): ${data.error?.message || 'Request failed'}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network Error: Unable to reach the server');
    } else {
      // Something else happened
      throw new Error(`Request Error: ${error.message}`);
    }
  }
};

/**
 * Check the health status of the backend service
 * @returns {Promise<Object>} Health status response
 */
const healthCheck = async () => {
  try {
    const response = await makeRequestWithRetry('/health', 'GET');
    return response.data;
  } catch (error) {
    throw new Error(`Health check failed: ${error.message}`);
  }
};

/**
 * Get current configuration from the backend
 * @returns {Promise<Object>} Configuration response
 */
const getConfig = async () => {
  try {
    const response = await makeRequestWithRetry('/config', 'GET');
    return response.data;
  } catch (error) {
    throw new Error(`Config retrieval failed: ${error.message}`);
  }
};

/**
 * Make a request with retry logic
 * @private
 */
const makeRequestWithRetry = async (url, method, data = null) => {
  let lastError;

  for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      if (method.toUpperCase() === 'GET') {
        return await apiClient.get(url);
      } else if (method.toUpperCase() === 'POST') {
        return await apiClient.post(url, data);
      } else if (method.toUpperCase() === 'PUT') {
        return await apiClient.put(url, data);
      } else if (method.toUpperCase() === 'DELETE') {
        return await apiClient.delete(url);
      } else {
        throw new Error(`Unsupported HTTP method: ${method}`);
      }
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        // Client errors (4xx) should not be retried
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === RETRY_ATTEMPTS) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      console.warn(`Request failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${RETRY_ATTEMPTS + 1})`);
      await sleep(delay);
    }
  }

  throw lastError;
};

/**
 * Sleep helper function
 * @private
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Export public API
export {
  apiClient as default,
  queryRag,
  healthCheck,
  getConfig
};