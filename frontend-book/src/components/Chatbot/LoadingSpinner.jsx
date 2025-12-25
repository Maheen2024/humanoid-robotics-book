import React from 'react';

/**
 * LoadingSpinner component displays a visual indicator when the chatbot is processing a request.
 */
const LoadingSpinner = ({ message = 'Thinking...', size = 'medium' }) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner ${currentSizeClass}`}>
        <div className="spinner-circle spinner-circle-1"></div>
        <div className="spinner-circle spinner-circle-2"></div>
        <div className="spinner-circle spinner-circle-3"></div>
      </div>
      {message && (
        <div className="loading-message">
          {message}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;