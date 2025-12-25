import React, { useState, useEffect, useRef } from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { queryRag } from '../ApiClient/apiClient';

/**
 * ChatContainer manages the state and logic for the chat interface.
 * It handles user input, communicates with the backend API, and manages the chat history.
 */
const ChatContainer = ({ maxHistoryLength, showSources, inputPlaceholder }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Handle sending a message to the backend
   * @param {string} messageText - The user's message
   */
  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) {
      return;
    }

    // Add user message to history
    const userMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: messageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Get current page context if available
      const pageContext = typeof window !== 'undefined' ? window.location.pathname : '';

      // Send request to backend
      const response = await queryRag({
        query: messageText,
        max_chunks: 5,
        temperature: 0.1,
        include_sources: showSources,
        timeout: 30,
        pageContext: pageContext
      });

      if (response.success) {
        const assistantMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: response.data.answer,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          sources: response.data.sources || [],
          status: 'delivered'
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Set session ID if not already set
        if (!sessionId) {
          setSessionId(response.request_id);
        }
      } else {
        throw new Error(response.error?.message || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err.message);

      // Add error message to history
      const errorMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        status: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle retrying the last failed request
   */
  const handleRetry = () => {
    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(msg => msg.sender === 'user');

    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  /**
   * Handle closing the error display
   */
  const handleCloseError = () => {
    setError(null);
  };

  /**
   * Clear the chat history
   */
  const handleClearHistory = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h4>Chat</h4>
        <button className="clear-history-btn" onClick={handleClearHistory}>
          Clear
        </button>
      </div>

      {error && (
        <ErrorDisplay
          error={error}
          severity="error"
          onRetry={handleRetry}
          onClose={handleCloseError}
        />
      )}

      <ChatHistory
        messages={messages}
        maxHistoryLength={maxHistoryLength}
        showSources={showSources}
      />

      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder={inputPlaceholder}
      />

      {isLoading && (
        <div className="loading-overlay">
          <LoadingSpinner message="Processing your question..." />
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContainer;