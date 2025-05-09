import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MainNavigationBar from './MainNavigationBar';
import Header from './Header';
import './AppLayout.css';

/**
 * AppLayout Component
 *
 * Provides a consistent layout with Header and MainNavigationBar for all protected routes
 * Uses Outlet from React Router to render the child routes
 */
const AppLayout: React.FC = () => {
  const location = useLocation();
  
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
      {/* Navigation wrapper to combine header and nav on desktop */}
      <div className="nav-wrapper">
        {/* Header with app logo and user menu */}
        <Header />
        
        {/* Main Navigation Bar - fixed at the bottom for mobile, top for desktop */}
        <MainNavigationBar activeSection={getActiveSection()} />
      </div>
      
      {/* Main content area */}
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;