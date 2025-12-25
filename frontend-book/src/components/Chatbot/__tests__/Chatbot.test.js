/**
 * Unit tests for the Chatbot component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chatbot from '../Chatbot';

// Mock the child components
jest.mock('../ChatContainer', () => {
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="chat-container">Chat Container</div>)
  };
});

describe('Chatbot Component', () => {
  const defaultProps = {
    maxHistoryLength: 50,
    showSources: true,
    inputPlaceholder: 'Ask a question...',
    title: 'Documentation Assistant',
    theme: 'light'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default props', () => {
    render(<Chatbot />);

    // Check that the chatbot header is rendered
    expect(screen.getByRole('button', { name: /+/ })).toBeInTheDocument();
  });

  test('renders with custom props', () => {
    render(<Chatbot {...defaultProps} />);

    // Check that the custom title is rendered
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
  });

  test('initially shows closed state with floating button', () => {
    render(<Chatbot />);

    // Initially, the chat container should not be visible
    expect(screen.queryByTestId('chat-container')).not.toBeInTheDocument();

    // The floating button should be present
    const floatButton = screen.getByText('💬');
    expect(floatButton).toBeInTheDocument();
  });

  test('opens chat when toggle button is clicked', () => {
    render(<Chatbot />);

    // Click the toggle button to open chat
    const toggleButton = screen.getByRole('button', { name: /+/ });
    fireEvent.click(toggleButton);

    // The chat container should now be visible
    expect(screen.getByTestId('chat-container')).toBeInTheDocument();
  });

  test('opens chat when floating button is clicked', () => {
    render(<Chatbot />);

    // Click the floating button to open chat
    const floatButton = screen.getByText('💬');
    fireEvent.click(floatButton);

    // The chat container should now be visible
    expect(screen.getByTestId('chat-container')).toBeInTheDocument();
  });

  test('closes chat when toggle button is clicked again', () => {
    render(<Chatbot />);

    // Open the chat first
    const toggleButton = screen.getByRole('button', { name: /+/ });
    fireEvent.click(toggleButton);

    // Verify it's open
    expect(screen.getByTestId('chat-container')).toBeInTheDocument();

    // Close the chat
    fireEvent.click(toggleButton);

    // The chat container should no longer be visible
    expect(screen.queryByTestId('chat-container')).not.toBeInTheDocument();
  });

  test('toggles between open and close states', () => {
    render(<Chatbot />);

    const toggleButton = screen.getByRole('button', { name: /+/ });

    // Initially closed, floating button visible
    expect(screen.queryByTestId('chat-container')).not.toBeInTheDocument();
    expect(screen.getByText('💬')).toBeInTheDocument();

    // Open the chat
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('chat-container')).toBeInTheDocument();
    expect(screen.queryByText('💬')).not.toBeInTheDocument();

    // Close the chat
    fireEvent.click(toggleButton);
    expect(screen.queryByTestId('chat-container')).not.toBeInTheDocument();
    expect(screen.getByText('💬')).toBeInTheDocument();
  });

  test('applies correct theme class', () => {
    const { container } = render(<Chatbot theme="dark" />);

    expect(container.firstChild).toHaveClass('chatbot-theme-dark');
  });

  test('uses light theme by default', () => {
    const { container } = render(<Chatbot />);

    expect(container.firstChild).toHaveClass('chatbot-theme-light');
  });
});