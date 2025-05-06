import React, { useState } from 'react';
import colors from '../../../theme/foundations/colors';
import type { Recommendation } from '../../../types/recommendation';
import { submitRecommendationFeedback } from '../../../lib/recommendationService';

/**
 * Props for the RecommendationView component
 */
interface RecommendationViewProps {
  recommendation: Recommendation;
  onClose: () => void;
  onFeedbackSubmitted: (updatedRecommendation: Recommendation) => void;
}

/**
 * RecommendationView component
 * Displays a single AI recommendation in detailed view with full information and feedback options
 */
const RecommendationView: React.FC<RecommendationViewProps> = ({
  recommendation,
  onClose,
  onFeedbackSubmitted
}) => {
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackValue, setFeedbackValue] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [implementedActions, setImplementedActions] = useState<string[]>([]);
  
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

  // Format date string to readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get category display name or fallback to capitalized category
  const getCategoryName = (category: string): string => {
    return categoryNames[category] || 
      category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  // Toggle an action in the implemented actions array
  const toggleImplementedAction = (actionId: string) => {
    if (implementedActions.includes(actionId)) {
      setImplementedActions(implementedActions.filter(id => id !== actionId));
    } else {
      setImplementedActions([...implementedActions, actionId]);
    }
  };
  
  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    if (feedbackValue === null) return;
    
    setIsSubmittingFeedback(true);
    try {
      const updatedRecommendation = await submitRecommendationFeedback(
        recommendation.id,
        recommendation.userId,
        feedbackValue,
        implementedActions.length > 0 ? implementedActions : undefined,
        comment.trim() !== '' ? comment : undefined
      );
      
      if (updatedRecommendation) {
        onFeedbackSubmitted(updatedRecommendation);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };
  
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)',
        maxWidth: '600px',
        margin: '0 auto',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
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
            width: '48px',
            height: '48px',
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
              width: '30px',
              height: '30px'
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d={categoryIcons[recommendation.category] || categoryIcons['maintenance']} />
            </svg>
          </div>
        </div>
        
        {/* Title and Category */}
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '1.1rem',
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
              flexWrap: 'wrap',
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
            {recommendation.expiresAt && (
              <>
                <span style={{ margin: '0 0.25rem' }}>•</span>
                <span>Expires: {formatDate(recommendation.expiresAt)}</span>
              </>
            )}
          </div>
        </div>
        
        {/* Priority Badge */}
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
          }}
        >
          {recommendation.priority}
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: colors.gray[400],
            marginLeft: '0.75rem',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div style={{ padding: '1rem' }}>
        {/* Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: colors.gray[700],
              margin: 0,
              marginBottom: '0.5rem'
            }}
          >
            Recommendation
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: colors.gray[700]
            }}
          >
            {recommendation.description}
          </p>
        </div>
        
        {/* Context Triggers - if any exist */}
        {recommendation.contextTriggers && Object.values(recommendation.contextTriggers).some(v => v) && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: colors.gray[700],
                margin: 0,
                marginBottom: '0.5rem'
              }}
            >
              Based On
            </h4>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              {recommendation.contextTriggers.weather && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: colors.blue[50],
                    color: colors.blue[700],
                    padding: '0.25rem 0.5rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem'
                  }}
                >
                  <svg style={{ width: '14px', height: '14px', marginRight: '0.25rem' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79zM1 10.5h3v2H1zM11 .55h2V3.5h-2zm8.04 2.495l1.408 1.407-1.79 1.79-1.407-1.408zm-1.8 15.115l1.79 1.8 1.41-1.41-1.8-1.79zM20 10.5h3v2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm-1 4h2v2.95h-2zm-7.45-.96l1.41 1.41 1.79-1.8-1.41-1.41z" />
                  </svg>
                  Weather
                </span>
              )}
              {recommendation.contextTriggers.season && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: colors.green[50],
                    color: colors.green[700],
                    padding: '0.25rem 0.5rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem'
                  }}
                >
                  <svg style={{ width: '14px', height: '14px', marginRight: '0.25rem' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.03 3.56c-1.67-1.39-3.74-2.3-6.03-2.51v2.01c1.73.19 3.31.88 4.61 1.92l1.42-1.42zM11 3.06V1.05c-2.29.2-4.36 1.12-6.03 2.51l1.42 1.42C7.69 3.94 9.27 3.25 11 3.06zM4.98 6.39L3.56 4.97C2.17 6.64 1.26 8.71 1.05 11h2.01c.19-1.73.88-3.31 1.92-4.61zM20.94 11h2.01c-.21-2.29-1.12-4.36-2.51-6.03l-1.42 1.42c1.04 1.3 1.73 2.88 1.92 4.61zM7 12l3.44 1.56L12 17l1.56-3.44L17 12l-3.44-1.56L12 7l-1.56 3.44z" />
                  </svg>
                  Season
                </span>
              )}
              {recommendation.contextTriggers.lawnCondition && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: colors.brown[50],
                    color: colors.brown[700],
                    padding: '0.25rem 0.5rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem'
                  }}
                >
                  <svg style={{ width: '14px', height: '14px', marginRight: '0.25rem' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2zm0 18c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8zm-3-9h6v2H9v-2z" />
                  </svg>
                  Lawn Condition
                </span>
              )}
              {recommendation.contextTriggers.userActivity && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: colors.gray[100],
                    color: colors.gray[700],
                    padding: '0.25rem 0.5rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem'
                  }}
                >
                  <svg style={{ width: '14px', height: '14px', marginRight: '0.25rem' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Your Activity
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Suggested Actions */}
        {recommendation.suggestedActions && recommendation.suggestedActions.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: colors.gray[700],
                margin: 0,
                marginBottom: '0.5rem'
              }}
            >
              Suggested Actions
            </h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              {recommendation.suggestedActions.map(action => (
                <div
                  key={action.id}
                  style={{
                    backgroundColor: colors.gray[50],
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    border: '1px solid',
                    borderColor: colors.gray[100],
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start'
                    }}
                  >
                    {!recommendation.feedback && (
                      <div style={{ marginRight: '0.75rem' }}>
                        <input
                          type="checkbox"
                          id={`action-${action.id}`}
                          checked={implementedActions.includes(action.id)}
                          onChange={() => toggleImplementedAction(action.id)}
                          style={{
                            width: '1.25rem',
                            height: '1.25rem',
                            accentColor: colors.green[500],
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <label
                        htmlFor={`action-${action.id}`}
                        style={{
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          color: colors.gray[800],
                          display: 'block',
                          marginBottom: '0.25rem',
                          cursor: recommendation.feedback ? 'default' : 'pointer',
                        }}
                      >
                        {action.title}
                      </label>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          color: colors.gray[600],
                          lineHeight: 1.5
                        }}
                      >
                        {action.description}
                      </p>
                      {action.taskCategory && (
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: colors.blue[50],
                            color: colors.blue[700],
                            padding: '0.125rem 0.375rem',
                            borderRadius: '1rem',
                            fontSize: '0.65rem',
                            marginTop: '0.5rem',
                          }}
                        >
                          {action.taskCategory}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Related Products */}
        {recommendation.relatedProducts && recommendation.relatedProducts.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: colors.gray[700],
                margin: 0,
                marginBottom: '0.5rem'
              }}
            >
              Related Products
            </h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              {recommendation.relatedProducts.map(product => (
                <div
                  key={product.id}
                  style={{
                    backgroundColor: colors.gray[50],
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    border: '1px solid',
                    borderColor: colors.gray[100],
                  }}
                >
                  <h5
                    style={{
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      color: colors.gray[800],
                      margin: 0,
                      marginBottom: '0.25rem'
                    }}
                  >
                    {product.name}
                  </h5>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      color: colors.gray[600],
                      lineHeight: 1.5
                    }}
                  >
                    {product.description}
                  </p>
                  {product.applicationInstructions && (
                    <p
                      style={{
                        margin: '0.5rem 0 0',
                        fontSize: '0.75rem',
                        color: colors.gray[700],
                        fontStyle: 'italic'
                      }}
                    >
                      <strong>Application:</strong> {product.applicationInstructions}
                    </p>
                  )}
                  {product.url && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          color: colors.blue[500],
                          fontSize: '0.75rem',
                          textDecoration: 'none'
                        }}
                      >
                        View Product
                        <svg style={{ width: '14px', height: '14px', marginLeft: '0.25rem' }} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* AI Confidence Score (if from AI) */}
        {recommendation.source === 'ai' && recommendation.aiConfidenceScore !== undefined && (
          <div
            style={{
              marginBottom: '1.5rem',
              backgroundColor: colors.gray[50],
              padding: '0.75rem',
              borderRadius: '0.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.25rem'
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: colors.gray[700]
                }}
              >
                AI Confidence
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: recommendation.aiConfidenceScore > 70 ? colors.green[500] : colors.status.warning
                }}
              >
                {recommendation.aiConfidenceScore}%
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: colors.gray[200],
                borderRadius: '3px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${recommendation.aiConfidenceScore}%`,
                  height: '100%',
                  backgroundColor: recommendation.aiConfidenceScore > 70 ? colors.green[500] : colors.status.warning
                }}
              />
            </div>
          </div>
        )}
        
        {/* Feedback UI if no feedback yet */}
        {!recommendation.feedback && !isSubmittingFeedback && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: colors.gray[50],
              borderRadius: '0.5rem',
              border: '1px solid',
              borderColor: colors.gray[100]
            }}
          >
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: colors.gray[700],
                margin: 0,
                marginBottom: '1rem'
              }}
            >
              Provide Feedback
            </h4>
            
            {/* Is this helpful */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: colors.gray[700],
                  marginBottom: '0.5rem'
                }}
              >
                Was this recommendation helpful?
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setFeedbackValue(true)}
                  style={{
                    background: feedbackValue === true ? colors.green[50] : 'white',
                    border: '1px solid',
                    borderColor: feedbackValue === true ? colors.green[300] : colors.gray[300],
                    color: feedbackValue === true ? colors.green[500] : colors.gray[700],
                    borderRadius: '0.25rem',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg style={{ width: '16px', height: '16px', marginRight: '0.25rem' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 21h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.58 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2zM9 9l4.34-4.34L12 10h9v2l-3 7H9V9zM1 9h4v12H1z" />
                  </svg>
                  Yes
                </button>
                <button
                  onClick={() => setFeedbackValue(false)}
                  style={{
                    background: feedbackValue === false ? colors.status.error : 'white',
                    border: '1px solid',
                    borderColor: feedbackValue === false ? colors.status.error : colors.gray[300],
                    color: feedbackValue === false ? 'white' : colors.gray[700],
                    borderRadius: '0.25rem',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg style={{ width: '16px', height: '16px', marginRight: '0.25rem' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm0 12l-4.34 4.34L12 14H3v-2l3-7h9v10zm4-12h4v12h-4V3z" />
                  </svg>
                  No
                </button>
              </div>
            </div>
            
            {/* Additional Comment */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: colors.gray[700],
                  marginBottom: '0.5rem'
                }}
              >
                Comments (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Provide any additional feedback..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  border: '1px solid',
                  borderColor: colors.gray[300],
                  fontSize: '0.8rem',
                  resize: 'vertical'
                }}
              />
            </div>
            
            {/* Submit Button */}
            <button
              onClick={handleSubmitFeedback}
              disabled={feedbackValue === null}
              style={{
                backgroundColor: colors.blue[500],
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: feedbackValue === null ? 'not-allowed' : 'pointer',
                opacity: feedbackValue === null ? 0.6 : 1,
                transition: 'background-color 0.2s ease',
                width: '100%'
              }}
            >
              Submit Feedback
            </button>
          </div>
        )}
        
        {/* Feedback display if already provided */}
        {recommendation.feedback && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: colors.gray[50],
              borderRadius: '0.5rem',
              border: '1px solid',
              borderColor: colors.gray[100]
            }}
          >
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: colors.gray[700],
                margin: 0,
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <svg style={{ width: '18px', height: '18px', marginRight: '0.375rem' }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17l-4.17-4.17-1.42 1.41 5.59 5.59 12-12-1.41-1.41z" />
              </svg>
              Your Feedback
            </h4>
            
            <div style={{ fontSize: '0.85rem', color: colors.gray[700] }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: recommendation.feedback.comment ? '0.75rem' : 0
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: recommendation.feedback.isHelpful ? colors.green[500] : colors.status.error,
                    marginRight: '0.75rem'
                  }}
                >
                  <svg style={{ width: '16px', height: '16px', marginRight: '0.25rem' }} viewBox="0 0 24 24" fill="currentColor">
                    {recommendation.feedback.isHelpful ? (
                      <path d="M9 21h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.58 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2zM9 9l4.34-4.34L12 10h9v2l-3 7H9V9zM1 9h4v12H1z" />
                    ) : (
                      <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm0 12l-4.34 4.34L12 14H3v-2l3-7h9v10zm4-12h4v12h-4V3z" />
                    )}
                  </svg>
                  You found this {recommendation.feedback.isHelpful ? 'helpful' : 'unhelpful'}
                </span>
                <span style={{ color: colors.gray[500], fontSize: '0.75rem' }}>
                  {formatDate(recommendation.feedback.submittedAt)}
                </span>
              </div>
              
              {recommendation.feedback.comment && (
                <p
                  style={{
                    margin: '0 0 0.75rem',
                    fontSize: '0.8rem',
                    fontStyle: 'italic',
                    color: colors.gray[600],
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '0.25rem',
                    border: '1px solid',
                    borderColor: colors.gray[200]
                  }}
                >
                  "{recommendation.feedback.comment}"
                </p>
              )}
              
              {recommendation.feedback.implementedActions && recommendation.feedback.implementedActions.length > 0 && (
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: colors.green[600],
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '0.25rem'
                    }}
                  >
                    <svg style={{ width: '14px', height: '14px', marginRight: '0.25rem' }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17l-4.17-4.17-1.42 1.41 5.59 5.59 12-12-1.41-1.41z" />
                    </svg>
                    {recommendation.feedback.implementedActions.length} action{recommendation.feedback.implementedActions.length !== 1 ? 's' : ''} implemented
                  </span>
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      paddingLeft: '1.5rem',
                      fontSize: '0.75rem',
                      color: colors.gray[600]
                    }}
                  >
                    {recommendation.suggestedActions?.filter(a => recommendation.feedback?.implementedActions?.includes(a.id)).map(action => (
                      <li key={action.id} style={{ marginBottom: '0.25rem' }}>
                        {action.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationView;