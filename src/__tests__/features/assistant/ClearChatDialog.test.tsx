import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ClearChatDialog from '../../../features/assistant/components/ClearChatDialog';

describe('ClearChatDialog Component', () => {
  test('renders nothing when isOpen is false', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();
    
    const { container } = render(
      <ClearChatDialog 
        isOpen={false} 
        onClose={handleClose} 
        onConfirm={handleConfirm} 
      />
    );
    
    // Dialog should not be rendered
    expect(container).toBeEmptyDOMElement();
  });

  test('renders dialog when isOpen is true', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();
    
    render(
      <ClearChatDialog 
        isOpen={true} 
        onClose={handleClose} 
        onConfirm={handleConfirm} 
      />
    );
    
    // Dialog should be rendered with title and content
    expect(screen.getByText('Clear Conversation')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to clear this conversation? This action cannot be undone.')).toBeInTheDocument();
    
    // Buttons should be present
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Clear Conversation', { selector: 'button' })).toBeInTheDocument();
  });

  test('calls onClose when clicking outside the dialog', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();
    
    render(
      <ClearChatDialog 
        isOpen={true} 
        onClose={handleClose} 
        onConfirm={handleConfirm} 
      />
    );
    
    // Click on the backdrop (outside the dialog)
    const backdrop = document.querySelector('.dialog-backdrop');
    fireEvent.click(backdrop!);
    
    // onClose should be called
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  test('calls onClose when clicking the close button', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();
    
    render(
      <ClearChatDialog 
        isOpen={true} 
        onClose={handleClose} 
        onConfirm={handleConfirm} 
      />
    );
    
    // Click the close button (X)
    const closeButton = document.querySelector('.close-button');
    fireEvent.click(closeButton!);
    
    // onClose should be called
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  test('calls onClose when clicking the cancel button', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();
    
    render(
      <ClearChatDialog 
        isOpen={true} 
        onClose={handleClose} 
        onConfirm={handleConfirm} 
      />
    );
    
    // Click the cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // onClose should be called
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  test('calls onConfirm and onClose when clicking the confirm button', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();
    
    render(
      <ClearChatDialog 
        isOpen={true} 
        onClose={handleClose} 
        onConfirm={handleConfirm} 
      />
    );
    
    // Click the confirm button
    fireEvent.click(screen.getByText('Clear Conversation', { selector: 'button' }));
    
    // Both callbacks should be called
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('prevents propagation when clicking inside the dialog', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();
    
    render(
      <ClearChatDialog 
        isOpen={true} 
        onClose={handleClose} 
        onConfirm={handleConfirm} 
      />
    );
    
    // Click inside the dialog content
    const dialogContainer = document.querySelector('.dialog-container');
    fireEvent.click(dialogContainer!);
    
    // onClose should not be called
    expect(handleClose).not.toHaveBeenCalled();
    expect(handleConfirm).not.toHaveBeenCalled();
  });
});