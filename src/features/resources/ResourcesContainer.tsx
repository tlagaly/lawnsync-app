import React from 'react';
import PageLayout from '../../components/PageLayout';
import './ResourcesContainer.css';

/**
 * ResourcesContainer component
 * 
 * This section provides helpful information and tools for lawn care.
 * It includes plant identification reference, local weather information,
 * lawn care guides, and community tips.
 */
const ResourcesContainer: React.FC = () => {
  // Placeholder for sub-navigation
  const subNavigation = (
    <div className="resources-nav">
      <button className="nav-button active">Plant Identification</button>
      <button className="nav-button">Local Weather</button>
      <button className="nav-button">Lawn Care Guides</button>
      <button className="nav-button">Community Tips</button>
    </div>
  );

  return (
    <PageLayout 
      title="Resources" 
      subNavigation={subNavigation}
    >
      <div className="content-placeholder">
        <h2>Plant Identification</h2>
        <p>Identify plants, weeds, and grass species in your lawn.</p>
        
        <div className="search-container">
          <div className="search-box">
            <span className="icon-search"></span>
            <input type="text" placeholder="Search for plants or upload a photo" />
            <button className="camera-button">
              <span className="icon-camera"></span>
            </button>
          </div>
        </div>
        
        <div className="categories-container">
          <h3>Browse by Category</h3>
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-icon">🌱</div>
              <h4>Grass Types</h4>
              <p>Common lawn grass species</p>
            </div>
            
            <div className="category-card">
              <div className="category-icon">🌿</div>
              <h4>Weeds</h4>
              <p>Identify and control common weeds</p>
            </div>
            
            <div className="category-card">
              <div className="category-icon">🌼</div>
              <h4>Ornamentals</h4>
              <p>Decorative plants for your lawn</p>
            </div>
            
            <div className="category-card">
              <div className="category-icon">🍄</div>
              <h4>Fungi</h4>
              <p>Common lawn fungi and treatments</p>
            </div>
          </div>
        </div>
        
        <div className="recent-searches">
          <h3>Recent Searches</h3>
          <p>Your recent plant identification searches will appear here.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResourcesContainer;