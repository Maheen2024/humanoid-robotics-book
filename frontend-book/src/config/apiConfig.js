/**
 * API Configuration module for handling environment variables in Docusaurus
 */

// Default configuration values
const DEFAULT_CONFIG = {
  API_BASE_URL: 'http://localhost:8000',
  API_KEY: '',
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
  CHATBOT_ENABLED: true,
  MAX_HISTORY_LENGTH: 50,
  AUTO_SCROLL: true,
  DEBUG: false
};

// Function to get configuration value
export const getApiConfig = (key) => {
  // In browser environment, check for global config
  if (typeof window !== 'undefined' && window.DOCUSAURUS_CONFIG) {
    return window.DOCUSAURUS_CONFIG[key] || DEFAULT_CONFIG[key];
  }

  // In Node.js environment (build time), check process.env
  if (typeof process !== 'undefined' && process.env) {
    // Map environment variable names to config keys
    const envMap = {
      'API_BASE_URL': 'REACT_APP_API_BASE_URL',
      'API_KEY': 'REACT_APP_API_KEY',
      'TIMEOUT_MS': 'REACT_APP_TIMEOUT_MS',
      'RETRY_ATTEMPTS': 'REACT_APP_RETRY_ATTEMPTS',
      'CHATBOT_ENABLED': 'REACT_APP_CHATBOT_ENABLED',
      'MAX_HISTORY_LENGTH': 'REACT_APP_MAX_HISTORY_LENGTH',
      'AUTO_SCROLL': 'REACT_APP_AUTO_SCROLL',
      'DEBUG': 'REACT_APP_DEBUG'
    };

    const envVarName = envMap[key];
    if (envVarName && process.env[envVarName] !== undefined) {
      const value = process.env[envVarName];
      // Convert string values to appropriate types
      switch (key) {
        case 'TIMEOUT_MS':
        case 'RETRY_ATTEMPTS':
        case 'MAX_HISTORY_LENGTH':
          return parseInt(value, 10) || DEFAULT_CONFIG[key];
        case 'CHATBOT_ENABLED':
        case 'AUTO_SCROLL':
        case 'DEBUG':
          return value === 'true' || value === true || DEFAULT_CONFIG[key];
        default:
          return value || DEFAULT_CONFIG[key];
      }
    }
  }

  // Return default value
  return DEFAULT_CONFIG[key];
};

// Get all config as an object
export const getAllApiConfig = () => {
  const config = {};
  Object.keys(DEFAULT_CONFIG).forEach(key => {
    config[key] = getApiConfig(key);
  });
  return config;
};

// Export default values as well
export default DEFAULT_CONFIG;