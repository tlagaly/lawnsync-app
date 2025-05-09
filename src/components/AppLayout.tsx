import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MainNavigationBar from './MainNavigationBar';
import Header from './Header';
import './AppLayout.css';

/**
 * AppLayout Component
 *
 * Provides a consistent layout with:
 * - Header with navigation links (desktop only)
 * - Bottom navigation bar (tablet and mobile only)
 * Uses Outlet from React Router to render the child routes
 */
const AppLayout: React.FC = () => {
  const location = useLocation();
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024);
  
  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Determine the active section based on the current path
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('/home')) return 'home';
    if (path.includes('/tasks-projects')) return 'tasks-projects';
    if (path.includes('/assistant')) return 'assistant';
    if (path.includes('/my-lawn')) return 'my-lawn';
    if (path.includes('/plant-identifier')) return 'plant-identifier';
    return 'home'; // Default
  };

  return (
    <div className="app-layout">
      {/* Navigation wrapper to combine header and nav */}
      <div className="nav-wrapper">
        {/* Header with app logo, desktop navigation, and user menu */}
        <Header />
        
        {/* Main Navigation Bar - only shown on tablet and mobile */}
        {isSmallScreen && <MainNavigationBar activeSection={getActiveSection()} />}
      </div>
      
      {/* Main content area */}
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;