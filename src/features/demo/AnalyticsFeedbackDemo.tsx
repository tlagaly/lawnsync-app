import React, { useState, useEffect } from 'react';
import { trackEvent } from '../../lib/analyticsService';
import type { RecommendationType } from '../../types/recommendation';
import { submitFeedback } from '../../lib/feedbackService';

// Custom styles for the demo
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem'
  },
  text: {
    marginBottom: '1.5rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  box: {
    padding: '1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    backgroundColor: 'white'
  },
  boxHeading: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '1rem'
  },
  flexCol: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '0.75rem'
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#3182ce'
  },
  blueButton: {
    backgroundColor: '#3182ce'
  },
  greenButton: {
    backgroundColor: '#38a169'
  },
  purpleButton: {
    backgroundColor: '#805ad5'
  },
  tealButton: {
    backgroundColor: '#319795'
  },
  orangeButton: {
    backgroundColor: '#dd6b20'
  },
  redButton: {
    backgroundColor: '#e53e3e'
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '1.5rem 0'
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  }
};

const mockUserId = "demo-user-123";
const mockRecommendation = {
  id: "rec-1",
  userId: mockUserId,
  title: "Apply Fertilizer",
  description: "Your lawn needs nitrogen-rich fertilizer for better growth.",
  category: "maintenance" as RecommendationType,
  source: "ai" as "ai" | "expert" | "system",
  createdAt: new Date().toISOString(),
  priority: "high" as "high" | "medium" | "low",
  contextTriggers: {
    season: true,
    lawnCondition: true
  }
};

const AnalyticsFeedbackDemo: React.FC = () => {
  const [eventCount, setEventCount] = useState(0);
  
  useEffect(() => {
    // Track page view
    trackEvent('feature_used', {
      featureId: 'demo_screen',
      featureName: 'Analytics & Feedback Demo'
    });
  }, []);
  
  const handleTrackEvent = (eventType: string) => {
    trackEvent(eventType as any, {
      demoEvent: true,
      timestamp: new Date().toISOString()
    });
    setEventCount(prev => prev + 1);
  };
  
  const handleSubmitQuickFeedback = async () => {
    await submitFeedback(
      mockUserId,
      'general',
      4,
      'This is a quick feedback from the demo page!',
      { source: 'demo' }
    );
    alert('Quick feedback submitted successfully!');
  };
  
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>User Analytics & Feedback System Demo</h1>
      <p style={styles.text}>This page demonstrates the functionality of the analytics and feedback systems we've built.</p>
      
      <div style={styles.grid}>
        <div style={styles.box}>
          <h2 style={styles.boxHeading}>Analytics Testing</h2>
          <p style={styles.text}>Click buttons to trigger analytics events:</p>
          
          <div style={styles.flexCol}>
            <button
              style={{...styles.button, ...styles.blueButton}}
              onClick={() => handleTrackEvent('recommendation_viewed')}
            >
              Track "Recommendation Viewed" Event
            </button>
            
            <button
              style={{...styles.button, ...styles.greenButton}}
              onClick={() => handleTrackEvent('task_completed')}
            >
              Track "Task Completed" Event
            </button>
            
            <button
              style={{...styles.button, ...styles.purpleButton}}
              onClick={() => handleTrackEvent('photo_uploaded')}
            >
              Track "Photo Uploaded" Event
            </button>
          </div>
          
          <p style={{marginTop: '1rem'}}>Events tracked in this session: {eventCount}</p>
        </div>
        
        <div style={styles.box}>
          <h2 style={styles.boxHeading}>Feedback Testing</h2>
          <p style={styles.text}>Test feedback submission:</p>
          
          <div style={styles.flexCol}>
            <button
              style={{...styles.button, ...styles.tealButton}}
              onClick={handleSubmitQuickFeedback}
            >
              Submit Quick Feedback
            </button>
          </div>
          
          <div style={{marginTop: '1.5rem'}}>
            <h3 style={{fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
              Recommendation Feedback Demo
            </h3>
            <div style={{padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: '#f7fafc'}}>
              <p>Simple version of Recommendation Feedback component</p>
              <div style={{display: 'flex', marginTop: '0.5rem'}}>
                <button style={{...styles.button, ...styles.greenButton, marginRight: '0.5rem'}}>👍 Helpful</button>
                <button style={{...styles.button, ...styles.redButton}}>👎 Not Helpful</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div style={styles.divider}></div>
      
      <div style={{marginBottom: '2rem'}}>
        <div style={styles.flexBetween}>
          <h2 style={styles.boxHeading}>Admin Dashboard</h2>
          <button
            style={styles.button}
            onClick={() => alert('Admin dashboard would be shown here - currently disabled due to Chakra UI compatibility issues')}
          >
            Show Dashboard (Disabled)
          </button>
        </div>
        
        <div style={styles.box}>
          <p>The Admin Analytics Dashboard is currently unavailable due to Chakra UI compatibility issues with version 3.17.0.</p>
          <p style={{marginTop: '0.5rem'}}>The dashboard would normally display:</p>
          <ul style={{marginLeft: '1.5rem', marginTop: '0.5rem', listStyleType: 'disc'}}>
            <li>Overview of user analytics</li>
            <li>User event tracking data</li>
            <li>Feature usage statistics</li>
            <li>User feedback submissions</li>
            <li>Satisfaction survey results</li>
            <li>A/B testing performance metrics</li>
          </ul>
        </div>
      </div>
      
      <div style={styles.divider}></div>
      
      <div style={styles.box}>
        <h2 style={styles.boxHeading}>Development Notes</h2>
        <p>To see the full Analytics & Feedback system working, the Chakra UI compatibility issues need to be resolved.</p>
        <p style={{marginTop: '0.5rem'}}>This page is currently using standard HTML and inline styles instead of Chakra UI components.</p>
      </div>
    </div>
  );
};

export default AnalyticsFeedbackDemo;