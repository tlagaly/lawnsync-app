import React from 'react';
import colors from '../../../theme/foundations/colors';

interface ProgressTrackerProps {
  lawnHealth: number;
}

/**
 * Progress Tracker component that shows visual progress indicators
 * for lawn health improvement over time
 */
const ProgressTracker: React.FC<ProgressTrackerProps> = ({ lawnHealth }) => {
  // Helper function to determine health status text and color
  const getHealthStatus = (healthScore: number) => {
    if (healthScore >= 80) {
      return {
        text: 'Excellent',
        color: colors.green[500]
      };
    } else if (healthScore >= 60) {
      return {
        text: 'Good',
        color: colors.green[400]
      };
    } else if (healthScore >= 40) {
      return {
        text: 'Fair',
        color: colors.status.warning
      };
    } else {
      return {
        text: 'Needs Work',
        color: colors.status.error
      };
    }
  };

  const healthStatus = getHealthStatus(lawnHealth);

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)',
      overflow: 'hidden'
    }}>
      {/* Card Header */}
      <div style={{ 
        display: 'flex',
        backgroundColor: colors.brown[50],
        padding: '1rem',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderBottomColor: colors.gray[100]
      }}>
        <h3 style={{ 
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.brown[700],
          display: 'flex',
          alignItems: 'center',
          margin: 0
        }}>
          <span style={{ 
            display: 'inline-flex', 
            marginRight: '0.5rem', 
            color: colors.brown[500], 
            width: '20px', 
            height: '20px' 
          }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
            </svg>
          </span>
          Lawn Health Progress
        </h3>
      </div>
      
      {/* Progress Content */}
      <div style={{ padding: '1.5rem' }}>
        {/* Health Score */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h4 style={{ 
              fontSize: '0.875rem',
              fontWeight: 500,
              color: colors.gray[600],
              marginTop: 0,
              marginBottom: '0.25rem'
            }}>
              Current Lawn Health
            </h4>
            <div style={{ 
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.5rem'
            }}>
              <span style={{ 
                fontSize: '2rem',
                fontWeight: 700,
                color: colors.gray[800]
              }}>
                {lawnHealth}%
              </span>
              <span style={{ 
                fontSize: '1rem',
                fontWeight: 500,
                color: healthStatus.color
              }}>
                {healthStatus.text}
              </span>
            </div>
          </div>
          
          {/* Circular Progress Indicator */}
          <div style={{
            position: 'relative',
            width: '60px',
            height: '60px'
          }}>
            <svg width="60" height="60" viewBox="0 0 60 60">
              {/* Background Circle */}
              <circle
                cx="30"
                cy="30"
                r="24"
                fill="none"
                stroke={colors.gray[200]}
                strokeWidth="6"
              />
              
              {/* Progress Circle */}
              <circle
                cx="30"
                cy="30"
                r="24"
                fill="none"
                stroke={healthStatus.color}
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 24 * (lawnHealth / 100)} ${2 * Math.PI * 24}`}
                strokeDashoffset="0"
                transform="rotate(-90 30 30)"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Lawn Icon in Center */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: healthStatus.color,
              width: '24px',
              height: '24px'
            }}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 20H2v-2h5.75A8.032 8.032 0 012 12.5c0-2.27.95-4.32 2.47-5.78.22-.21.48-.37.75-.54.33-.21.7-.38 1.07-.54C7.39 5.26 8.67 5 10 5c3.19 0 5.93 1.87 7.21 4.56.62-.45 1.35-.78 2.15-.92 1.58-.28 3.1.2 4.1 1.2.99.99 1.47 2.4 1.29 3.85-.12.95-.55 1.87-1.27 2.6-.71.71-1.62 1.17-2.58 1.38-.46.1-.94.15-1.4.15-1.25 0-2.4-.36-3.37-.96-.35.93-.86 1.76-1.49 2.46H22v2H12z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ 
              fontSize: '0.875rem',
              fontWeight: 500,
              color: colors.gray[700]
            }}>
              Month-Over-Month Improvement
            </span>
            <span style={{ 
              fontSize: '0.875rem',
              fontWeight: 700,
              color: colors.green[600]
            }}>
              +15%
            </span>
          </div>
          
          <div style={{
            height: '0.5rem',
            backgroundColor: colors.gray[100],
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: '15%',
              backgroundColor: colors.green[400],
              borderRadius: '9999px'
            }} />
          </div>
        </div>
        
        {/* Improvement Areas */}
        <div>
          <h4 style={{ 
            fontSize: '0.875rem',
            fontWeight: 500,
            color: colors.gray[700],
            marginTop: 0,
            marginBottom: '0.75rem'
          }}>
            Areas of Improvement
          </h4>
          
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              backgroundColor: colors.green[50],
              color: colors.green[700],
              padding: '0.375rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem'
            }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <span>Grass Density</span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              backgroundColor: colors.status.warning + '20', // Add opacity
              color: colors.status.warning,
              padding: '0.375rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem'
            }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
              </svg>
              <span>Weed Presence</span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              backgroundColor: colors.status.warning + '20', // Add opacity
              color: colors.status.warning,
              padding: '0.375rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem'
            }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
              </svg>
              <span>Soil Compaction</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call To Action */}
      <div style={{
        padding: '1rem',
        backgroundColor: colors.green[50],
        borderTop: '1px solid',
        borderTopColor: colors.gray[100],
        display: 'flex',
        justifyContent: 'center'
      }}>
        <span style={{
          fontSize: '0.875rem',
          color: colors.green[600],
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <span>View Progress Timeline</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default ProgressTracker;