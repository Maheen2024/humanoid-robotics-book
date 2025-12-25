import React, { useState, useEffect } from 'react';
import ChatContainer from './ChatContainer';
import '@site/src/css/chatbot.css';

/**
 * Main Chatbot component that provides the interface for users to interact
 * with the RAG backend through the Docusaurus documentation site.
 *
 * @param {Object} props - Component properties
 * @param {number} [props.maxHistoryLength=50] - Maximum number of messages to display
 * @param {boolean} [props.showSources=true] - Whether to display source citations
 * @param {string} [props.inputPlaceholder="Ask a question about this documentation..."] - Placeholder text for input
 * @param {string} [props.title="Documentation Assistant"] - Title for the chatbot
 * @param {string} [props.theme="light"] - Theme for the chatbot (light/dark)
 */
const Chatbot = ({
  maxHistoryLength = 50,
  showSources = true,
  inputPlaceholder = "Ask a question about this documentation...",
  title = "Documentation Assistant",
  theme = "light"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`chatbot-container chatbot-theme-${theme}`}>
      {/* Chatbot header */}
      <div className="chatbot-header" onClick={toggleChat}>
        <h3>{title}</h3>
        <button className="chatbot-toggle">
          {isOpen ? '−' : '+'}
        </button>
      </div>

      {/* Chatbot content - only show when open */}
      {isOpen && (
        <div className="chatbot-content">
          <ChatContainer
            maxHistoryLength={maxHistoryLength}
            showSources={showSources}
            inputPlaceholder={inputPlaceholder}
          />
        </div>
      )}

      {/* Floating button when chat is closed */}
      {!isOpen && (
        <button className="chatbot-float-button" onClick={toggleChat}>
          💬
        </button>
      )}
    </div>
  );
};

export default Chatbot;