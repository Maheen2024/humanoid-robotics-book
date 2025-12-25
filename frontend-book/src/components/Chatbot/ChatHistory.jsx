import React from 'react';
import ChatMessage from './ChatMessage';

/**
 * ChatHistory component displays the list of messages in the chat.
 * It handles rendering each message and displaying source citations.
 */
const ChatHistory = ({ messages, maxHistoryLength, showSources }) => {
  // Limit messages to maxHistoryLength
  const displayMessages = messages.slice(-maxHistoryLength);

  return (
    <div className="chat-history">
      {displayMessages.length === 0 ? (
        <div className="empty-state">
          <p>Ask a question about this documentation!</p>
        </div>
      ) : (
        <div className="messages-container">
          {displayMessages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              showSources={showSources}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;