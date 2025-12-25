/**
 * Chat session management utilities for the Docusaurus Chatbot frontend
 */

import { generateId } from './helpers';

// Constants for session management
const SESSION_STORAGE_KEY = 'docusaurus_chat_session';
const MAX_HISTORY_LENGTH = 50;
const SESSION_TIMEOUT_MINUTES = 30;

/**
 * Class representing a chat session
 */
class ChatSession {
  constructor(sessionId = null) {
    this.id = sessionId || generateId('session_');
    this.messages = [];
    this.createdAt = new Date().toISOString();
    this.lastActive = new Date().toISOString();
    this.pageContext = this.getCurrentPageContext();
    this.isActive = true;
  }

  /**
   * Add a message to the session
   * @param {Object} message - The message to add
   * @param {string} message.id - Message ID
   * @param {string} message.content - Message content
   * @param {string} message.sender - Sender ('user' or 'assistant')
   * @param {string} message.timestamp - Timestamp
   * @param {Array} [message.sources] - Sources for assistant messages
   * @param {string} [message.status] - Message status ('pending', 'sent', 'delivered', 'error')
   */
  addMessage(message) {
    // Validate message
    if (!message || !message.id || !message.content || !message.sender || !message.timestamp) {
      throw new Error('Invalid message: missing required properties');
    }

    // Check sender is valid
    if (!['user', 'assistant'].includes(message.sender)) {
      throw new Error('Invalid message sender: must be "user" or "assistant"');
    }

    // Add message to history
    this.messages.push(message);

    // Update last active timestamp
    this.lastActive = new Date().toISOString();

    // Limit history length
    if (this.messages.length > MAX_HISTORY_LENGTH) {
      this.messages = this.messages.slice(-MAX_HISTORY_LENGTH);
    }

    return this;
  }

  /**
   * Get messages from the session
   * @param {number} limit - Maximum number of messages to return (default: all)
   * @returns {Array} Array of messages
   */
  getMessages(limit = null) {
    if (limit && limit > 0) {
      return this.messages.slice(-limit);
    }
    return [...this.messages]; // Return a copy
  }

  /**
   * Get the last message in the session
   * @returns {Object|null} Last message or null if no messages
   */
  getLastMessage() {
    if (this.messages.length === 0) {
      return null;
    }
    return this.messages[this.messages.length - 1];
  }

  /**
   * Clear all messages from the session
   */
  clearMessages() {
    this.messages = [];
    this.lastActive = new Date().toISOString();
    return this;
  }

  /**
   * Update page context for the session
   * @param {string} pageContext - New page context
   */
  updatePageContext(pageContext) {
    this.pageContext = pageContext || this.getCurrentPageContext();
    this.lastActive = new Date().toISOString();
    return this;
  }

  /**
   * Check if the session is expired
   * @returns {boolean} True if session is expired
   */
  isExpired() {
    const now = new Date();
    const lastActive = new Date(this.lastActive);
    const timeDiffMinutes = (now - lastActive) / (1000 * 60);
    return timeDiffMinutes > SESSION_TIMEOUT_MINUTES;
  }

  /**
   * Deactivate the session
   */
  deactivate() {
    this.isActive = false;
    return this;
  }

  /**
   * Activate the session
   */
  activate() {
    this.isActive = true;
    this.lastActive = new Date().toISOString();
    return this;
  }

  /**
   * Get current page context
   * @returns {string} Current page URL or path
   */
  getCurrentPageContext() {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '';
  }

  /**
   * Convert session to JSON for serialization
   * @returns {Object} Serializable session object
   */
  toJSON() {
    return {
      id: this.id,
      messages: this.messages,
      createdAt: this.createdAt,
      lastActive: this.lastActive,
      pageContext: this.pageContext,
      isActive: this.isActive
    };
  }

  /**
   * Create a ChatSession from a JSON object
   * @param {Object} json - Serialized session object
   * @returns {ChatSession} New ChatSession instance
   */
  static fromJSON(json) {
    if (!json || !json.id) {
      throw new Error('Invalid session data: missing required properties');
    }

    const session = new ChatSession(json.id);
    session.messages = json.messages || [];
    session.createdAt = json.createdAt || new Date().toISOString();
    session.lastActive = json.lastActive || new Date().toISOString();
    session.pageContext = json.pageContext || '';
    session.isActive = json.isActive !== undefined ? json.isActive : true;

    return session;
  }

  /**
   * Check if a session exists in storage
   * @returns {boolean} True if session exists in storage
   */
  static hasStoredSession() {
    if (typeof window === 'undefined') {
      return false;
    }

    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    return !!stored;
  }

  /**
   * Load session from storage
   * @returns {ChatSession|null} Loaded session or null if not found/expired
   */
  static loadFromStorage() {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored);
      const session = ChatSession.fromJSON(parsed);

      // Check if session is expired
      if (session.isExpired()) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error loading session from storage:', error);
      // Remove corrupted session data
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (removeError) {
        console.error('Error removing corrupted session:', removeError);
      }
      return null;
    }
  }

  /**
   * Save session to storage
   * @returns {boolean} True if save was successful
   */
  saveToStorage() {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const serialized = JSON.stringify(this.toJSON());
      localStorage.setItem(SESSION_STORAGE_KEY, serialized);
      return true;
    } catch (error) {
      console.error('Error saving session to storage:', error);
      return false;
    }
  }

  /**
   * Remove session from storage
   */
  static removeFromStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  /**
   * Create a new session and save it to storage
   * @param {string} [sessionId] - Optional session ID
   * @returns {ChatSession} New session instance
   */
  static createAndSave(sessionId = null) {
    const session = new ChatSession(sessionId);
    session.saveToStorage();
    return session;
  }
}

/**
 * Hook-like function to manage chat session state
 * @param {string} [initialSessionId] - Optional initial session ID
 * @returns {Object} Session management functions
 */
const useChatSession = (initialSessionId = null) => {
  // Try to load existing session or create new one
  let session = ChatSession.loadFromStorage();

  if (!session || session.isExpired()) {
    session = ChatSession.createAndSave(initialSessionId);
  } else if (initialSessionId && session.id !== initialSessionId) {
    // If a specific session ID was requested, create a new session
    session = ChatSession.createAndSave(initialSessionId);
  }

  return {
    session,
    addMessage: (message) => {
      session.addMessage(message);
      session.saveToStorage();
      return session;
    },
    getMessages: (limit = null) => session.getMessages(limit),
    clearMessages: () => {
      session.clearMessages();
      session.saveToStorage();
      return session;
    },
    updatePageContext: (pageContext) => {
      session.updatePageContext(pageContext);
      session.saveToStorage();
      return session;
    },
    isExpired: () => session.isExpired(),
    deactivate: () => {
      session.deactivate();
      session.saveToStorage();
      return session;
    },
    activate: () => {
      session.activate();
      session.saveToStorage();
      return session;
    }
  };
};

export { ChatSession, useChatSession };
export default ChatSession;