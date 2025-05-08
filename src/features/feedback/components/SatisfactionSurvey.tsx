import React, { useState } from 'react';
import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { submitSatisfactionSurvey } from '../../../lib/feedbackService';
import { trackEvent } from '../../../lib/analyticsService';
import type { SatisfactionSurvey as SatisfactionSurveyType } from '../../../types/analytics';

interface SatisfactionSurveyProps {
  userId: string;
  onComplete?: () => void;
  onDismiss?: () => void;
}

const SatisfactionSurvey: React.FC<SatisfactionSurveyProps> = ({
  userId,
  onComplete,
  onDismiss
}) => {
  // Survey state
  const [step, setStep] = useState(1);
  const [overallSatisfaction, setOverallSatisfaction] = useState<number>(3);
  const [easeOfUse, setEaseOfUse] = useState<number>(3);
  const [featureCompleteness, setFeatureCompleteness] = useState<number>(3);
  const [recommendationQuality, setRecommendationQuality] = useState<number>(3);
  const [taskSchedulingQuality, setTaskSchedulingQuality] = useState<number>(3);
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(false);
  const [improvedLawn, setImprovedLawn] = useState<boolean>(false);
  const [mostUsedFeatures, setMostUsedFeatures] = useState<string[]>([]);
  const [leastUsedFeatures, setLeastUsedFeatures] = useState<string[]>([]);
  const [desiredFeatures, setDesiredFeatures] = useState('');
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [improvementAreas, setImprovementAreas] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Available features for selection
  const features = [
    'Task Scheduling',
    'Weather Forecast',
    'Recommendations',
    'Photo Gallery',
    'Plant Identification',
    'Watering Schedule',
    'Offline Mode'
  ];

  // Improvement areas
  const improvementAreaOptions = [
    'Weed Reduction',
    'Grass Thickness',
    'Color/Health',
    'Bare Patch Repair',
    'Overall Appearance'
  ];

  // Handle feature checkbox change
  const handleMostUsedChange = (feature: string) => {
    if (mostUsedFeatures.includes(feature)) {
      setMostUsedFeatures(mostUsedFeatures.filter(f => f !== feature));
    } else {
      setMostUsedFeatures([...mostUsedFeatures, feature]);
    }
  };

  // Handle least used feature checkbox change
  const handleLeastUsedChange = (feature: string) => {
    if (leastUsedFeatures.includes(feature)) {
      setLeastUsedFeatures(leastUsedFeatures.filter(f => f !== feature));
    } else {
      setLeastUsedFeatures([...leastUsedFeatures, feature]);
    }
  };

  // Handle improvement area checkbox change
  const handleImprovementAreaChange = (area: string) => {
    if (improvementAreas.includes(area)) {
      setImprovementAreas(improvementAreas.filter(a => a !== area));
    } else {
      setImprovementAreas([...improvementAreas, area]);
    }
  };

  // Handle next step
  const handleNext = () => {
    setStep(step + 1);
  };

  // Handle previous step
  const handlePrevious = () => {
    setStep(step - 1);
  };

  // Handle survey submission
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create survey object
      const survey: Omit<SatisfactionSurveyType, 'id' | 'submittedAt'> = {
        userId,
        overallSatisfaction,
        easeOfUse,
        featureCompleteness,
        recommendationQuality,
        taskSchedulingQuality,
        wouldRecommend,
        improvedLawn,
        mostUsedFeatures,
        leastUsedFeatures,
        desiredFeatures,
        generalFeedback,
        improvementAreas
      };

      // Submit survey
      await submitSatisfactionSurvey(survey);

      // Track analytics event
      trackEvent('survey_completed', {
        overallSatisfaction,
        wouldRecommend,
        improvedLawn
      });

      setIsSubmitted(true);
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('There was an error submitting your survey. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rating option component
  const RatingOptions = ({ 
    value, 
    onChange,
    labels = ['1 - Poor', '2', '3', '4', '5 - Excellent']
  }: {
    value: number,
    onChange: (val: number) => void,
    labels?: string[]
  }) => (
    <Flex justifyContent="space-between" w="100%" mb={2}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <Box key={rating} textAlign="center">
          <Box 
            as="button"
            onClick={() => onChange(rating)}
            bg={value === rating ? 'blue.500' : 'gray.100'}
            color={value === rating ? 'white' : 'black'}
            borderRadius="full"
            w="36px"
            h="36px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={1}
          >
            {rating}
          </Box>
          <Text fontSize="xs">{labels[rating - 1]}</Text>
        </Box>
      ))}
    </Flex>
  );

  // If survey has been submitted, show thank you message
  if (isSubmitted) {
    return (
      <Box 
        p={6} 
        borderRadius="lg" 
        bg="white" 
        boxShadow="xl"
        maxW="600px"
        mx="auto"
      >
        <Heading size="md" textAlign="center" mb={4} color="green.600">
          Thank You for Your Feedback!
        </Heading>
        <Text textAlign="center" mb={6}>
          Your feedback is invaluable in helping us improve LawnSync for everyone.
        </Text>
        <Button 
          colorScheme="green" 
          size="md" 
          mx="auto" 
          display="block"
          onClick={onDismiss}
        >
          Close
        </Button>
      </Box>
    );
  }

  return (
    <Box 
      p={6} 
      borderRadius="lg" 
      bg="white" 
      boxShadow="xl"
      maxW="600px"
      mx="auto"
    >
      <Heading size="md" mb={6} textAlign="center">
        Help Us Improve LawnSync
      </Heading>

      {/* Step 1: Overall Ratings */}
      {step === 1 && (
        <Box>
          <Text mb={4}>
            Please rate your experience with LawnSync:
          </Text>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Overall Satisfaction</Text>
            <RatingOptions 
              value={overallSatisfaction} 
              onChange={setOverallSatisfaction} 
            />
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Ease of Use</Text>
            <RatingOptions 
              value={easeOfUse} 
              onChange={setEaseOfUse} 
              labels={['1 - Difficult', '2', '3', '4', '5 - Very Easy']}
            />
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Feature Completeness</Text>
            <RatingOptions 
              value={featureCompleteness} 
              onChange={setFeatureCompleteness} 
              labels={['1 - Missing Features', '2', '3', '4', '5 - Complete']}
            />
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Recommendation Quality</Text>
            <RatingOptions 
              value={recommendationQuality} 
              onChange={setRecommendationQuality} 
              labels={['1 - Not Helpful', '2', '3', '4', '5 - Very Helpful']}
            />
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Task Scheduling Quality</Text>
            <RatingOptions 
              value={taskSchedulingQuality} 
              onChange={setTaskSchedulingQuality}
              labels={['1 - Not Helpful', '2', '3', '4', '5 - Very Helpful']}
            />
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Would you recommend LawnSync to others?</Text>
            <Flex>
              <Box 
                as="button"
                onClick={() => setWouldRecommend(true)}
                bg={wouldRecommend ? 'green.500' : 'gray.100'}
                color={wouldRecommend ? 'white' : 'black'}
                borderRadius="md"
                px={4}
                py={2}
                mr={2}
              >
                Yes
              </Box>
              <Box 
                as="button"
                onClick={() => setWouldRecommend(false)}
                bg={!wouldRecommend ? 'red.500' : 'gray.100'}
                color={!wouldRecommend ? 'white' : 'black'}
                borderRadius="md"
                px={4}
                py={2}
              >
                No
              </Box>
            </Flex>
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Has LawnSync helped improve your lawn?</Text>
            <Flex>
              <Box 
                as="button"
                onClick={() => setImprovedLawn(true)}
                bg={improvedLawn ? 'green.500' : 'gray.100'}
                color={improvedLawn ? 'white' : 'black'}
                borderRadius="md"
                px={4}
                py={2}
                mr={2}
              >
                Yes
              </Box>
              <Box 
                as="button"
                onClick={() => setImprovedLawn(false)}
                bg={!improvedLawn ? 'red.500' : 'gray.100'}
                color={!improvedLawn ? 'white' : 'black'}
                borderRadius="md"
                px={4}
                py={2}
              >
                No
              </Box>
            </Flex>
          </Box>

          <Flex justify="space-between" mt={8}>
            <Button variant="outline" onClick={onDismiss}>
              Skip
            </Button>
            <Button colorScheme="blue" onClick={handleNext}>
              Next
            </Button>
          </Flex>
        </Box>
      )}

      {/* Step 2: Feature Usage */}
      {step === 2 && (
        <Box>
          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Which features do you use most frequently?</Text>
            {features.map(feature => (
              <Box key={`most-${feature}`} mb={2}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={mostUsedFeatures.includes(feature)}
                    onChange={() => handleMostUsedChange(feature)}
                    style={{ marginRight: '8px' }}
                  />
                  {feature}
                </label>
              </Box>
            ))}
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Which features do you rarely or never use?</Text>
            {features.map(feature => (
              <Box key={`least-${feature}`} mb={2}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={leastUsedFeatures.includes(feature)}
                    onChange={() => handleLeastUsedChange(feature)}
                    style={{ marginRight: '8px' }}
                  />
                  {feature}
                </label>
              </Box>
            ))}
          </Box>

          {improvedLawn && (
            <Box mb={4}>
              <Text fontWeight="bold" mb={2}>In which areas have you seen improvements?</Text>
              {improvementAreaOptions.map(area => (
                <Box key={area} mb={2}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={improvementAreas.includes(area)}
                      onChange={() => handleImprovementAreaChange(area)}
                      style={{ marginRight: '8px' }}
                    />
                    {area}
                  </label>
                </Box>
              ))}
            </Box>
          )}

          <Flex justify="space-between" mt={8}>
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
            <Button colorScheme="blue" onClick={handleNext}>
              Next
            </Button>
          </Flex>
        </Box>
      )}

      {/* Step 3: Open Feedback */}
      {step === 3 && (
        <Box>
          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>What features would you like to see added or improved?</Text>
            <textarea
              value={desiredFeatures}
              onChange={(e) => setDesiredFeatures(e.target.value)}
              placeholder="Tell us about features you'd like to see..."
              rows={4}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}
            />
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Any other feedback or suggestions?</Text>
            <textarea
              value={generalFeedback}
              onChange={(e) => setGeneralFeedback(e.target.value)}
              placeholder="Share your overall thoughts about LawnSync..."
              rows={4}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}
            />
          </Box>

          <Flex justify="space-between" mt={8}>
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
            <Button 
              colorScheme="green" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Survey'}
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default SatisfactionSurvey;