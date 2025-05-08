import React from 'react';
import PageLayout from '../../components/PageLayout';
import './ImproveContainer.css';

/**
 * ImproveContainer component
 * 
 * This section focuses on lawn enhancement projects and recommendations.
 * It includes lawn projects, improvement recommendations, landscaping ideas,
 * and product suggestions.
 */
const ImproveContainer: React.FC = () => {
  // Placeholder for sub-navigation
  const subNavigation = (
    <div className="improve-nav">
      <button className="nav-button active">Lawn Projects</button>
      <button className="nav-button">Recommendations</button>
      <button className="nav-button">Landscaping Ideas</button>
      <button className="nav-button">Products</button>
    </div>
  );

  // Placeholder for contextual actions
  const contextualActions = (
    <button className="fab-button" aria-label="Create new project">
      <span className="icon new"></span>
    </button>
  );

  return (
    <PageLayout 
      title="Improve" 
      subNavigation={subNavigation}
      contextualActions={contextualActions}
    >
      <div className="content-placeholder">
        <h2>Lawn Improvement Projects</h2>
        <p>Explore projects to enhance your lawn's appearance and health.</p>
        
        <div className="projects-list">
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h3>No Projects Yet</h3>
            <p>Start your first lawn improvement project to track progress and see results.</p>
            <button className="primary-button">
              <span className="icon-plus"></span>
              Create Your First Project
            </button>
          </div>
        </div>
        
        <div className="suggested-projects">
          <h3>Suggested Projects Based on Your Lawn</h3>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-image placeholder-image"></div>
              <div className="project-content">
                <h4>Aeration Project</h4>
                <p className="difficulty">Moderate Difficulty</p>
                <p className="description">Improve soil oxygenation and water penetration.</p>
                <button className="text-button">View Details</button>
              </div>
            </div>
            
            <div className="project-card">
              <div className="project-image placeholder-image"></div>
              <div className="project-content">
                <h4>Overseeding</h4>
                <p className="difficulty">Easy Difficulty</p>
                <p className="description">Fill in bare patches and improve lawn density.</p>
                <button className="text-button">View Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ImproveContainer;