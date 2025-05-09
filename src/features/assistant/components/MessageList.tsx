import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../../types/chat';
import './MessageList.css';

interface MessageListProps {
  messages: ChatMessage[];
}

/**
 * MessageList Component
 * 
 * Displays the conversation history between the user and the AI assistant
 */
const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter out system messages which are used internally
  const visibleMessages = messages.filter(msg => msg.role !== 'system');
  
  return (
    <div className="message-list">
      {visibleMessages.length === 0 ? (
        <div className="empty-state">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        visibleMessages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.role === 'user' ? 'user' : 'assistant'} ${message.isLoading ? 'loading' : ''}`}
          >
            <div className="message-content">
              {message.isLoading ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : message.error ? (
                <div className="error-message">
                  <p>{message.content}</p>
                  <small className="error-details">Error: {message.error}</small>
                </div>
              ) : (
                // Use the formatted content if available, otherwise use regular content
                <div 
                  className="message-text"
                  dangerouslySetInnerHTML={{ __html: message.formattedContent || message.content.replace(/\n/g, '<br>') }}
                />
              )}
            </div>
            <div className="message-timestamp">
              {!message.isLoading && new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;