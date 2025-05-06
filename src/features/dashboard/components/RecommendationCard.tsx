import React, { useState } from 'react';
import colors from '../../../theme/foundations/colors';
import type { Recommendation } from '../../../types/recommendation';

/**
 * Props for the RecommendationCard component
 */
interface RecommendationCardProps {
  recommendation: Recommendation;
  onViewDetails: (recommendationId: string) => void;
  onProvideFeedback: (recommendationId: string, isHelpful: boolean) => void;
}

/**
 * RecommendationCard component
 * Displays a single AI recommendation in card format with basic actions
 */
const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onViewDetails,
  onProvideFeedback
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    'maintenance': 'M19.4 13l.1-1-5.4.2-2.2-3.2-3.4 5.9-8 1.7 1-.9 6.4-1.5 3.6-6.1L14.9 11l4.5-.1z',
    'problem-solving': 'M14.5 18.69L12 16.19l-2.5 2.5-1.41-1.41 2.5-2.5-2.5-2.5 1.41-1.41 2.5 2.5 2.5-2.5 1.41 1.41-2.5 2.5 2.5 2.5-1.41 1.41zM19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h14v14z',
    'seasonal': 'M9 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm1-11h-2v3H5v2h3v3h2v-3h3v-2H10z',
    'improvement': 'M23 8c0 1.1-.9 2-2 2-.18 0-.35-.02-.51-.07l-3.56 3.55c.05.16.07.34.07.52 0 1.1-.9 2-2 2s-2-.9-2-2c0-.18.02-.36.07-.52l-2.55-2.55c-.16.05-.34.07-.52.07s-.36-.02-.52-.07l-4.55 4.56c.05.16.07.33.07.51 0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.18 0 .35.02.51.07l4.56-4.55C8.02 9.36 8 9.18 8 9c0-1.1.9-2 2-2s2 .9 2 2c0 .18-.02.36-.07.52l2.55 2.55c.16-.05.34-.07.52-.07s.36.02.52.07l3.55-3.56C19.02 8.35 19 8.18 19 8c0-1.1.9-2 2-2s2 .9 2 2z',
    'resource-saving': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
    'preventative': 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z'
  };
  
  // Category display names mapping
  const categoryNames: Record<string, string> = {
    'maintenance': 'Regular Maintenance',
    'problem-solving': 'Problem Solution',
    'seasonal': 'Seasonal Care',
    'improvement': 'Lawn Improvement',
    'resource-saving': 'Resource Saving',
    'preventative': 'Preventative Care'
  };
  
  // Priority colors
  const priorityColors: Record<string, string> = {
    'high': colors.status.error,
    'medium': colors.status.warning,
    'low': colors.status.success
  };
  
  // Get category icon or fallback to a default
  const getCategoryIcon = (category: string): string => {
    return categoryIcons[category] || 'M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z';
  };
  
  // Get category display name or fallback to capitalized category
  const getCategoryName = (category: string): string => {
    return categoryNames[category] || 
      category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  // Format date string to readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Handle view details click
  const handleViewDetails = () => {
    onViewDetails(recommendation.id);
  };
  
  // Handle feedback button click
  const handleFeedback = (isHelpful: boolean, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    onProvideFeedback(recommendation.id, isHelpful);
  };
  
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)',
        overflow: 'hidden',
        marginBottom: '16px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onClick={handleViewDetails}
    >
      {/* Card Header */}
      <div
        style={{
          display: 'flex',
          padding: '1rem',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderBottomColor: colors.gray[100],
          backgroundColor: colors.blue[50]
        }}
      >
        {/* Category Icon */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0.75rem',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            flexShrink: 0
          }}
        >
          <div
            style={{
              color: colors.blue[500],
              width: '24px',
              height: '24px'
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d={getCategoryIcon(recommendation.category)} />
            </svg>
          </div>
        </div>
        
        {/* Title and Meta */}
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: colors.gray[800],
              margin: 0,
              marginBottom: '0.25rem'
            }}
          >
            {recommendation.title}
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: colors.gray[600]
            }}
          >
            <span
              style={{
                display: 'inline-block',
                backgroundColor: recommendation.source === 'ai' ? colors.blue[100] : colors.gray[100],
                color: recommendation.source === 'ai' ? colors.blue[700] : colors.gray[700],
                padding: '0.125rem 0.375rem',
                borderRadius: '1rem',
                fontSize: '0.65rem',
                marginRight: '0.5rem',
              }}
            >
              {recommendation.source === 'ai' ? 'AI' : recommendation.source === 'expert' ? 'Expert' : 'System'}
            </span>
            <span>{getCategoryName(recommendation.category)}</span>
            <span style={{ margin: '0 0.25rem' }}>•</span>
            <span>{formatDate(recommendation.createdAt)}</span>
          </div>
        </div>
        
        {/* Priority Label */}
        <div
          style={{
            backgroundColor: priorityColors[recommendation.priority],
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 600,
            padding: '0.25rem 0.5rem',
            borderRadius: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginLeft: '0.5rem'
          }}
        >
          {recommendation.priority}
        </div>
      </div>
      
      {/* Card Content */}
      <div style={{ padding: '1rem' }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.85rem',
            lineHeight: 1.5,
            color: colors.gray[700]
          }}
        >
          {recommendation.description}
        </p>
        
        {/* Suggested Actions */}
        {recommendation.suggestedActions && recommendation.suggestedActions.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h4
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: colors.gray[700],
                margin: 0,
                marginBottom: '0.5rem'
              }}
            >
              Suggested Actions:
            </h4>
            <ul
              style={{
                margin: 0,
                padding: 0,
                paddingLeft: '1.5rem',
                fontSize: '0.8rem',
                color: colors.gray[700],
              }}
            >
              {recommendation.suggestedActions.slice(0, expanded ? undefined : 1).map(action => (
                <li key={action.id} style={{ marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 500 }}>{action.title}</span>
                  {expanded && (
                    <p style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.75rem' }}>
                      {action.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            {recommendation.suggestedActions.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.blue[500],
                  fontSize: '0.75rem',
                  padding: '0.25rem 0',
                  cursor: 'pointer',
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {expanded ? 'Show less' : `Show ${recommendation.suggestedActions.length - 1} more actions`}
                <span style={{
                  display: 'inline-flex',
                  width: '16px',
                  height: '16px',
                  marginLeft: '0.25rem'
                }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d={expanded ? 'M7 14l5-5 5 5z' : 'M7 10l5 5 5-5z'} />
                  </svg>
                </span>
              </button>
            )}
          </div>
        )}
        
        {/* Footer with Feedback buttons if no feedback yet */}
        {!recommendation.feedback && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '1rem',
              borderTop: '1px solid',
              borderTopColor: colors.gray[100],
              paddingTop: '0.75rem'
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: colors.gray[600],
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Was this helpful?
            </span>
            <div>
              <button
                onClick={(e) => handleFeedback(true, e)}
                style={{
                  background: 'none',
                  border: '1px solid',
                  borderColor: colors.green[300],
                  color: colors.green[500],
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  marginRight: '0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <svg style={{ width: '14px', height: '14px', marginRight: '0.25rem' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 21h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.58 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2zM9 9l4.34-4.34L12 10h9v2l-3 7H9V9zM1 9h4v12H1z" />
                  </svg>
                  Yes
                </span>
              </button>
              <button
                onClick={(e) => handleFeedback(false, e)}
                style={{
                  background: 'none',
                  border: '1px solid',
                  borderColor: colors.status.error,
                  color: colors.status.error,
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <svg style={{ width: '14px', height: '14px', marginRight: '0.25rem' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm0 12l-4.34 4.34L12 14H3v-2l3-7h9v10zm4-12h4v12h-4V3z" />
                  </svg>
                  No
                </span>
              </button>
            </div>
          </div>
        )}
        
        {/* Show feedback summary if feedback exists */}
        {recommendation.feedback && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '1rem',
              borderTop: '1px solid',
              borderTopColor: colors.gray[100],
              paddingTop: '0.75rem',
              fontSize: '0.75rem',
              color: recommendation.feedback.isHelpful ? colors.green[500] : colors.gray[600]
            }}
          >
            <span style={{ display: 'inline-flex', marginRight: '0.5rem', alignItems: 'center' }}>
              <svg style={{ width: '14px', height: '14px', marginRight: '0.25rem' }} viewBox="0 0 24 24" fill="currentColor">
                {recommendation.feedback.isHelpful ? (
                  <path d="M9 21h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.58 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2zM9 9l4.34-4.34L12 10h9v2l-3 7H9V9zM1 9h4v12H1z" />
                ) : (
                  <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm0 12l-4.34 4.34L12 14H3v-2l3-7h9v10zm4-12h4v12h-4V3z" />
                )}
              </svg>
              {recommendation.feedback.isHelpful ? 'You found this helpful' : 'You found this unhelpful'}
            </span>
            {recommendation.feedback.implementedActions && recommendation.feedback.implementedActions.length > 0 && (
              <span style={{ marginLeft: 'auto', color: colors.green[500] }}>
                {recommendation.feedback.implementedActions.length} action{recommendation.feedback.implementedActions.length !== 1 ? 's' : ''} implemented
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;