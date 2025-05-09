import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import TaskScheduler from './components/TaskScheduler';
import WateringConfigView from './components/WateringConfigView';
import SeasonalTasks from './components/SeasonalTasks';
import RoutineCare from './components/RoutineCare';
import './MaintainContainer.css';

/**
 * MaintainContainer component
 *
 * This section focuses on routine lawn care and maintenance tasks.
 * It includes task scheduling, watering configuration, seasonal tasks,
 * and a routine care dashboard with status indicators.
 */
const MaintainContainer: React.FC = () => {
  // State to track which section is active
  const [activeSection, setActiveSection] = useState<'schedule' | 'watering' | 'seasonal' | 'dashboard'>('dashboard');

  // Handle navigation click
  const handleNavClick = (section: 'schedule' | 'watering' | 'seasonal' | 'dashboard') => {
    setActiveSection(section);
  };

  // Sub-navigation with active state based on activeSection
  const subNavigation = (
    <div className="maintain-nav">
      <button
        className={`nav-button ${activeSection === 'dashboard' ? 'active' : ''}`}
        onClick={() => handleNavClick('dashboard')}
      >
        Dashboard
      </button>
      <button
        className={`nav-button ${activeSection === 'schedule' ? 'active' : ''}`}
        onClick={() => handleNavClick('schedule')}
      >
        Task Schedule
      </button>
      <button
        className={`nav-button ${activeSection === 'watering' ? 'active' : ''}`}
        onClick={() => handleNavClick('watering')}
      >
        Watering Plan
      </button>
      <button
        className={`nav-button ${activeSection === 'seasonal' ? 'active' : ''}`}
        onClick={() => handleNavClick('seasonal')}
      >
        Seasonal Tasks
      </button>
    </div>
  );

  // Contextual action button for adding tasks
  const contextualActions = (
    <button
      className="fab-button"
      aria-label="Add new task"
      onClick={() => handleNavClick('schedule')}
    >
      <span className="icon add">+</span>
    </button>
  );

  // Render the active component based on selected section
  const renderActiveComponent = () => {
    switch (activeSection) {
      case 'schedule':
        return <TaskScheduler />;
      case 'watering':
        return <WateringConfigView />;
      case 'seasonal':
        return <SeasonalTasks />;
      case 'dashboard':
      default:
        return <RoutineCare />;
    }
  };

  return (
    <PageLayout
      title="Maintain"
      subNavigation={subNavigation}
      contextualActions={contextualActions}
    >
      <div className="maintain-container">
        {renderActiveComponent()}
      </div>
    </PageLayout>
  );
};

export default MaintainContainer;