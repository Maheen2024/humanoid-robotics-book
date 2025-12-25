/**
 * API Configuration for the RAG backend client
 * This module exports configuration constants used by the API client
 */

// API Base URL configuration
const API_CONFIG = {
  // Base URL for the API - loaded from environment or default to localhost
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',

  // Default API key - loaded from environment
  API_KEY: process.env.REACT_APP_API_KEY || '',

  // Request timeout in milliseconds
  TIMEOUT_MS: parseInt(process.env.REACT_APP_TIMEOUT_MS || '30000', 10),

  // Number of retry attempts for failed requests
  RETRY_ATTEMPTS: parseInt(process.env.REACT_APP_RETRY_ATTEMPTS || '3', 10),

  // Headers configuration
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Endpoint paths
  ENDPOINTS: {
    QUERY: '/api/v1/rag/query',
    HEALTH: '/health',
    CONFIG: '/config',
  },

  // Validation constraints
  VALIDATION: {
    MAX_QUERY_LENGTH: 1000,
    MIN_QUERY_LENGTH: 1,
    MAX_CHUNKS_RANGE: { min: 1, max: 10 },
    TEMPERATURE_RANGE: { min: 0.0, max: 1.0 },
    TIMEOUT_RANGE: { min: 5, max: 60 },
    MAX_HISTORY_LENGTH: 100,
  },

  // Default values for API parameters
  DEFAULTS: {
    MAX_CHUNKS: 5,
    TEMPERATURE: 0.1,
    INCLUDE_SOURCES: true,
    TIMEOUT_SECONDS: 30,
  }
};

// Validate configuration values
const validateConfig = () => {
  if (isNaN(API_CONFIG.TIMEOUT_MS) || API_CONFIG.TIMEOUT_MS <= 0) {
    console.warn(`Invalid TIMEOUT_MS value: ${API_CONFIG.TIMEOUT_MS}, using default 30000`);
    API_CONFIG.TIMEOUT_MS = 30000;
  }

  if (isNaN(API_CONFIG.RETRY_ATTEMPTS) || API_CONFIG.RETRY_ATTEMPTS < 0) {
    console.warn(`Invalid RETRY_ATTEMPTS value: ${API_CONFIG.RETRY_ATTEMPTS}, using default 3`);
    API_CONFIG.RETRY_ATTEMPTS = 3;
  }

  if (API_CONFIG.VALIDATION.MAX_QUERY_LENGTH <= 0) {
    console.warn(`Invalid MAX_QUERY_LENGTH value: ${API_CONFIG.VALIDATION.MAX_QUERY_LENGTH}, using default 1000`);
    API_CONFIG.VALIDATION.MAX_QUERY_LENGTH = 1000;
  }
};

// Run validation on module load
validateConfig();

// Function to update config at runtime (if needed)
const updateConfig = (newConfig) => {
  Object.keys(newConfig).forEach(key => {
    if (API_CONFIG.hasOwnProperty(key)) {
      API_CONFIG[key] = newConfig[key];
    }
  });
  validateConfig();
};

// Export the configuration
export {
  API_CONFIG,
  validateConfig,
  updateConfig
};

// Export individual values as defaults for destructuring
export default API_CONFIG;