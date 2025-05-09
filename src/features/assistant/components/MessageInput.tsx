import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  maxLength?: number;
  placeholder?: string;
}

/**
 * MessageInput Component
 * 
 * Provides an input field for users to type and send messages to the AI assistant
 */
const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading = false,
  maxLength = 2000,
  placeholder = "Ask me about your lawn care..."
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus the input field when the component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Auto-resize the textarea as the user types
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim and validate message before sending
    const trimmedMessage = message.trim();
    if (trimmedMessage && trimmedMessage.length <= maxLength && !isLoading) {
      onSendMessage(trimmedMessage);
      setMessage('');
      
      // Reset height of textarea after clearing
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (but not with Shift+Enter for newlines)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Calculate character count and get percentage of limit used
  const characterCount = message.length;
  const characterPercentage = Math.round((characterCount / maxLength) * 100);
  const isNearLimit = characterPercentage >= 80;
  const isAtLimit = characterCount >= maxLength;
  
  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <div className="input-container">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          maxLength={maxLength}
          rows={1}
          className={`message-textarea ${isAtLimit ? 'at-limit' : isNearLimit ? 'near-limit' : ''}`}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!message.trim() || isLoading || message.length > maxLength}
        >
          {isLoading ? (
            <span className="loading-spinner"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
      <div className="message-footer">
        <span className={`character-counter ${isAtLimit ? 'at-limit' : isNearLimit ? 'near-limit' : ''}`}>
          {characterCount}/{maxLength}
        </span>
        <span className="input-tip">
          Press Enter to send, Shift+Enter for new line
        </span>
      </div>
    </form>
  );
};

export default MessageInput;