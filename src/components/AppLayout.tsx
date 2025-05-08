import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MainNavigationBar from './MainNavigationBar';
import './AppLayout.css';

/**
 * AppLayout Component
 * 
 * Provides a consistent layout with the MainNavigationBar for all protected routes
 * Uses Outlet from React Router to render the child routes
 */
const AppLayout: React.FC = () => {
  const location = useLocation();
  
  // Determine the active section based on the current path
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/fix-issues')) return 'fix-issues';
    if (path.includes('/maintain')) return 'maintain';
    if (path.includes('/improve')) return 'improve';
    if (path.includes('/track')) return 'track';
    if (path.includes('/resources')) return 'resources';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard'; // Default
  };

  return (
    <div className="app-layout">
      {/* Main content area */}
      <main className="app-content">
        <Outlet />
      </main>
      
      {/* Main Navigation Bar - fixed at the bottom for mobile, top for desktop */}
      <MainNavigationBar activeSection={getActiveSection()} />
    </div>
  );
};

export default AppLayout;