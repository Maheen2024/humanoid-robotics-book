import React from 'react';

/**
 * ChatMessage component displays a single message in the chat.
 * It handles rendering user and assistant messages differently.
 */
const ChatMessage = ({ message, showSources }) => {
  const { sender, content, sources, timestamp, status } = message;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-message ${sender}-message status-${status}`}>
      <div className="message-header">
        <span className="sender-name">{sender === 'user' ? 'You' : 'Assistant'}</span>
        <span className="timestamp">{formatDate(timestamp)}</span>
      </div>
      <div className="message-content">
        {content}
      </div>
      {sender === 'assistant' && showSources && sources && sources.length > 0 && (
        <div className="message-sources">
          <h5>Sources:</h5>
          <ul>
            {sources.map((source, index) => (
              <li key={index}>
                <a href={source.source_url} target="_blank" rel="noopener noreferrer">
                  {source.source_title}
                </a>
                {source.relevance_score && (
                  <span className="relevance-score"> ({(source.relevance_score * 100).toFixed(0)}%)</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;