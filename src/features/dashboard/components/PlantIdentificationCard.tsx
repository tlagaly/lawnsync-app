import React from 'react';
import type { PlantIdentificationResult, PlantCategory } from '../../../types/plantIdentification';
import colors from '../../../theme/foundations/colors';

interface PlantIdentificationCardProps {
  identification: PlantIdentificationResult;
  onViewDetails?: (id: string) => void;
  compact?: boolean;
}

/**
 * Renders a card displaying plant identification results
 */
const PlantIdentificationCard: React.FC<PlantIdentificationCardProps> = ({
  identification,
  onViewDetails,
  compact = false
}) => {
  const {
    id,
    imageUrl,
    identifiedAt,
    identifiedSpecies,
    aiConfidenceScore
  } = identification;

  // Format the date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get appropriate color for plant category
  const getCategoryColor = (category?: PlantCategory): string => {
    if (!category) return colors.gray[500];
    
    switch (category) {
      case 'weed':
        return colors.status.error;
      case 'grass':
        return colors.green[500];
      case 'turf_disease':
        return colors.status.warning;
      case 'fungus':
        return colors.brown[700];
      case 'insect_damage':
        return colors.status.error;
      case 'ornamental':
        return colors.blue[700];
      case 'nutrient_deficiency':
        return colors.brown[500];
      case 'herb':
        return colors.green[400];
      case 'tree':
        return colors.green[600];
      case 'shrub':
        return colors.green[500];
      default:
        return colors.gray[500];
    }
  };

  // Get icon for plant category
  const getCategoryIcon = (category?: PlantCategory): string => {
    if (!category) return 'M12 22q-2.05 0-3.9-.788-1.85-.787-3.175-2.137-1.325-1.35-2.1-3.175Q2 14.075 2 12t.825-3.9q.825-1.85 2.125-3.175Q6.25 3.575 8.1 2.787 9.95 2 12 2t3.9.787q1.85.788 3.175 2.138 1.325 1.35 2.1 3.175Q22 9.925 22 12t-.825 3.9q-.825 1.85-2.125 3.175Q17.75 20.425 15.9 21.213 14.05 22 12 22zm0-2q3.35 0 5.675-2.35Q20 15.3 20 12q0-3.35-2.325-5.675Q15.35 4 12 4 8.65 4 6.325 6.325 4 8.65 4 12q0 3.35 2.325 5.65Q8.65 20 12 20zm0-8z';
    
    switch (category) {
      case 'weed':
        return 'M7.5 11H2v2h5.5v5.5h2V13H15V7.5h-5.5V2h-2V7.5zM17 17c.83 0 1.5-.67 1.5-1.5S17.83 14 17 14s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 0c.83 0 1.5-.67 1.5-1.5S12.83 14 12 14s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 0c.83 0 1.5-.67 1.5-1.5S7.83 14 7 14s-1.5.67-1.5 1.5.67 1.5 1.5 1.5z';
      case 'grass':
        return 'M12 22q-1.55 0-2.975-.5-1.425-.5-2.65-1.45l1.4-1.4q.95.75 2.05 1.125Q10.925 20 12 20t2.175-.225q1.1-.375 2.05-1.125l1.4 1.4q-1.225.95-2.65 1.45-1.425.5-2.975.5zm-4.55-5.4L6 15.15q-.475-1.1-.712-2.275Q5.05 11.7 5.05 10.5q0-2.95 1.875-5.225T12 2q1.55 0 2.975.5t2.65 1.45l-1.4 1.4q-.95-.75-2.05-1.125Q13.075 4 12 4q-2.3 0-3.9 1.625T6.4 10.2q-.05.825.125 1.625t.525 1.575l1.4 1.4 3.05-3.05V15l-4.05 1.6zm9.1 0L12.5 15v-3.25l3.05 3.05 1.4-1.4q.35-.775.525-1.575t.125-1.625q-.1-1.9-.8-3.5t-1.9-2.7l1.4-1.4q1.35 1.375 2.125 3.15.775 1.775.775 3.75 0 1.2-.238 2.375Q18.475 11.7 18 12.8l-1.45 1.45L12.5 12.2v-1.7l4.05 4.05z';
      case 'turf_disease':
        return 'M21.88 18.68L18 14.8V12h1V8h-1V4c0-1.1-.9-2-2-2H8C6.9 2 6 2.9 6 4v4H5v4h1v2.8L2.12 18.68c-.49.49-.12 1.32.59 1.32h18.58c.71 0 1.08-.83.59-1.32zM8 4h8v2H8V4zm0 14H4.41l2-2h5.79l-2.3-4h4.2l-2.3 4h5.79l2 2H8z';
      case 'fungus':
        return 'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm-.5 18.5c-.97.57-2.15.5-3.03-.23-.87-.74-1.16-1.95-.62-2.94 2.85-2.22 4.65-3.43 5.19-7.83.31 1.75.72 3.26.96 4.43-.2 2.29-1.89 5.36-2.5 6.57z';
      case 'insect_damage':
        return 'M10.8 3.9 8 2 5.3 3.5 8 3.9v1.7H5V7H3V5.5L1.4 5 1 8.3 4.3 8 5 9H2v1h3.8L2 14v6h2v-4.6L7 18v4h2v-7.5l-3-4.5 1-1H8v2h8v-2h1l1 1-3 4.5V22h2v-4l3-2.6V20h2v-6l-3.8-4H20v-1h-3l.7-1 3.3.3-.4-3.3-1.6.5V5H17v-1.5h-3V1.7L16 1l-2.7-1L11 2v1.9H9V2H8v2.8l.8 1.1h2zM13 8h1v1h-1V8z';
      case 'ornamental':
        return 'M12 22q-2.05 0-3.9-.788-1.85-.787-3.175-2.137-1.325-1.35-2.1-3.175Q2 14.075 2 12t.825-3.9q.825-1.85 2.125-3.175Q6.25 3.575 8.1 2.787 9.95 2 12 2t3.9.787q1.85.788 3.175 2.138 1.325 1.35 2.1 3.175Q22 9.925 22 12t-.825 3.9q-.825 1.85-2.125 3.175Q17.75 20.425 15.9 21.213 14.05 22 12 22zm0-2q3.35 0 5.675-2.35Q20 15.3 20 12q0-3.35-2.325-5.675Q15.35 4 12 4 8.65 4 6.325 6.325 4 8.65 4 12q0 3.35 2.325 5.65Q8.65 20 12 20zm0-8z';
      default:
        return 'M12 22q-2.05 0-3.9-.788-1.85-.787-3.175-2.137-1.325-1.35-2.1-3.175Q2 14.075 2 12t.825-3.9q.825-1.85 2.125-3.175Q6.25 3.575 8.1 2.787 9.95 2 12 2t3.9.787q1.85.788 3.175 2.138 1.325 1.35 2.1 3.175Q22 9.925 22 12t-.825 3.9q-.825 1.85-2.125 3.175Q17.75 20.425 15.9 21.213 14.05 22 12 22zm0-2q3.35 0 5.675-2.35Q20 15.3 20 12q0-3.35-2.325-5.675Q15.35 4 12 4 8.65 4 6.325 6.325 4 8.65 4 12q0 3.35 2.325 5.65Q8.65 20 12 20zm0-8z';
    }
  };

  // Confidence level indicator
  const getConfidenceLevel = (score?: number): { label: string; color: string } => {
    if (!score) return { label: 'Unknown', color: colors.gray[500] };
    
    if (score >= 90) return { label: 'Very High', color: colors.green[500] };
    if (score >= 75) return { label: 'High', color: colors.green[400] };
    if (score >= 60) return { label: 'Medium', color: colors.status.warning };
    if (score >= 40) return { label: 'Low', color: colors.status.warning };
    return { label: 'Very Low', color: colors.status.error };
  };

  const confidence = getConfidenceLevel(aiConfidenceScore);
  const categoryColor = getCategoryColor(identifiedSpecies?.category);
  const categoryIcon = getCategoryIcon(identifiedSpecies?.category);

  // Handle card click
  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(id);
    }
  };

  if (compact) {
    // Compact view for small spaces
    return (
      <div
        onClick={handleCardClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)',
          cursor: onViewDetails ? 'pointer' : 'default',
          marginBottom: '0.75rem'
        }}
      >
        {/* Thumbnail */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '0.25rem',
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            marginRight: '0.75rem',
            flexShrink: 0
          }}
        />
        
        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: 600,
            color: colors.gray[800],
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {identifiedSpecies?.commonName || 'Unknown Plant'}
          </h4>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '0.25rem',
            fontSize: '0.75rem',
            color: colors.gray[600]
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: categoryColor,
              marginRight: '0.5rem'
            }}>
              <span style={{ 
                display: 'inline-flex',
                width: '14px',
                height: '14px',
                marginRight: '0.25rem'
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d={categoryIcon} />
                </svg>
              </span>
              {identifiedSpecies?.category?.replace('_', ' ') || 'unknown'}
            </div>
            <span style={{ color: confidence.color }}>
              {confidence.label}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)',
        overflow: 'hidden',
        cursor: onViewDetails ? 'pointer' : 'default',
        marginBottom: '1rem',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      {/* Image Section */}
      <div
        style={{
          height: '180px',
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}
      >
        {/* Confidence Badge */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          backgroundColor: confidence.color,
          color: 'white',
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '0.25rem 0.5rem',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ 
            display: 'inline-flex',
            width: '12px',
            height: '12px',
            marginRight: '0.25rem'
          }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </span>
          {aiConfidenceScore ? `${aiConfidenceScore}%` : 'Unknown'} confidence
        </div>
        
        {/* Category Badge */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '0.25rem 0.5rem',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ 
            display: 'inline-flex',
            width: '12px',
            height: '12px',
            marginRight: '0.25rem',
            color: categoryColor
          }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d={categoryIcon} />
            </svg>
          </span>
          {identifiedSpecies?.category?.replace('_', ' ') || 'Unknown'}
        </div>
      </div>
      
      {/* Content Section */}
      <div style={{ padding: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '0.25rem'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.125rem',
            fontWeight: 600,
            color: colors.gray[800]
          }}>
            {identifiedSpecies?.commonName || 'Unknown Plant'}
          </h3>
          
          <span style={{
            fontSize: '0.75rem',
            color: colors.gray[500]
          }}>
            {formatDate(identifiedAt)}
          </span>
        </div>
        
        <p style={{
          margin: '0.5rem 0 0',
          fontSize: '0.875rem',
          color: colors.gray[600],
          lineHeight: 1.5
        }}>
          {identifiedSpecies?.scientificName && (
            <i style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: colors.gray[500]
            }}>
              {identifiedSpecies.scientificName}
            </i>
          )}
          
          {identifiedSpecies?.description ? (
            identifiedSpecies.description.length > 120 ? 
              `${identifiedSpecies.description.substring(0, 120)}...` : 
              identifiedSpecies.description
          ) : (
            'No description available.'
          )}
        </p>
        
        {/* Care recommendations preview */}
        {identifiedSpecies?.careRecommendations && identifiedSpecies.careRecommendations.length > 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.gray[700],
              marginBottom: '0.5rem'
            }}>
              Recommended Actions:
            </div>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {identifiedSpecies.careRecommendations.slice(0, 2).map(recommendation => (
                <div
                  key={recommendation.id}
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: colors.blue[50],
                    color: colors.blue[700],
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <span style={{
                    display: 'inline-flex',
                    width: '14px',
                    height: '14px',
                    marginRight: '0.25rem'
                  }}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </span>
                  {recommendation.title}
                </div>
              ))}
              
              {identifiedSpecies.careRecommendations.length > 2 && (
                <div style={{
                  fontSize: '0.75rem',
                  backgroundColor: colors.gray[100],
                  color: colors.gray[700],
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem'
                }}>
                  +{identifiedSpecies.careRecommendations.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* View details button */}
        {onViewDetails && (
          <div style={{
            marginTop: '1rem',
            textAlign: 'right'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: colors.blue[600],
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              View Details
              <span style={{
                display: 'inline-flex',
                width: '18px',
                height: '18px',
                marginLeft: '0.25rem'
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantIdentificationCard;