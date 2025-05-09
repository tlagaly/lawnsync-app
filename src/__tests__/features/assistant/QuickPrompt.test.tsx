import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import QuickPrompt from '../../../features/assistant/components/QuickPrompt';
import type { QuickPrompt as QuickPromptType } from '../../../types/chat';

describe('QuickPrompt Component', () => {
  const mockPrompts: QuickPromptType[] = [
    {
      id: 'prompt-1',
      text: 'How to water my lawn properly?',
      category: 'general'
    },
    {
      id: 'prompt-2',
      text: 'When should I fertilize my lawn?',
      category: 'seasonal'
    },
    {
      id: 'prompt-3',
      text: 'How to fix brown patches in my lawn?',
      category: 'problems'
    },
    {
      id: 'prompt-4',
      text: 'What is the best mowing height?',
      category: 'maintenance'
    }
  ];

  test('renders all prompts when no category is specified', () => {
    const handleSelectPrompt = vi.fn();
    render(<QuickPrompt prompts={mockPrompts} onSelectPrompt={handleSelectPrompt} />);
    
    // Should render the heading
    expect(screen.getByText('Common Questions')).toBeInTheDocument();
    
    // Should render all prompts
    mockPrompts.forEach((prompt) => {
      expect(screen.getByText(prompt.text)).toBeInTheDocument();
    });
  });

  test('filters prompts by category when specified', () => {
    const handleSelectPrompt = vi.fn();
    render(
      <QuickPrompt 
        prompts={mockPrompts} 
        onSelectPrompt={handleSelectPrompt} 
        category="seasonal" 
      />
    );
    
    // Should only show the seasonal prompt
    expect(screen.getByText('When should I fertilize my lawn?')).toBeInTheDocument();
    
    // Should not show other category prompts
    expect(screen.queryByText('How to water my lawn properly?')).not.toBeInTheDocument();
    expect(screen.queryByText('How to fix brown patches in my lawn?')).not.toBeInTheDocument();
    expect(screen.queryByText('What is the best mowing height?')).not.toBeInTheDocument();
  });

  test('calls onSelectPrompt when a prompt is clicked', () => {
    const handleSelectPrompt = vi.fn();
    render(<QuickPrompt prompts={mockPrompts} onSelectPrompt={handleSelectPrompt} />);
    
    // Click on the first prompt
    fireEvent.click(screen.getByText('How to water my lawn properly?'));
    
    // Check if onSelectPrompt was called with the correct text
    expect(handleSelectPrompt).toHaveBeenCalledWith('How to water my lawn properly?');
    
    // Click on another prompt
    fireEvent.click(screen.getByText('How to fix brown patches in my lawn?'));
    
    // Check if onSelectPrompt was called with the correct text
    expect(handleSelectPrompt).toHaveBeenCalledWith('How to fix brown patches in my lawn?');
  });

  test('handles empty prompts array', () => {
    const handleSelectPrompt = vi.fn();
    render(<QuickPrompt prompts={[]} onSelectPrompt={handleSelectPrompt} />);
    
    // Should render the heading
    expect(screen.getByText('Common Questions')).toBeInTheDocument();
    
    // Should not render any prompt buttons
    const promptContainer = document.querySelector('.quick-prompt-grid');
    expect(promptContainer).toBeEmptyDOMElement();
  });
});