import React, { useState } from 'react';
import './Header.css';

/**
 * Header Component
 * 
 * Provides the application header with:
 * - App logo and name on the left side
 * - Notifications icon and user dropdown on the right
 */
const Header: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Mock notifications
  const notifications = [
    { id: 1, text: 'Time to water your lawn', read: false, time: '2 hours ago' },
    { id: 2, text: 'Weekly lawn report is ready', read: true, time: '1 day ago' },
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Mock user data
  const user = {
    name: 'John Smith',
    email: 'john.smith@example.com',
    initials: 'JS',
  };
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };
  
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-icon">🌱</span>
            <span className="logo-text">LawnSync</span>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className="notifications-button" 
            onClick={toggleNotifications}
            aria-label="Notifications"
          >
            <span role="img" aria-hidden="true">🔔</span>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          
          <div className="user-menu-container">
            <button 
              className="user-menu-button" 
              onClick={toggleUserMenu}
              aria-label="User menu"
            >
              <div className="user-avatar">{user.initials}</div>
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-avatar large">{user.initials}</div>
                  <div className="user-details">
                    <h3 className="user-name">{user.name}</h3>
                    <p className="user-email">{user.email}</p>
                  </div>
                </div>
                
                <ul className="dropdown-menu">
                  <li>
                    <a href="/profile">
                      <span className="menu-icon">👤</span>
                      My Profile
                    </a>
                  </li>
                  <li>
                    <a href="/settings">
                      <span className="menu-icon">⚙️</span>
                      Settings
                    </a>
                  </li>
                  <li>
                    <button>
                      <span className="menu-icon">🎨</span>
                      Theme
                    </button>
                  </li>
                  <div className="divider"></div>
                  <li>
                    <button className="logout-button">
                      <span className="menu-icon">🚪</span>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
            
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <button className="mark-as-read">Mark all as read</button>
                </div>
                
                <ul className="notifications-list">
                  {notifications.map(notification => (
                    <li 
                      key={notification.id} 
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    >
                      <span className="notification-icon">🔔</span>
                      <div className="notification-content">
                        <p className="notification-text">{notification.text}</p>
                        <p className="notification-time">{notification.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="notifications-footer">
                  <a href="/notifications">View all notifications</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;