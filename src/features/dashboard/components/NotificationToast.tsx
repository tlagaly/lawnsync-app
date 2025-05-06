import React, { useEffect, useState } from 'react';
import type { Notification } from '../../../types/notification';

interface NotificationToastProps {
  notification: Notification;
  duration?: number; // in milliseconds
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  duration = 5000, // default 5 seconds
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  useEffect(() => {
    // Start dismissal timer
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation before removing
    }, duration);

    // Animate progress bar
    const interval = window.setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress - (100 / (duration / 100));
        return newProgress < 0 ? 0 : newProgress;
      });
    }, 100);
    
    setIntervalId(interval);

    return () => {
      clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for fade-out animation before removing
  };

  const getPriorityStyles = (): React.CSSProperties => {
    switch (notification.priority) {
      case 'urgent':
        return {
          backgroundColor: '#FEF5E7', // Light orange
          borderLeftColor: '#E67E22' // Orange
        };
      case 'high':
        return {
          backgroundColor: '#FEF2F2', // Light red
          borderLeftColor: '#E53E3E' // Red
        };
      case 'medium':
        return {
          backgroundColor: '#EBF8FF', // Light blue
          borderLeftColor: '#3182CE' // Blue
        };
      default:
        return {
          backgroundColor: '#F7FAFC', // Light gray
          borderLeftColor: '#718096' // Gray
        };
    }
  };

  const getIconForType = (type: string): string => {
    switch (type) {
      case 'scheduled_task':
        return '📋';
      case 'weather_alert':
        return '⛈️';
      case 'watering_event':
        return '💧';
      case 'seasonal_tip':
        return '🌱';
      case 'progress_update':
        return '📈';
      case 'system_alert':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  // Early return if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '320px',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        borderRadius: '8px',
        overflow: 'hidden',
        borderLeft: '4px solid #4A5568',
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${isVisible ? '0' : '20px'})`,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        zIndex: 9999,
        ...getPriorityStyles()
      }}
      onClick={() => {
        // Navigate to action URL if provided
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
          handleClose();
        }
      }}
    >
      {/* Header with close button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#4A5568'
        }}>
          <span style={{ marginRight: '8px' }}>
            {getIconForType(notification.type)}
          </span>
          New Notification
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the parent onClick
            handleClose();
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Close notification"
        >
          {/* X icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ 
          fontWeight: 'bold',
          marginBottom: '4px',
          fontSize: '14px' 
        }}>
          {notification.title}
        </div>
        <div style={{ 
          fontSize: '13px', 
          color: '#4A5568',
          marginBottom: '8px' 
        }}>
          {notification.message}
        </div>
      </div>
      
      {/* Progress bar */}
      <div style={{
        height: '3px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        width: '100%'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: getPriorityStyles().borderLeftColor,
          transition: 'width 0.1s linear'
        }} />
      </div>
    </div>
  );
};

export default NotificationToast;