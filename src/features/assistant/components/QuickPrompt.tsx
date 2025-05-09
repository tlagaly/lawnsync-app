import React from 'react';
import type { QuickPrompt as QuickPromptType } from '../../../types/chat';
import './QuickPrompt.css';

interface QuickPromptProps {
  prompts: QuickPromptType[];
  onSelectPrompt: (prompt: string) => void;
  category?: string;
}

/**
 * QuickPrompt Component
 * 
 * Displays clickable suggestion chips for common lawn care questions
 */
const QuickPrompt: React.FC<QuickPromptProps> = ({
  prompts,
  onSelectPrompt,
  category
}) => {
  // Filter prompts by category if specified
  const filteredPrompts = category 
    ? prompts.filter(prompt => prompt.category === category)
    : prompts;
  
  return (
    <div className="quick-prompt-container">
      <h3 className="quick-prompt-heading">Common Questions</h3>
      <div className="quick-prompt-grid">
        {filteredPrompts.map((prompt) => (
          <button
            key={prompt.id}
            className="quick-prompt-chip"
            onClick={() => onSelectPrompt(prompt.text)}
          >
            {prompt.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickPrompt;