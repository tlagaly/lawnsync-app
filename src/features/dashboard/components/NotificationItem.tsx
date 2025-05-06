import React from 'react';
import type { Notification } from '../../../types/notification';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onRead, 
  onDelete 
}) => {
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

  const getPriorityStyles = (priority: string): React.CSSProperties => {
    switch (priority) {
      case 'high':
        return {
          borderLeft: '4px solid #E53E3E'  // Red border for high priority
        };
      case 'urgent':
        return {
          borderLeft: '4px solid #B7791F',  // Orange border for urgent
          backgroundColor: 'rgba(183, 121, 31, 0.05)'  // Light orange background
        };
      case 'medium':
        return {
          borderLeft: '4px solid #3182CE'  // Blue border for medium priority
        };
      default:
        return {
          borderLeft: '4px solid #718096'  // Gray border for low priority
        };
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return date.toLocaleDateString();
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // Navigate to the action URL
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #E2E8F0',
        cursor: 'pointer',
        display: 'flex',
        opacity: notification.isRead ? 0.7 : 1,
        backgroundColor: notification.isRead ? '#F7FAFC' : 'white',
        ...getPriorityStyles(notification.priority)
      }}
      onClick={handleClick}
    >
      <div style={{ marginRight: '12px', fontSize: '20px' }}>
        {getIconForType(notification.type)}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontWeight: notification.isRead ? 'normal' : 'bold',
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
        
        <div style={{ 
          fontSize: '12px',
          color: '#718096',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{formatDate(notification.createdAt)}</span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#718096',
              padding: '4px'
            }}
            aria-label="Delete notification"
          >
            {/* Trash icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;