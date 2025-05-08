import React from 'react';
import type { Notification } from '../../../types/notification';

interface NotificationAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onComplete?: (id: string) => void;
  onSnooze?: (id: string) => void;
  onReschedule?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onDelete,
  onComplete,
  onSnooze,
  onReschedule
}) => {
  const getIconForType = (type: string): string => {
    switch (type) {
      case 'scheduled_task':
        return '📋';
      case 'weather_alert':
        return '⛈️';
      case 'watering_event':
        return '💧';
      case 'watering_reminder':
        return '⏰';
      case 'watering_completed':
        return '✅';
      case 'watering_cancelled':
        return '❌';
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

  // Build notification action buttons based on notification type
  const getNotificationActions = (): NotificationAction[] => {
    const actions: NotificationAction[] = [];

    // Skip actions for read notifications
    if (notification.isRead) {
      return actions;
    }

    // Watering-related notification actions
    if (notification.type === 'watering_reminder' || notification.type === 'watering_event') {
      if (onComplete) {
        actions.push({
          label: 'Complete',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ),
          onClick: () => onComplete(notification.id),
          color: '#38A169' // Green
        });
      }
      
      if (onSnooze) {
        actions.push({
          label: 'Snooze',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          ),
          onClick: () => onSnooze(notification.id),
          color: '#4299E1' // Blue
        });
      }
      
      if (onReschedule) {
        actions.push({
          label: 'Reschedule',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          ),
          onClick: () => onReschedule(notification.id),
          color: '#805AD5' // Purple
        });
      }
    }

    return actions;
  };

  // Extract watering schedule data for display if present
  const getWateringDetails = () => {
    if (!notification.metadata) return null;
    
    const meta = notification.metadata;
    let details = null;
    
    if (notification.type === 'watering_reminder' || notification.type === 'watering_event') {
      const date = meta.scheduledDate ? new Date(meta.scheduledDate).toLocaleDateString() : '';
      const time = meta.startTime || '';
      const zones = meta.zones?.join(', ') || '';
      
      details = (
        <div style={{
          fontSize: '12px',
          color: '#4A5568',
          backgroundColor: '#EBF8FF',
          padding: '4px 8px',
          borderRadius: '4px',
          marginTop: '4px',
          marginBottom: '8px'
        }}>
          {date && time && <div>When: {date} at {time}</div>}
          {zones && <div>Zones: {zones}</div>}
          {meta.waterAmount && <div>Water: {meta.waterAmount} gallons</div>}
          {meta.rainfall && <div>Rainfall: {meta.rainfall} inches</div>}
        </div>
      );
    }
    
    return details;
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
          marginBottom: notification.metadata ? '2px' : '8px'
        }}>
          {notification.message}
        </div>
        
        {/* Render watering details if present */}
        {getWateringDetails()}
        
        {/* Action buttons */}
        {getNotificationActions().length > 0 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {getNotificationActions().map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                title={action.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${action.color || '#CBD5E0'}`,
                  color: action.color || '#4A5568',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  gap: '4px'
                }}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
        
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