import React, { useEffect, useState } from 'react';
import type { Notification, NotificationFilterOptions, NotificationType } from '../../../types/notification';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications
} from '../../../lib/notificationService';
import NotificationItem from './NotificationItem';

interface NotificationCenterProps {
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [activeFilter, readFilter]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    
    const filterOptions: NotificationFilterOptions = {};
    
    // Apply type filter
    if (activeFilter !== 'all') {
      filterOptions.types = [activeFilter as NotificationType];
    }
    
    // Apply read status filter
    if (readFilter !== 'all') {
      filterOptions.readStatus = readFilter;
    }
    
    try {
      const data = await getNotifications(filterOptions);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => {
        if (n.id === id) {
          return { ...n, isRead: true };
        }
        return n;
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'scheduled_task', label: 'Tasks' },
    { value: 'weather_alert', label: 'Weather' },
    { value: 'watering_event', label: 'Watering' },
    { value: 'seasonal_tip', label: 'Tips' },
    { value: 'progress_update', label: 'Progress' },
    { value: 'system_alert', label: 'System' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      maxWidth: '400px',
      backgroundColor: 'white',
      boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideIn 0.3s ease-out',
    }}>
      {/* Header */}
      <header style={{
        padding: '16px',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
          Notifications
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}
          aria-label="Close notification center"
        >
          {/* Close icon (X) */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </header>
      
      {/* Filters */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid #E2E8F0'
      }}>
        {/* Type filters */}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '8px',
          paddingBottom: '8px'
        }}>
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: activeFilter === option.value ? '#3182CE' : '#EDF2F7',
                color: activeFilter === option.value ? 'white' : '#4A5568',
                cursor: 'pointer',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        {/* Read status and actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px'
        }}>
          {/* Read status filter */}
          <div>
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as 'all' | 'read' | 'unread')}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #E2E8F0',
                backgroundColor: 'white',
                fontSize: '12px'
              }}
            >
              <option value="all">All notifications</option>
              <option value="unread">Unread only</option>
              <option value="read">Read only</option>
            </select>
          </div>
          
          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleMarkAllAsRead}
              style={{
                padding: '6px 12px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#4A5568',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Mark all read
            </button>
            <button
              onClick={handleClearAll}
              style={{
                padding: '6px 12px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#E53E3E',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear all
            </button>
          </div>
        </div>
      </div>
      
      {/* Notification list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0',
        backgroundColor: '#F7FAFC'
      }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#718096'
          }}>
            Loading notifications...
          </div>
        ) : notifications.length > 0 ? (
          // Notifications list
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))
        ) : (
          // Empty state
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '32px',
            textAlign: 'center',
            color: '#718096'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              🔔
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>
              No notifications yet
            </h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              When you receive notifications, they'll appear here.
            </p>
          </div>
        )}
      </div>
      
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          
          @media (max-width: 600px) {
            .notification-center {
              width: 100%;
              max-width: none;
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotificationCenter;