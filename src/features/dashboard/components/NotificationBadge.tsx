import React, { useEffect, useState } from 'react';
import { getUnreadNotificationCount } from '../../../lib/notificationService';

interface NotificationBadgeProps {
  onClick: () => void;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  useEffect(() => {
    // Fetch unread notification count on component mount
    const fetchUnreadCount = async () => {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    };
    
    fetchUnreadCount();
    
    // Set up polling to periodically check for new notifications
    const intervalId = setInterval(fetchUnreadCount, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block'
      }}
    >
      <button
        aria-label="Notifications"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onClick}
      >
        {/* Simple bell icon using SVG */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      </button>
      {unreadCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '-1px',
            right: '-1px',
            borderRadius: '50%',
            backgroundColor: '#E53E3E', // red color
            color: 'white',
            fontSize: '12px',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;