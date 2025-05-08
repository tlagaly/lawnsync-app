import React, { useState } from 'react';
import { Box, Button, Flex, Text, Textarea } from '@chakra-ui/react';
import type { Recommendation } from '../../../types/recommendation';
import { submitFeedback } from '../../../lib/feedbackService';
import { trackEvent } from '../../../lib/analyticsService';

interface RecommendationFeedbackProps {
  recommendation: Recommendation;
  userId: string;
  onFeedbackSubmitted?: (recommendation: Recommendation) => void;
}

/**
 * Component for collecting user feedback on recommendations
 */
const RecommendationFeedback: React.FC<RecommendationFeedbackProps> = ({
  recommendation,
  userId,
  onFeedbackSubmitted
}) => {
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // If feedback already exists, show it
  if (recommendation.feedback) {
    return (
      <Box 
        p={2} 
        borderRadius="md" 
        bg="gray.50" 
        border="1px solid" 
        borderColor="gray.200"
      >
        <Flex align="center" justify="space-between">
          <Text fontSize="sm" color="gray.600">
            You rated this recommendation as{' '}
            <Text as="span" fontWeight="bold" color={recommendation.feedback.isHelpful ? 'green.500' : 'red.500'}>
              {recommendation.feedback.isHelpful ? 'helpful' : 'not helpful'}
            </Text>
          </Text>
          <Box color={recommendation.feedback.isHelpful ? 'green.500' : 'red.500'}>
            {recommendation.feedback.isHelpful ? '👍' : '👎'}
          </Box>
        </Flex>
        {recommendation.feedback.comment && (
          <Text fontSize="sm" mt={2} color="gray.700">
            "{recommendation.feedback.comment}"
          </Text>
        )}
      </Box>
    );
  }

  // Handle initial feedback selection
  const handleFeedbackClick = (helpful: boolean) => {
    setIsHelpful(helpful);
    setShowCommentBox(true);
  };

  // Handle comment submission
  const handleSubmit = async () => {
    if (isHelpful === null) return;
    
    setIsSubmitting(true);
    
    try {
      // Create metadata with reference to the recommendation
      const metadata = {
        recommendationId: recommendation.id,
        category: recommendation.category,
        source: recommendation.source
      };
      
      // Submit feedback through the feedback service
      await submitFeedback(
        userId,
        'recommendation',
        isHelpful ? 5 : 1, // Convert boolean to a rating (5 = helpful, 1 = not helpful)
        comment,
        metadata
      );
      
      // Track analytics event
      trackEvent('recommendation_feedback', {
        recommendationId: recommendation.id,
        isHelpful,
        hasComment: comment.length > 0,
        category: recommendation.category
      });
      
      // Update recommendation with feedback locally
      const updatedRecommendation: Recommendation = {
        ...recommendation,
        feedback: {
          isHelpful,
          comment,
          submittedAt: new Date().toISOString()
        }
      };
      
      // Call the callback if provided
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(updatedRecommendation);
      }
      
      // Show success message (without toast)
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If feedback has been submitted in this session, show a thank you message
  if (isSubmitted) {
    return (
      <Box p={2} borderRadius="md" bg="green.50" border="1px solid" borderColor="green.200">
        <Text fontSize="sm" color="green.600">
          Thank you for your feedback! It helps us improve our recommendations.
        </Text>
      </Box>
    );
  }

  return (
    <Box mt={4}>
      {!showCommentBox ? (
        <Flex direction="column" align="center">
          <Text mb={2} fontSize="sm" fontWeight="medium">
            Was this recommendation helpful?
          </Text>
          <Flex>
            <Button
              size="sm"
              colorScheme="green"
              variant="outline"
              mr={2}
              onClick={() => handleFeedbackClick(true)}
            >
              👍 Yes
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={() => handleFeedbackClick(false)}
            >
              👎 No
            </Button>
          </Flex>
        </Flex>
      ) : (
        <Box>
          <Flex align="center" mb={2}>
            <Box color={isHelpful ? 'green.500' : 'red.500'} mr={2}>
              {isHelpful ? '👍' : '👎'}
            </Box>
            <Text fontSize="sm" fontWeight="medium">
              You rated this recommendation as {isHelpful ? 'helpful' : 'not helpful'}
            </Text>
          </Flex>
          
          <Textarea
            placeholder={
              isHelpful
                ? "What did you find most helpful about this recommendation?"
                : "How could we improve this recommendation?"
            }
            size="sm"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            mb={2}
          />
          
          <Flex justify="space-between">
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {
                setShowCommentBox(false);
                setIsHelpful(null);
              }}
            >
              Cancel
            </Button>
            
            <Button
              size="sm"
              colorScheme="blue"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default RecommendationFeedback;