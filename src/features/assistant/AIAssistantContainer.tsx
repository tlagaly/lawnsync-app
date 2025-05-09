import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './AIAssistantContainer.css';

// Component imports
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import QuickPrompt from './components/QuickPrompt';
import ClearChatDialog from './components/ClearChatDialog';

// Service and type imports
import type { ChatMessage, Conversation } from '../../types/chat';
import {
  getCurrentConversation,
  sendMessage,
  clearChatHistory,
  quickPrompts
} from '../../lib/chatService';

/**
 * AIAssistantContainer Component
 *
 * Chat-based interface for AI lawn care assistance
 * Provides personalized recommendations and advice
 */
const AIAssistantContainer: React.FC = () => {
  // State
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showClearDialog, setShowClearDialog] = useState<boolean>(false);

  // Get or create a conversation on component mount
  useEffect(() => {
    // Use a dummy user ID for now, in a real app this would come from authentication
    const userId = 'user123';
    const currentConversation = getCurrentConversation(userId);
    setConversation(currentConversation);
  }, []);

  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!conversation || !content.trim()) return;

    setIsLoading(true);
    
    try {
      await sendMessage(conversation.id, conversation.userId, content);
      
      // Refresh the conversation to get the latest messages
      const updatedConversation = getCurrentConversation(conversation.userId);
      setConversation(updatedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add an error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: 'Sorry, there was an error processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      };
      
      // Update conversation with error message
      if (conversation) {
        const updatedMessages = [...conversation.messages, errorMessage];
        setConversation({
          ...conversation,
          messages: updatedMessages,
          updatedAt: new Date().toISOString()
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a quick prompt
  const handleSelectPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  // Handle clearing the chat history
  const handleClearChat = () => {
    setShowClearDialog(true);
  };

  // Confirm clearing the chat history
  const confirmClearChat = () => {
    if (conversation) {
      clearChatHistory(conversation.userId);
      
      // Get the fresh conversation
      const newConversation = getCurrentConversation(conversation.userId);
      setConversation(newConversation);
    }
    
    setShowClearDialog(false);
  };

  // If conversation is still loading, show a placeholder
  if (!conversation) {
    return (
      <div className="ai-assistant-container">
        <div className="ai-assistant-loading">
          <div className="loading-spinner-large"></div>
          <p>Loading chat assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-assistant-container">
      <div className="ai-assistant-header">
        <div className="header-left">
          <h1>AI Lawn Assistant</h1>
          <p className="subtitle">Your personal lawn care expert</p>
        </div>
        <div className="header-actions">
          <button
            className="clear-chat-button"
            onClick={handleClearChat}
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="ai-assistant-content">
        <div className="chat-container">
          <MessageList messages={conversation.messages} />
          
          <div className="chat-input-area">
            <MessageInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              maxLength={2000}
              placeholder="Ask me about your lawn care..."
            />
          </div>
          
          <QuickPrompt
            prompts={quickPrompts}
            onSelectPrompt={handleSelectPrompt}
          />
        </div>
        
        <section className="assistant-features">
          <h2>What I Can Help With</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <h3>Lawn Problem Diagnosis</h3>
              <p>Describe your lawn issues or upload photos for analysis</p>
            </div>
            
            <div className="feature-item">
              <span className="feature-icon">📋</span>
              <h3>Custom Care Plans</h3>
              <p>Get personalized schedules based on your lawn type and location</p>
            </div>
            
            <div className="feature-item">
              <span className="feature-icon">💧</span>
              <h3>Watering Advice</h3>
              <p>Optimal watering recommendations based on weather and conditions</p>
            </div>
            
            <div className="feature-item">
              <span className="feature-icon">🌿</span>
              <h3>Product Recommendations</h3>
              <p>Fertilizer, seed, and treatment suggestions for your specific needs</p>
            </div>
          </div>
        </section>
      </div>
      
      {/* Confirmation dialog for clearing chat */}
      <ClearChatDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={confirmClearChat}
      />
    </div>
  );
};

export default AIAssistantContainer;