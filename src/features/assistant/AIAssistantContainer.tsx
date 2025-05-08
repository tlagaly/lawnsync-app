import React from 'react';
import './AIAssistantContainer.css';

/**
 * AIAssistantContainer Component
 * 
 * Chat-based interface for AI lawn care assistance
 * Provides personalized recommendations and advice
 */
const AIAssistantContainer: React.FC = () => {
  return (
    <div className="ai-assistant-container">
      <div className="ai-assistant-header">
        <h1>AI Lawn Assistant</h1>
        <p className="subtitle">Your personal lawn care expert</p>
      </div>
      
      <div className="ai-assistant-content">
        <section className="chat-section">
          <div className="chat-history">
            <div className="message assistant">
              <div className="message-content">
                <p>👋 Hello! I'm your LawnSync AI Assistant. How can I help with your lawn care today?</p>
              </div>
            </div>
            
            <div className="message placeholder">
              <div className="message-content placeholder-content">
                <p>Chat functionality will be implemented in future tasks.</p>
                <p className="placeholder-note">This will integrate with the existing OpenAI GPT services.</p>
              </div>
            </div>
          </div>
          
          <div className="chat-input-area">
            <div className="input-container">
              <input 
                type="text" 
                placeholder="Ask me about your lawn care..." 
                disabled 
                className="chat-input" 
              />
              <button className="send-button" disabled>Send</button>
            </div>
            <p className="input-tip">Try asking about watering schedules, identifying weeds, or seasonal lawn care tips</p>
          </div>
        </section>
        
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
    </div>
  );
};

export default AIAssistantContainer;