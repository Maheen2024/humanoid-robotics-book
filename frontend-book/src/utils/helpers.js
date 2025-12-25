/**
 * Helper functions for the Docusaurus Chatbot frontend
 */

/**
 * Generate a unique ID for messages and sessions
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Unique identifier
 */
export const generateId = (prefix = '') => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}_${randomPart}`;
};

/**
 * Format a timestamp to a human-readable string
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted time string
 */
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format a timestamp to date and time string
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/**
 * Validate a query string
 * @param {string} query - The query to validate
 * @param {number} maxLength - Maximum allowed length (default: 1000)
 * @returns {Array} Array of errors, empty if valid
 */
export const validateQuery = (query, maxLength = 1000) => {
  const errors = [];

  if (!query) {
    errors.push('Query is required');
  } else {
    if (typeof query !== 'string') {
      errors.push('Query must be a string');
    }

    if (query.trim().length === 0) {
      errors.push('Query cannot be empty');
    }

    if (query.length > maxLength) {
      errors.push(`Query exceeds maximum length of ${maxLength} characters`);
    }
  }

  return errors;
};

/**
 * Validate parameter ranges
 * @param {*} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} paramName - Name of the parameter for error message
 * @returns {Array} Array of errors, empty if valid
 */
export const validateRange = (value, min, max, paramName) => {
  const errors = [];

  if (value < min || value > max) {
    errors.push(`${paramName} must be between ${min} and ${max}`);
  }

  return errors;
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }

  // Basic XSS prevention - remove potentially dangerous content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }

  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Check if a value is a valid URL
 * @param {string} string - String to check
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Get current page context
 * @returns {string} Current page URL or path
 */
export const getPageContext = () => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
};

/**
 * Sleep function for delaying execution
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after ms milliseconds
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Format bytes to human readable string
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted size string
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 * @param {string} filename - Filename to extract extension from
 * @returns {string} File extension
 */
export const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return '';
  }

  return filename.substring(lastDotIndex + 1).toLowerCase();
};