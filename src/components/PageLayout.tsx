import React from 'react';
import MainNavigationBar from './MainNavigationBar';
import './PageLayout.css';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  subNavigation?: React.ReactNode;
  contextualActions?: React.ReactNode;
}

/**
 * PageLayout component
 * Provides a consistent layout structure for all pages in the application
 * Includes header, sub-navigation, main content, and contextual action areas
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  children,
  subNavigation,
  contextualActions
}) => {
  return (
    <div className="page-layout">
      <MainNavigationBar />
      
      <div className="page-content">
        <header className="page-header">
          <h1>{title}</h1>
        </header>
        
        {subNavigation && (
          <div className="sub-navigation">
            {subNavigation}
          </div>
        )}
        
        <main className="main-content">
          {children}
        </main>
        
        {contextualActions && (
          <div className="contextual-actions">
            {contextualActions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageLayout;