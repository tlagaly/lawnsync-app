import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import MessageList from '../../../features/assistant/components/MessageList';
import type { ChatMessage } from '../../../types/chat';

describe('MessageList Component', () => {
  const mockMessages: ChatMessage[] = [
    {
      id: 'system-1',
      content: 'I am a system message that should not be visible',
      role: 'system',
      timestamp: new Date().toISOString()
    },
    {
      id: 'assistant-1',
      content: 'Hello! How can I help with your lawn care today?',
      role: 'assistant',
      timestamp: new Date().toISOString()
    },
    {
      id: 'user-1',
      content: 'My grass is turning yellow. What could be the problem?',
      role: 'user',
      timestamp: new Date().toISOString()
    },
    {
      id: 'assistant-2',
      content: 'There are several reasons why grass might turn yellow:\n\n1. Overwatering\n2. Underwatering\n3. Nutrient deficiency\n4. Disease\n\nCould you provide more details about your watering schedule and when you last fertilized?',
      formattedContent: 'There are several reasons why grass might turn yellow:<br/><br/>1. <strong>Overwatering</strong><br/>2. <strong>Underwatering</strong><br/>3. <strong>Nutrient deficiency</strong><br/>4. <strong>Disease</strong><br/><br/>Could you provide more details about your watering schedule and when you last fertilized?',
      role: 'assistant',
      timestamp: new Date().toISOString()
    }
  ];

  test('renders correctly with messages', () => {
    render(<MessageList messages={mockMessages} />);
    
    // System message should not be displayed
    expect(screen.queryByText('I am a system message that should not be visible')).not.toBeInTheDocument();
    
    // User and assistant messages should be displayed
    expect(screen.getByText('Hello! How can I help with your lawn care today?')).toBeInTheDocument();
    expect(screen.getByText('My grass is turning yellow. What could be the problem?')).toBeInTheDocument();
    
    // Should render formatted content when available
    const formattedMessage = screen.getByText(/There are several reasons why grass might turn yellow:/i);
    expect(formattedMessage).toBeInTheDocument();
    
    // Verify the message classes
    const userMessage = screen.getByText('My grass is turning yellow. What could be the problem?').closest('.message');
    const assistantMessage = screen.getByText('Hello! How can I help with your lawn care today?').closest('.message');
    
    expect(userMessage).toHaveClass('user');
    expect(assistantMessage).toHaveClass('assistant');
  });

  test('renders empty state when no messages', () => {
    render(<MessageList messages={[]} />);
    expect(screen.getByText('No messages yet. Start a conversation!')).toBeInTheDocument();
  });

  test('renders loading state for messages in progress', () => {
    const loadingMessages: ChatMessage[] = [
      ...mockMessages,
      {
        id: 'loading-1',
        content: '',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        isLoading: true
      }
    ];
    
    render(<MessageList messages={loadingMessages} />);
    
    // Should render the typing indicator for the loading message
    const loadingIndicator = document.querySelector('.typing-indicator');
    expect(loadingIndicator).toBeInTheDocument();
  });

  test('renders error state for failed messages', () => {
    const errorMessages: ChatMessage[] = [
      ...mockMessages,
      {
        id: 'error-1',
        content: 'Sorry, I encountered an error processing your request.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        error: 'API rate limit exceeded'
      }
    ];
    
    render(<MessageList messages={errorMessages} />);
    
    // Should render the error message
    expect(screen.getByText('Sorry, I encountered an error processing your request.')).toBeInTheDocument();
    expect(screen.getByText('Error: API rate limit exceeded')).toBeInTheDocument();
  });
});