import React from 'react';

/**
 * ErrorDisplay component shows error messages in a user-friendly way.
 */
const ErrorDisplay = ({
  error,
  severity = 'warning',
  onRetry = null,
  onClose = null,
  showIcon = true
}) => {
  // Determine error type and message
  let errorMessage = '';
  let errorTitle = '';

  if (typeof error === 'string') {
    errorMessage = error;
    errorTitle = severity.charAt(0).toUpperCase() + severity.slice(1);
  } else if (error && typeof error === 'object') {
    errorMessage = error.message || error.msg || 'An unknown error occurred';

    // Try to categorize the error
    if (errorMessage.includes('Network') || errorMessage.includes('timeout')) {
      errorTitle = 'Network Error';
    } else if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('auth')) {
      errorTitle = 'Authentication Error';
    } else if (errorMessage.includes('429')) {
      errorTitle = 'Rate Limit Exceeded';
    } else {
      errorTitle = severity.charAt(0).toUpperCase() + severity.slice(1);
    }
  } else {
    errorMessage = 'An unknown error occurred';
    errorTitle = 'Error';
  }

  // Severity-based styling
  const severityClasses = {
    error: 'error-display-error',
    warning: 'error-display-warning',
    info: 'error-display-info',
    success: 'error-display-success'
  };

  const currentSeverityClass = severityClasses[severity] || severityClasses.warning;

  return (
    <div className={`error-display ${currentSeverityClass}`}>
      {showIcon && (
        <div className="error-icon">
          {severity === 'error' && '❌'}
          {severity === 'warning' && '⚠️'}
          {severity === 'info' && 'ℹ️'}
          {severity === 'success' && '✅'}
        </div>
      )}
      <div className="error-content">
        <div className="error-title">{errorTitle}</div>
        <div className="error-message">{errorMessage}</div>
      </div>
      <div className="error-actions">
        {onRetry && (
          <button className="error-retry-btn" onClick={onRetry}>
            Retry
          </button>
        )}
        {onClose && (
          <button className="error-close-btn" onClick={onClose}>
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;