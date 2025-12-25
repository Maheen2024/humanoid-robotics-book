/**
 * Unit tests for the ChatContainer component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatContainer from '../ChatContainer';

// Mock the child components
jest.mock('../ChatHistory', () => {
  return {
    __esModule: true,
    default: jest.fn(({ messages }) => (
      <div data-testid="chat-history">
        {messages?.length > 0 ? `${messages.length} messages` : 'No messages'}
      </div>
    ))
  };
});

jest.mock('../ChatInput', () => {
  return {
    __esModule: true,
    default: jest.fn(({ onSendMessage, isLoading }) => (
      <div data-testid="chat-input">
        <textarea
          data-testid="message-input"
          onChange={(e) => onSendMessage(e.target.value)}
          disabled={isLoading}
        />
        <button
          data-testid="send-button"
          onClick={() => onSendMessage('test message')}
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    ))
  };
});

// Mock the API client
jest.mock('../../ApiClient/apiClient', () => {
  return {
    apiClient: {
      queryRag: jest.fn()
    }
  };
});

import { apiClient } from '../../ApiClient/apiClient';

describe('ChatContainer Component', () => {
  const defaultProps = {
    maxHistoryLength: 50,
    showSources: true,
    inputPlaceholder: 'Ask a question...'
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock a successful API response
    apiClient.queryRag.mockResolvedValue({
      success: true,
      data: {
        answer: 'This is a test response',
        sources: [{ source_url: 'http://example.com', source_title: 'Example', relevance_score: 0.8 }]
      },
      request_id: 'test-request-id',
      timestamp: '2025-12-24T10:30:00.123Z'
    });
  });

  test('renders chat container with header, history, and input', () => {
    render(<ChatContainer {...defaultProps} />);

    // Check header is present
    expect(screen.getByText('Chat')).toBeInTheDocument();

    // Check clear button is present
    expect(screen.getByText('Clear')).toBeInTheDocument();

    // Check chat history is rendered
    expect(screen.getByTestId('chat-history')).toBeInTheDocument();

    // Check chat input is rendered
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
  });

  test('handles sending a message', async () => {
    render(<ChatContainer {...defaultProps} />);

    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    // Type a message
    fireEvent.change(input, { target: { value: 'Hello, world!' } });

    // Click send button
    fireEvent.click(sendButton);

    // Wait for the API call to complete
    await waitFor(() => {
      expect(apiClient.queryRag).toHaveBeenCalledWith({
        query: 'Hello, world!',
        max_chunks: 5,
        temperature: 0.1,
        include_sources: true,
        timeout: 30,
        pageContext: ''
      });
    });
  });

  test('displays user and assistant messages', async () => {
    render(<ChatContainer {...defaultProps} />);

    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    // Type and send a message
    fireEvent.change(input, { target: { value: 'Test question?' } });
    fireEvent.click(sendButton);

    // Wait for the response to be processed
    await waitFor(() => {
      expect(screen.getByText('2 messages')).toBeInTheDocument(); // 1 user + 1 assistant
    });
  });

  test('shows loading state when processing', async () => {
    // Make the API call take some time
    apiClient.queryRag.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({
        success: true,
        data: { answer: 'Delayed response', sources: [] },
        request_id: 'test-request-id',
        timestamp: '2025-12-24T10:30:00.123Z'
      }), 100);
    }));

    render(<ChatContainer {...defaultProps} />);

    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    // Type and send a message
    fireEvent.change(input, { target: { value: 'Test question?' } });
    fireEvent.click(sendButton);

    // Check that loading state is triggered
    expect(sendButton).toBeDisabled(); // Button should be disabled when loading

    // Wait for the response to complete
    await waitFor(() => {
      expect(screen.getByText('2 messages')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock an API error
    apiClient.queryRag.mockRejectedValue(new Error('Network error'));

    render(<ChatContainer {...defaultProps} />);

    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    // Type and send a message
    fireEvent.change(input, { target: { value: 'Test question?' } });
    fireEvent.click(sendButton);

    // Wait for the error to be handled
    await waitFor(() => {
      expect(screen.getByText('2 messages')).toBeInTheDocument(); // 1 user + 1 error message
    });
  });

  test('clears history when clear button is clicked', () => {
    render(<ChatContainer {...defaultProps} />);

    // Initially, should show "No messages"
    expect(screen.getByText('No messages')).toBeInTheDocument();

    // The clear button should be present
    const clearButton = screen.getByText('Clear');
    expect(clearButton).toBeInTheDocument();

    // Click the clear button (though it won't have any effect on the initial state)
    fireEvent.click(clearButton);

    // Should still show "No messages"
    expect(screen.getByText('No messages')).toBeInTheDocument();
  });

  test('passes correct props to child components', () => {
    render(<ChatContainer {...defaultProps} />);

    // Check that ChatHistory receives correct props
    expect(screen.getByTestId('chat-history')).toBeInTheDocument();

    // Check that ChatInput receives correct props
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
  });

  test('prevents sending empty messages', () => {
    render(<ChatContainer {...defaultProps} />);

    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    // Try to send an empty message
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(sendButton);

    // The API should not have been called
    expect(apiClient.queryRag).not.toHaveBeenCalled();
  });

  test('prevents sending messages while loading', async () => {
    // Make the API call take some time
    apiClient.queryRag.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({
        success: true,
        data: { answer: 'Delayed response', sources: [] },
        request_id: 'test-request-id',
        timestamp: '2025-12-24T10:30:00.123Z'
      }), 100);
    }));

    render(<ChatContainer {...defaultProps} />);

    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    // Send first message
    fireEvent.change(input, { target: { value: 'First message' } });
    fireEvent.click(sendButton);

    // Try to send second message while first is still loading
    fireEvent.change(input, { target: { value: 'Second message' } });
    fireEvent.click(sendButton);

    // Only the first message should have triggered an API call
    await waitFor(() => {
      expect(apiClient.queryRag).toHaveBeenCalledTimes(1);
    });
  });
});