import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Temporarily using direct HTML/CSS instead of Chakra UI due to compatibility issues
// import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import colors from '../../../theme/foundations/colors';
import NotificationBadge from './NotificationBadge';
import NotificationCenter from './NotificationCenter';
import NotificationToast from './NotificationToast';
import { getNotifications, initializeNotificationSystem } from '../../../lib/notificationService';
import type { Notification } from '../../../types/notification';

interface DashboardHeaderProps {
  location: string;
  lawnType: string;
}

/**
 * Header component that displays at the top of the dashboard
 * Shows user's location and lawn type
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({ location, lawnType }) => {
  const navigate = useNavigate();
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState<Notification | null>(null);
  
  useEffect(() => {
    // Initialize notification system
    initializeNotificationSystem();
    
    // Fetch initial notifications
    const fetchNotifications = async () => {
      const data = await getNotifications();
      setNotifications(data);
    };
    
    fetchNotifications();
    
    // Setup polling to check for new notifications
    const intervalId = setInterval(async () => {
      const data = await getNotifications();
      
      // If there are more notifications than before, show toast for the newest one
      if (data.length > notifications.length) {
        // Find the newest notification (highest createdAt timestamp)
        const newestNotification = [...data].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        
        // Show toast for newest notification
        setNewNotification(newestNotification);
        
        // Hide toast after 6 seconds
        setTimeout(() => {
          setNewNotification(null);
        }, 6000);
      }
      
      setNotifications(data);
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [notifications.length]);
  
  const handleSettingsClick = () => {
    navigate('/settings');
  };
  
  const toggleNotificationCenter = () => {
    setShowNotificationCenter(!showNotificationCenter);
  };
  
  const closeNotificationCenter = () => {
    setShowNotificationCenter(false);
  };
  
  const dismissToast = () => {
    setNewNotification(null);
  };
  
  return (
    <header
      style={{
        backgroundColor: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        padding: "16px",
        position: "relative" // For notification center positioning
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          {/* Logo and App Name */}
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: colors.green[500],
              fontFamily: "Poppins, sans-serif",
              margin: 0
            }}
          >
            LawnSync
          </h1>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Notification Badge */}
            <NotificationBadge onClick={toggleNotificationCenter} />
            
            {/* Settings Link */}
            <button
              onClick={handleSettingsClick}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                marginLeft: '8px'
              }}
              aria-label="Account Settings"
            >
              <svg
                viewBox="0 0 24 24"
                width="20px"
                height="20px"
                style={{ color: colors.gray[500] }}
              >
                <path
                  fill="currentColor"
                  d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
                />
              </svg>
            </button>
          </div>
          
          {/* Location & Lawn Type Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            {/* Location Icon and Text */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  color: colors.gray[500],
                  marginRight: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16px"
                  height="16px"
                  style={{ color: 'currentColor' }}
                >
                  <path
                    fill="currentColor"
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: "14px",
                  color: colors.gray[700],
                  fontWeight: "500"
                }}
              >
                {location}
              </span>
            </div>
            
            <span style={{ color: colors.gray[400], margin: "0 4px" }}>•</span>
            
            {/* Lawn Type */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  color: colors.green[500],
                  marginRight: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16px"
                  height="16px"
                  style={{ color: 'currentColor' }}
                >
                  <path
                    fill="currentColor"
                    d="M12 22a9 9 0 0 0 9-9A9 9 0 0 0 3 13a9 9 0 0 0 9 9zm0-18c-4.97 0-9 4.03-9 9a7.94 7.94 0 0 1 2.25-5.51C5.24 6.34 6.13 6 7 6h10c.87 0 1.76.34 2.75 1.49A7.94 7.94 0 0 1 22 13c0-4.97-4.03-9-9-9z"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: "14px",
                  color: colors.gray[700],
                  fontWeight: "500"
                }}
              >
                {lawnType}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* NotificationCenter (shown as a side drawer) */}
      {showNotificationCenter && (
        <NotificationCenter onClose={closeNotificationCenter} />
      )}
      
      {/* Notification Toast for real-time alerts */}
      {newNotification && (
        <NotificationToast
          notification={newNotification}
          onClose={dismissToast}
        />
      )}
    </header>
  );
};

export default DashboardHeader;