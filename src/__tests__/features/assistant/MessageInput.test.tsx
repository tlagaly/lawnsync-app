import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import MessageInput from '../../../features/assistant/components/MessageInput';

describe('MessageInput Component', () => {
  test('renders correctly with default props', () => {
    const handleSendMessage = vi.fn();
    render(<MessageInput onSendMessage={handleSendMessage} />);
    
    // Check if input field exists with placeholder
    const inputElement = screen.getByPlaceholderText('Ask me about your lawn care...');
    expect(inputElement).toBeInTheDocument();
    
    // Check if send button is disabled by default (empty input)
    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeDisabled();
    
    // Character counter should show 0/2000
    expect(screen.getByText('0/2000')).toBeInTheDocument();
  });

  test('enables send button when text is entered', () => {
    const handleSendMessage = vi.fn();
    render(<MessageInput onSendMessage={handleSendMessage} />);
    
    const inputElement = screen.getByPlaceholderText('Ask me about your lawn care...');
    const sendButton = screen.getByRole('button');
    
    // Initial state - button should be disabled
    expect(sendButton).toBeDisabled();
    
    // Enter text
    fireEvent.change(inputElement, { target: { value: 'How do I water my lawn?' } });
    
    // Button should be enabled now
    expect(sendButton).not.toBeDisabled();
    
    // Character counter should be updated
    expect(screen.getByText('23/2000')).toBeInTheDocument();
  });

  test('calls onSendMessage when send button is clicked', () => {
    const handleSendMessage = vi.fn();
    render(<MessageInput onSendMessage={handleSendMessage} />);
    
    const inputElement = screen.getByPlaceholderText('Ask me about your lawn care...');
    const sendButton = screen.getByRole('button');
    
    // Enter text and click send
    fireEvent.change(inputElement, { target: { value: 'How do I water my lawn?' } });
    fireEvent.click(sendButton);
    
    // Check if onSendMessage was called with the correct text
    expect(handleSendMessage).toHaveBeenCalledWith('How do I water my lawn?');
    
    // Input should be cleared after sending
    expect(inputElement).toHaveValue('');
  });

  test('sends message when Enter key is pressed', () => {
    const handleSendMessage = vi.fn();
    render(<MessageInput onSendMessage={handleSendMessage} />);
    
    const inputElement = screen.getByPlaceholderText('Ask me about your lawn care...');
    
    // Enter text and press Enter
    fireEvent.change(inputElement, { target: { value: 'When should I fertilize?' } });
    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter' });
    
    // Check if onSendMessage was called with the correct text
    expect(handleSendMessage).toHaveBeenCalledWith('When should I fertilize?');
    
    // Input should be cleared after sending
    expect(inputElement).toHaveValue('');
  });

  test('does not send message when Shift+Enter is pressed (for newlines)', () => {
    const handleSendMessage = vi.fn();
    render(<MessageInput onSendMessage={handleSendMessage} />);
    
    const inputElement = screen.getByPlaceholderText('Ask me about your lawn care...');
    
    // Enter text and press Shift+Enter
    fireEvent.change(inputElement, { target: { value: 'When should I fertilize?' } });
    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    // onSendMessage should not be called
    expect(handleSendMessage).not.toHaveBeenCalled();
    
    // Input value should remain
    expect(inputElement).toHaveValue('When should I fertilize?');
  });

  test('disables input and shows loading state when isLoading is true', () => {
    const handleSendMessage = vi.fn();
    render(<MessageInput onSendMessage={handleSendMessage} isLoading={true} />);
    
    const inputElement = screen.getByPlaceholderText('Ask me about your lawn care...');
    const sendButton = screen.getByRole('button');
    
    // Input should be disabled
    expect(inputElement).toBeDisabled();
    
    // Send button should be disabled
    expect(sendButton).toBeDisabled();
    
    // Loading spinner should be visible
    const loadingSpinner = document.querySelector('.loading-spinner');
    expect(loadingSpinner).toBeInTheDocument();
  });

  test('changes character counter color when approaching limit', () => {
    const handleSendMessage = vi.fn();
    render(<MessageInput onSendMessage={handleSendMessage} maxLength={10} />);
    
    const inputElement = screen.getByPlaceholderText('Ask me about your lawn care...');
    
    // Enter text just below limit (8/10 = 80%)
    fireEvent.change(inputElement, { target: { value: '12345678' } });
    
    const characterCounter = screen.getByText('8/10');
    expect(characterCounter).toHaveClass('near-limit');
    
    // Enter text at limit
    fireEvent.change(inputElement, { target: { value: '1234567890' } });
    
    const limitCounter = screen.getByText('10/10');
    expect(limitCounter).toHaveClass('at-limit');
  });
});