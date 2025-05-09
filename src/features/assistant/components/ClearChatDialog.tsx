import React from 'react';
import './ClearChatDialog.css';

interface ClearChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * ClearChatDialog Component
 * 
 * Confirmation dialog that appears when clearing the chat history
 */
const ClearChatDialog: React.FC<ClearChatDialogProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;
  
  const handleDialogClick = (e: React.MouseEvent) => {
    // Prevent clicks within the dialog from closing it
    e.stopPropagation();
  };
  
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog-container" onClick={handleDialogClick}>
        <div className="dialog-header">
          <h2>Clear Conversation</h2>
          <button className="close-button" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="dialog-content">
          <p>Are you sure you want to clear this conversation? This action cannot be undone.</p>
        </div>
        <div className="dialog-actions">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="confirm-button" onClick={handleConfirm}>Clear Conversation</button>
        </div>
      </div>
    </div>
  );
};

export default ClearChatDialog;