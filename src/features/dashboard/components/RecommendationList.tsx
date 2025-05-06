import React, { useState, useEffect } from 'react';
import colors from '../../../theme/foundations/colors';
import RecommendationCard from './RecommendationCard';
import RecommendationView from './RecommendationView';
import type { 
  Recommendation, 
  RecommendationFilterOptions,
  RecommendationType 
} from '../../../types/recommendation';
import { 
  getRecommendations, 
  submitRecommendationFeedback,
  buildRecommendationRequest,
  generateRecommendation
} from '../../../lib/recommendationService';
import { mockUserData } from '../mockData';

/**
 * Props for the RecommendationList component
 */
interface RecommendationListProps {
  maxInitialItems?: number;
}

/**
 * RecommendationList component
 * Displays a list of AI recommendations with filtering options
 */
const RecommendationList: React.FC<RecommendationListProps> = ({
  maxInitialItems = 3
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [filterOptions, setFilterOptions] = useState<RecommendationFilterOptions>({
    sortBy: 'priority'
  });
  const [activeTypeFilter, setActiveTypeFilter] = useState<RecommendationType | 'all'>('all');
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);

  // Fetch recommendations on component mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        // In a real app, you'd get the user ID from auth
        const userId = 'user123';
        const recs = await getRecommendations(userId);
        setRecommendations(recs);
        setFilteredRecommendations(recs);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Apply filters when filter options or active type changes
  useEffect(() => {
    let filtered = [...recommendations];
    
    // Filter by type if not 'all'
    if (activeTypeFilter !== 'all') {
      filtered = filtered.filter(rec => rec.category === activeTypeFilter);
    }
    
    // Apply sorting
    switch (filterOptions.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'priority':
        const priorityValue = { 'low': 1, 'medium': 2, 'high': 3 };
        filtered.sort((a, b) => priorityValue[b.priority] - priorityValue[a.priority]);
        break;
      case 'expiring-soon':
        filtered.sort((a, b) => {
          const aExpiry = a.expiresAt ? new Date(a.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
          const bExpiry = b.expiresAt ? new Date(b.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
          return aExpiry - bExpiry;
        });
        break;
    }
    
    setFilteredRecommendations(filtered);
  }, [recommendations, filterOptions, activeTypeFilter]);

  // Handle viewing a recommendation's details
  const handleViewDetails = (recommendationId: string) => {
    const recommendation = recommendations.find(r => r.id === recommendationId);
    if (recommendation) {
      setSelectedRecommendation(recommendation);
    }
  };

  // Handle closing the detailed view
  const handleCloseDetails = () => {
    setSelectedRecommendation(null);
  };

  // Handle providing feedback
  const handleProvideFeedback = async (recommendationId: string, isHelpful: boolean) => {
    try {
      // In a real app, you'd get the user ID from auth
      const userId = 'user123';
      const updatedRecommendation = await submitRecommendationFeedback(
        recommendationId,
        userId,
        isHelpful
      );
      
      if (updatedRecommendation) {
        // Update the recommendation in the list
        const updatedRecs = recommendations.map(rec => 
          rec.id === updatedRecommendation.id ? updatedRecommendation : rec
        );
        setRecommendations(updatedRecs);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // Handle feedback submission from detailed view
  const handleFeedbackSubmitted = (updatedRecommendation: Recommendation) => {
    // Update the recommendation in the list
    const updatedRecs = recommendations.map(rec => 
      rec.id === updatedRecommendation.id ? updatedRecommendation : rec
    );
    setRecommendations(updatedRecs);
    
    // Close the detailed view after feedback
    setSelectedRecommendation(null);
  };

  // Handle generating a new recommendation
  const handleGenerateRecommendation = async () => {
    setIsGeneratingNew(true);
    try {
      // In a real app, you'd get the user ID from auth
      const userId = 'user123';
      
      // Build the request using user profile info
      const request = await buildRecommendationRequest(userId, true, true);
      
      // Generate the recommendation
      const newRecommendation = await generateRecommendation(request);
      
      // Add it to the list
      setRecommendations([newRecommendation, ...recommendations]);
      
      // Show the new recommendation
      setSelectedRecommendation(newRecommendation);
    } catch (error) {
      console.error('Error generating recommendation:', error);
    } finally {
      setIsGeneratingNew(false);
    }
  };

  // Handle changing the sort order
  const handleSortChange = (sortBy: 'newest' | 'priority' | 'expiring-soon') => {
    setFilterOptions({ ...filterOptions, sortBy });
  };

  // Handle changing the type filter
  const handleTypeFilterChange = (type: RecommendationType | 'all') => {
    setActiveTypeFilter(type);
  };

  // Get count of recommendations by type for filter badges
  const getTypeCount = (type: RecommendationType | 'all'): number => {
    if (type === 'all') {
      return recommendations.length;
    }
    return recommendations.filter(rec => rec.category === type).length;
  };

  return (
    <div>
      {/* If a recommendation is selected, show detailed view */}
      {selectedRecommendation ? (
        <RecommendationView
          recommendation={selectedRecommendation}
          onClose={handleCloseDetails}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      ) : (
        <>
          {/* Filter/Sort Controls */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)',
              padding: '1rem',
              marginBottom: '1rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}
            >
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: colors.gray[800],
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    marginRight: '0.5rem',
                    color: colors.blue[500]
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
                  </svg>
                </span>
                AI Recommendations
              </h3>
              <button
                onClick={handleGenerateRecommendation}
                disabled={isGeneratingNew}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: colors.blue[500],
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: isGeneratingNew ? 'not-allowed' : 'pointer',
                  opacity: isGeneratingNew ? 0.7 : 1
                }}
              >
                {isGeneratingNew ? (
                  <>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTopColor: 'white',
                        animation: 'spin 1s linear infinite',
                        marginRight: '0.5rem'
                      }}
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                    Get New Recommendation
                  </>
                )}
              </button>
            </div>
            
            {/* Type Filters */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}
            >
              <button
                onClick={() => handleTypeFilterChange('all')}
                style={{
                  background: activeTypeFilter === 'all' ? colors.blue[50] : 'white',
                  border: '1px solid',
                  borderColor: activeTypeFilter === 'all' ? colors.blue[300] : colors.gray[300],
                  color: activeTypeFilter === 'all' ? colors.blue[700] : colors.gray[700],
                  borderRadius: '1rem',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                All
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: activeTypeFilter === 'all' ? colors.blue[700] : colors.gray[300],
                    color: 'white',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    fontSize: '0.65rem',
                    marginLeft: '0.5rem'
                  }}
                >
                  {getTypeCount('all')}
                </span>
              </button>
              <button
                onClick={() => handleTypeFilterChange('seasonal')}
                style={{
                  background: activeTypeFilter === 'seasonal' ? colors.green[50] : 'white',
                  border: '1px solid',
                  borderColor: activeTypeFilter === 'seasonal' ? colors.green[300] : colors.gray[300],
                  color: activeTypeFilter === 'seasonal' ? colors.green[700] : colors.gray[700],
                  borderRadius: '1rem',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Seasonal
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: activeTypeFilter === 'seasonal' ? colors.green[700] : colors.gray[300],
                    color: 'white',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    fontSize: '0.65rem',
                    marginLeft: '0.5rem'
                  }}
                >
                  {getTypeCount('seasonal')}
                </span>
              </button>
              <button
                onClick={() => handleTypeFilterChange('problem-solving')}
                style={{
                  background: activeTypeFilter === 'problem-solving' ? colors.status.error : 'white',
                  border: '1px solid',
                  borderColor: activeTypeFilter === 'problem-solving' ? colors.status.error : colors.gray[300],
                  color: activeTypeFilter === 'problem-solving' ? 'white' : colors.gray[700],
                  borderRadius: '1rem',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Problems
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: activeTypeFilter === 'problem-solving' ? 'white' : colors.gray[300],
                    color: activeTypeFilter === 'problem-solving' ? colors.status.error : 'white',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    fontSize: '0.65rem',
                    marginLeft: '0.5rem'
                  }}
                >
                  {getTypeCount('problem-solving')}
                </span>
              </button>
              <button
                onClick={() => handleTypeFilterChange('maintenance')}
                style={{
                  background: activeTypeFilter === 'maintenance' ? colors.brown[50] : 'white',
                  border: '1px solid',
                  borderColor: activeTypeFilter === 'maintenance' ? colors.brown[300] : colors.gray[300],
                  color: activeTypeFilter === 'maintenance' ? colors.brown[700] : colors.gray[700],
                  borderRadius: '1rem',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Maintenance
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: activeTypeFilter === 'maintenance' ? colors.brown[700] : colors.gray[300],
                    color: 'white',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    fontSize: '0.65rem',
                    marginLeft: '0.5rem'
                  }}
                >
                  {getTypeCount('maintenance')}
                </span>
              </button>
            </div>
            
            {/* Sort Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderTop: '1px solid',
                borderTopColor: colors.gray[100],
                paddingTop: '0.75rem'
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  color: colors.gray[600],
                  marginRight: '0.75rem'
                }}
              >
                Sort by:
              </span>
              <button
                onClick={() => handleSortChange('priority')}
                style={{
                  background: filterOptions.sortBy === 'priority' ? colors.blue[50] : 'white',
                  border: '1px solid',
                  borderColor: filterOptions.sortBy === 'priority' ? colors.blue[300] : colors.gray[300],
                  color: filterOptions.sortBy === 'priority' ? colors.blue[700] : colors.gray[700],
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  marginRight: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Priority
              </button>
              <button
                onClick={() => handleSortChange('newest')}
                style={{
                  background: filterOptions.sortBy === 'newest' ? colors.blue[50] : 'white',
                  border: '1px solid',
                  borderColor: filterOptions.sortBy === 'newest' ? colors.blue[300] : colors.gray[300],
                  color: filterOptions.sortBy === 'newest' ? colors.blue[700] : colors.gray[700],
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  marginRight: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Newest
              </button>
              <button
                onClick={() => handleSortChange('expiring-soon')}
                style={{
                  background: filterOptions.sortBy === 'expiring-soon' ? colors.blue[50] : 'white',
                  border: '1px solid',
                  borderColor: filterOptions.sortBy === 'expiring-soon' ? colors.blue[300] : colors.gray[300],
                  color: filterOptions.sortBy === 'expiring-soon' ? colors.blue[700] : colors.gray[700],
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Expiring Soon
              </button>
            </div>
          </div>

          {/* Recommendations List */}
          {isLoading ? (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)',
                padding: '2rem',
                textAlign: 'center',
                color: colors.gray[500]
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '50%',
                  borderTopColor: colors.blue[500],
                  animation: 'spin 1s linear infinite',
                  marginBottom: '1rem'
                }}
              />
              <p style={{ margin: 0 }}>Loading recommendations...</p>
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)',
                padding: '2rem',
                textAlign: 'center',
                color: colors.gray[600]
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 1rem',
                  color: colors.gray[400]
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
                </svg>
              </div>
              <h4 style={{ margin: '0 0 0.5rem', color: colors.gray[700] }}>
                No recommendations found
              </h4>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
                {activeTypeFilter !== 'all' 
                  ? `No ${activeTypeFilter} recommendations available.` 
                  : 'Get personalized advice for your lawn care.'}
              </p>
              <button
                onClick={handleGenerateRecommendation}
                disabled={isGeneratingNew}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: colors.blue[500],
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: isGeneratingNew ? 'not-allowed' : 'pointer',
                  opacity: isGeneratingNew ? 0.7 : 1
                }}
              >
                {isGeneratingNew ? (
                  <>Generating...</>
                ) : (
                  <>
                    <svg style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                    Get New Recommendation
                  </>
                )}
              </button>
            </div>
          ) : (
            <div>
              {filteredRecommendations.map(recommendation => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onViewDetails={handleViewDetails}
                  onProvideFeedback={handleProvideFeedback}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Add a style tag for the loading spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default RecommendationList;