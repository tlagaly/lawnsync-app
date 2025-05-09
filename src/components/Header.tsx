import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotificationCenter from '../features/dashboard/components/NotificationCenter';
import './Header.css';

/**
 * Header Component
 *
 * Provides the application header with:
 * - App logo and name on the left side
 * - Navigation links as a button group in the center (desktop only)
 * - Notifications icon (slide-in drawer) and user dropdown on the right
 */
const Header: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  
  // Navigation items - same as in MainNavigationBar
  const navItems = [
    { path: '/home', label: 'Home', icon: 'home' },
    { path: '/tasks-projects', label: 'Tasks & Projects', icon: 'tasks' },
    { path: '/assistant', label: 'AI Assistant', icon: 'assistant' },
    { path: '/my-lawn', label: 'My Lawn', icon: 'lawn' },
    { path: '/plant-id', label: 'Plant ID', icon: 'plant-id' }
  ];
  
  // Determine if a nav item is active
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Mock notifications data for badge
  const unreadCount = 1; // This would come from a notification service in a real app
  
  // Mock user data
  const user = {
    name: 'John Smith',
    email: 'john.smith@example.com',
    initials: 'JS',
  };
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotificationDrawer) setShowNotificationDrawer(false);
  };
  
  const toggleNotificationDrawer = () => {
    setShowNotificationDrawer(!showNotificationDrawer);
    if (showUserMenu) setShowUserMenu(false);
  };
  
  const closeNotificationDrawer = () => {
    setShowNotificationDrawer(false);
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
        
        {isDesktop && (
          <div className="header-center">
            <nav className="header-nav">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-button ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className={`nav-icon ${item.icon}`}></span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
        
        <div className="header-right">
          <button
            className="notifications-button"
            onClick={toggleNotificationDrawer}
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
          </div>
        </div>
      </div>
      
      {/* Notification Slide-in Drawer */}
      {showNotificationDrawer && (
        <NotificationCenter onClose={closeNotificationDrawer} />
      )}
    </header>
  );
};

export default Header;