import React from 'react';
import PageLayout from '../../components/PageLayout';
import './TrackContainer.css';

/**
 * TrackContainer component
 * 
 * This section focuses on tracking lawn progress over time.
 * It includes photo timeline, before/after comparisons, health metrics tracking,
 * and resource usage statistics.
 */
const TrackContainer: React.FC = () => {
  // Placeholder for sub-navigation
  const subNavigation = (
    <div className="track-nav">
      <button className="nav-button active">Photo Timeline</button>
      <button className="nav-button">Before/After</button>
      <button className="nav-button">Health Metrics</button>
      <button className="nav-button">Resource Usage</button>
    </div>
  );

  // Placeholder for contextual actions
  const contextualActions = (
    <button className="fab-button" aria-label="Take new progress photo">
      <span className="icon camera"></span>
    </button>
  );

  return (
    <PageLayout 
      title="Track Progress" 
      subNavigation={subNavigation}
      contextualActions={contextualActions}
    >
      <div className="content-placeholder">
        <h2>Photo Timeline</h2>
        <p>Document your lawn's journey with progress photos.</p>
        
        <div className="timeline-container">
          <div className="empty-timeline">
            <div className="empty-icon">📷</div>
            <h3>No Photos Yet</h3>
            <p>Take your first lawn photo to start tracking your progress.</p>
            <button className="primary-button">
              <span className="icon-camera"></span>
              Take First Photo
            </button>
          </div>
        </div>
        
        <div className="tips-container">
          <h3>Photo Tips</h3>
          <ul className="tips-list">
            <li>Take photos at the same time of day for consistent lighting</li>
            <li>Use the same angle and distance for better comparisons</li>
            <li>Include a reference object to track growth over time</li>
            <li>Capture photos at least once a month during growing season</li>
          </ul>
        </div>
        
        <div className="reminders-container">
          <h3>Progress Tracking</h3>
          <p>Regular photos help you see gradual improvements that might be hard to notice day-to-day.</p>
          <button className="secondary-button">
            <span className="icon-bell"></span>
            Set Photo Reminders
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default TrackContainer;