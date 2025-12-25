/**
 * Configuration management for the Docusaurus Chatbot frontend
 */

// Default configuration values
const DEFAULT_CONFIG = {
  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
    apiKey: process.env.REACT_APP_API_KEY || '',
    timeout: parseInt(process.env.REACT_APP_TIMEOUT_MS || '30000', 10),
    retryAttempts: parseInt(process.env.REACT_APP_RETRY_ATTEMPTS || '3', 10),
  },

  // Chatbot Configuration
  chatbot: {
    enabled: process.env.REACT_APP_CHATBOT_ENABLED === 'true',
    maxHistoryLength: parseInt(process.env.REACT_APP_MAX_HISTORY_LENGTH || '50', 10),
    autoScroll: process.env.REACT_APP_AUTO_SCROLL === 'true',
    inputPlaceholder: process.env.REACT_APP_INPUT_PLACEHOLDER || 'Ask a question about this documentation...',
    title: process.env.REACT_APP_CHATBOT_TITLE || 'Documentation Assistant',
    theme: process.env.REACT_APP_CHATBOT_THEME || 'light',
  },

  // UI Configuration
  ui: {
    maxMessageLength: 2000,
    maxSourcesToShow: 5,
    showSources: true,
    showTimestamps: true,
    animateMessages: true,
  },

  // Behavior Configuration
  behavior: {
    enableTypingIndicator: true,
    enableQuickSuggestions: true,
    enableMessagePersistence: true,
    enableSessionStorage: true,
    sessionTimeoutMinutes: 30,
  },

  // Validation Constraints
  validation: {
    maxQueryLength: 1000,
    maxChunksRange: { min: 1, max: 10 },
    temperatureRange: { min: 0.0, max: 1.0 },
    timeoutRange: { min: 5, max: 60 },
  },

  // Default API Parameter Values
  defaults: {
    maxChunks: 5,
    temperature: 0.1,
    includeSources: true,
    timeoutSeconds: 30,
  }
};

// Validate configuration values
const validateConfig = (config) => {
  const errors = [];

  // Validate API configuration
  if (typeof config.api.timeout !== 'number' || config.api.timeout <= 0) {
    errors.push(`Invalid API timeout: ${config.api.timeout}`);
  }

  if (typeof config.api.retryAttempts !== 'number' || config.api.retryAttempts < 0) {
    errors.push(`Invalid retry attempts: ${config.api.retryAttempts}`);
  }

  // Validate chatbot configuration
  if (typeof config.chatbot.maxHistoryLength !== 'number' || config.chatbot.maxHistoryLength <= 0) {
    errors.push(`Invalid max history length: ${config.chatbot.maxHistoryLength}`);
  }

  // Validate UI configuration
  if (typeof config.ui.maxMessageLength !== 'number' || config.ui.maxMessageLength <= 0) {
    errors.push(`Invalid max message length: ${config.ui.maxMessageLength}`);
  }

  // Validate behavior configuration
  if (typeof config.behavior.sessionTimeoutMinutes !== 'number' || config.behavior.sessionTimeoutMinutes <= 0) {
    errors.push(`Invalid session timeout: ${config.behavior.sessionTimeoutMinutes}`);
  }

  return errors;
};

// Configuration manager class
class ConfigManager {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.errors = validateConfig(this.config);

    if (this.errors.length > 0) {
      console.warn('Configuration validation errors:', this.errors);
    }
  }

  /**
   * Get the current configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get a specific configuration value by path
   * @param {string} path - Dot notation path (e.g. 'api.baseUrl')
   * @returns {*} Configuration value
   */
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }

  /**
   * Update configuration values
   * @param {Object} newConfig - New configuration values to merge
   * @returns {Array} Array of validation errors
   */
  update(newConfig) {
    this.config = this.deepMerge(this.config, newConfig);
    this.errors = validateConfig(this.config);

    if (this.errors.length > 0) {
      console.warn('Updated configuration has validation errors:', this.errors);
    }

    return this.errors;
  }

  /**
   * Reset configuration to defaults
   */
  reset() {
    this.config = { ...DEFAULT_CONFIG };
    this.errors = validateConfig(this.config);
  }

  /**
   * Check if configuration is valid
   * @returns {boolean} True if no validation errors
   */
  isValid() {
    return this.errors.length === 0;
  }

  /**
   * Get validation errors
   * @returns {Array} Array of validation errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Deep merge two objects
   * @private
   */
  deepMerge(target, source) {
    const output = { ...target };

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }

    return output;
  }

  /**
   * Check if value is an object
   * @private
   */
  isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }
}

// Create a singleton instance
const configManager = new ConfigManager();

// Export the configuration manager and default config
export {
  DEFAULT_CONFIG,
  validateConfig,
  ConfigManager,
  configManager as default
};