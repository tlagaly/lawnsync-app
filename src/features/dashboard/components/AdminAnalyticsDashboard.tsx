import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Grid, Heading, Text } from '@chakra-ui/react';
import { getApiUsageMetrics, getTrackedEvents, getFeatureUsageMetrics } from '../../../lib/analyticsService';
import { getFeedbackStats, getAllFeedback, getAllSurveys } from '../../../lib/feedbackService';
import { getAllABTests, getTestResults } from '../../../lib/abTestingService';
import type { UserFeedback, FeatureUsage, SatisfactionSurvey, ABTest } from '../../../types/analytics';

interface AdminAnalyticsDashboardProps {
  userId: string;
  isAdmin: boolean;
}

// Section type for dashboard navigation
type DashboardSection = 'overview' | 'events' | 'features' | 'feedback' | 'surveys' | 'abtests';

const AdminAnalyticsDashboard: React.FC<AdminAnalyticsDashboardProps> = ({ userId, isAdmin }) => {
  // State for analytics data
  const [eventData, setEventData] = useState<any[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [apiMetrics, setApiMetrics] = useState<any>(null);
  
  // State for feedback data
  const [feedbackItems, setFeedbackItems] = useState<UserFeedback[]>([]);
  const [surveys, setSurveys] = useState<SatisfactionSurvey[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<any>(null);
  
  // State for A/B test data
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [selectedTestResults, setSelectedTestResults] = useState<any>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');

  // Fetch data on component mount
  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch analytics data
        const events = getTrackedEvents();
        const usage = getFeatureUsageMetrics();
        const metrics = getApiUsageMetrics();
        
        setEventData(events);
        setFeatureUsage(usage);
        setApiMetrics(metrics);
        
        // Fetch feedback data
        const feedback = await getAllFeedback();
        const surveyData = await getAllSurveys();
        const stats = getFeedbackStats();
        
        setFeedbackItems(feedback);
        setSurveys(surveyData);
        setFeedbackStats(stats);
        
        // Fetch A/B test data
        const tests = await getAllABTests();
        setAbTests(tests);
        
        if (tests.length > 0) {
          setSelectedTestId(tests[0].id);
          const results = await getTestResults(tests[0].id);
          setSelectedTestResults(results);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAdmin]);

  // Handle test selection
  const handleTestSelect = async (testId: string) => {
    setSelectedTestId(testId);
    try {
      const results = await getTestResults(testId);
      setSelectedTestResults(results);
    } catch (error) {
      console.error('Error fetching test results:', error);
    }
  };

  // If not admin, don't show the dashboard
  if (!isAdmin) {
    return (
      <Box p={4} textAlign="center">
        <Text>You don't have permission to view this page.</Text>
      </Box>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Text>Loading analytics data...</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>Admin Analytics Dashboard</Heading>
      
      {/* Navigation */}
      <Flex mb={6} overflowX="auto" pb={2}>
        <Button 
          mr={2} 
          colorScheme={activeSection === 'overview' ? 'blue' : 'gray'}
          onClick={() => setActiveSection('overview')}
        >
          Overview
        </Button>
        <Button 
          mr={2} 
          colorScheme={activeSection === 'events' ? 'blue' : 'gray'}
          onClick={() => setActiveSection('events')}
        >
          User Events
        </Button>
        <Button 
          mr={2} 
          colorScheme={activeSection === 'features' ? 'blue' : 'gray'}
          onClick={() => setActiveSection('features')}
        >
          Feature Usage
        </Button>
        <Button 
          mr={2} 
          colorScheme={activeSection === 'feedback' ? 'blue' : 'gray'}
          onClick={() => setActiveSection('feedback')}
        >
          User Feedback
        </Button>
        <Button 
          mr={2} 
          colorScheme={activeSection === 'surveys' ? 'blue' : 'gray'}
          onClick={() => setActiveSection('surveys')}
        >
          Surveys
        </Button>
        <Button 
          colorScheme={activeSection === 'abtests' ? 'blue' : 'gray'}
          onClick={() => setActiveSection('abtests')}
        >
          A/B Tests
        </Button>
      </Flex>
      
      {/* Dashboard Content */}
      <Box>
        {/* Overview Panel */}
        {activeSection === 'overview' && (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
              <Heading size="md" mb={4}>Analytics Summary</Heading>
              <Text><strong>Total Events:</strong> {eventData.length}</Text>
              <Text><strong>Total API Calls:</strong> {apiMetrics?.totalCalls || 0}</Text>
              <Text><strong>Features Tracked:</strong> {featureUsage.length}</Text>
              <Text><strong>Most Used Feature:</strong> {
                featureUsage.length > 0 
                  ? featureUsage.sort((a, b) => b.usageCount - a.usageCount)[0]?.featureName 
                  : 'None'
              }</Text>
            </Box>
            
            <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
              <Heading size="md" mb={4}>Feedback Summary</Heading>
              <Text><strong>Total Feedback:</strong> {feedbackItems.length}</Text>
              <Text><strong>Surveys Completed:</strong> {surveys.length}</Text>
              <Text><strong>Average Satisfaction:</strong> {
                surveys.length > 0 
                  ? (surveys.reduce((sum, survey) => sum + survey.overallSatisfaction, 0) / surveys.length).toFixed(1)
                  : 'N/A'
              }</Text>
              <Text><strong>Would Recommend:</strong> {
                surveys.length > 0 
                  ? `${Math.round((surveys.filter(s => s.wouldRecommend).length / surveys.length) * 100)}%`
                  : 'N/A'
              }</Text>
            </Box>
            
            <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
              <Heading size="md" mb={4}>A/B Test Summary</Heading>
              <Text><strong>Active Tests:</strong> {abTests.filter(t => t.isActive).length}</Text>
              <Text><strong>Completed Tests:</strong> {abTests.filter(t => !t.isActive).length}</Text>
              <Text><strong>Total Tests:</strong> {abTests.length}</Text>
            </Box>
          </Grid>
        )}
        
        {/* User Events Panel */}
        {activeSection === 'events' && (
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" overflowX="auto">
            <Heading size="md" mb={4}>Recent Events</Heading>
            {eventData.length === 0 ? (
              <Text>No events recorded yet.</Text>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #E2E8F0' }}>Event Type</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #E2E8F0' }}>Timestamp</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #E2E8F0' }}>User ID</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #E2E8F0' }}>Properties</th>
                  </tr>
                </thead>
                <tbody>
                  {eventData.slice(0, 10).map((event, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #E2E8F0' }}>{event.eventType}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #E2E8F0' }}>{new Date(event.timestamp).toLocaleString()}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #E2E8F0' }}>{event.userId}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #E2E8F0' }}>
                        {Object.keys(event.properties || {}).length > 0 
                          ? JSON.stringify(event.properties)
                          : 'None'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Box>
        )}
        
        {/* Feature Usage Panel */}
        {activeSection === 'features' && (
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
            <Heading size="md" mb={4}>Feature Usage</Heading>
            {featureUsage.length === 0 ? (
              <Text>No feature usage data recorded yet.</Text>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #E2E8F0' }}>Feature</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #E2E8F0' }}>Usage Count</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #E2E8F0' }}>Last Used</th>
                  </tr>
                </thead>
                <tbody>
                  {featureUsage.sort((a, b) => b.usageCount - a.usageCount).map((feature, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #E2E8F0' }}>{feature.featureName}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #E2E8F0' }}>{feature.usageCount}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #E2E8F0' }}>{new Date(feature.lastUsed).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Box>
        )}
        
        {/* User Feedback Panel */}
        {activeSection === 'feedback' && (
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
            <Heading size="md" mb={4}>User Feedback</Heading>
            {feedbackItems.length === 0 ? (
              <Text>No feedback recorded yet.</Text>
            ) : (
              <Box>
                {feedbackItems.slice(0, 10).map((feedback, index) => (
                  <Box 
                    key={index} 
                    p={3} 
                    mb={3} 
                    borderWidth="1px" 
                    borderRadius="md"
                    borderLeftWidth="4px"
                    borderLeftColor={feedback.rating && feedback.rating >= 4 ? "green.400" : "red.400"}
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontWeight="bold">
                        {feedback.feedbackType.charAt(0).toUpperCase() + feedback.feedbackType.slice(1)} Feedback
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(feedback.submittedAt).toLocaleString()}
                      </Text>
                    </Flex>
                    {feedback.rating && (
                      <Text mb={1}>Rating: {feedback.rating}/5</Text>
                    )}
                    {feedback.comment && (
                      <Text fontStyle="italic">"{feedback.comment}"</Text>
                    )}
                    <Flex mt={2}>
                      <Text fontSize="sm" color="gray.500">User: {feedback.userId}</Text>
                      {feedback.isResolved && (
                        <Text fontSize="sm" color="green.500" ml={2}>Resolved</Text>
                      )}
                    </Flex>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
        
        {/* Surveys Panel */}
        {activeSection === 'surveys' && (
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
            <Heading size="md" mb={4}>User Satisfaction Surveys</Heading>
            {surveys.length === 0 ? (
              <Text>No surveys completed yet.</Text>
            ) : (
              <Box>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb={6}>
                  <Box p={3} borderWidth="1px" borderRadius="md">
                    <Heading size="sm" mb={2}>Average Ratings</Heading>
                    <Text>Overall Satisfaction: {(surveys.reduce((sum, s) => sum + s.overallSatisfaction, 0) / surveys.length).toFixed(1)}/5</Text>
                    <Text>Ease of Use: {(surveys.reduce((sum, s) => sum + s.easeOfUse, 0) / surveys.length).toFixed(1)}/5</Text>
                    <Text>Feature Completeness: {(surveys.reduce((sum, s) => sum + s.featureCompleteness, 0) / surveys.length).toFixed(1)}/5</Text>
                    <Text>Recommendation Quality: {(surveys.reduce((sum, s) => sum + s.recommendationQuality, 0) / surveys.length).toFixed(1)}/5</Text>
                    <Text>Task Scheduling: {(surveys.reduce((sum, s) => sum + s.taskSchedulingQuality, 0) / surveys.length).toFixed(1)}/5</Text>
                  </Box>
                  
                  <Box p={3} borderWidth="1px" borderRadius="md">
                    <Heading size="sm" mb={2}>Survey Metrics</Heading>
                    <Text>Total Surveys: {surveys.length}</Text>
                    <Text>Would Recommend: {Math.round((surveys.filter(s => s.wouldRecommend).length / surveys.length) * 100)}%</Text>
                    <Text>Improved Lawn: {Math.round((surveys.filter(s => s.improvedLawn).length / surveys.length) * 100)}%</Text>
                  </Box>
                </Grid>
                
                <Heading size="sm" mb={2}>Most Used Features</Heading>
                <Box mb={4}>
                  {(() => {
                    // Count feature frequencies across all surveys
                    const featureCounts: Record<string, number> = {};
                    surveys.forEach(survey => {
                      survey.mostUsedFeatures.forEach(feature => {
                        featureCounts[feature] = (featureCounts[feature] || 0) + 1;
                      });
                    });
                    
                    // Convert to array and sort
                    return Object.entries(featureCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([feature, count], index) => (
                        <Text key={index}>
                          {feature}: {count} ({Math.round((count / surveys.length) * 100)}%)
                        </Text>
                      ));
                  })()}
                </Box>
                
                <Heading size="sm" mb={2}>Least Used Features</Heading>
                <Box>
                  {(() => {
                    // Count feature frequencies across all surveys
                    const featureCounts: Record<string, number> = {};
                    surveys.forEach(survey => {
                      survey.leastUsedFeatures.forEach(feature => {
                        featureCounts[feature] = (featureCounts[feature] || 0) + 1;
                      });
                    });
                    
                    // Convert to array and sort
                    return Object.entries(featureCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([feature, count], index) => (
                        <Text key={index}>
                          {feature}: {count} ({Math.round((count / surveys.length) * 100)}%)
                        </Text>
                      ));
                  })()}
                </Box>
              </Box>
            )}
          </Box>
        )}
        
        {/* A/B Tests Panel */}
        {activeSection === 'abtests' && (
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
            <Heading size="md" mb={4}>A/B Tests</Heading>
            {abTests.length === 0 ? (
              <Text>No A/B tests configured yet.</Text>
            ) : (
              <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={6}>
                <Box>
                  <Heading size="sm" mb={3}>Test List</Heading>
                  {abTests.map(test => (
                    <Box 
                      key={test.id} 
                      p={3} 
                      mb={2} 
                      borderWidth="1px" 
                      borderRadius="md"
                      bg={selectedTestId === test.id ? "blue.50" : "white"}
                      cursor="pointer"
                      onClick={() => handleTestSelect(test.id)}
                    >
                      <Text fontWeight="bold">{test.name}</Text>
                      <Flex justify="space-between" mt={1}>
                        <Text fontSize="sm" color={test.isActive ? "green.500" : "gray.500"}>
                          {test.isActive ? "Active" : "Completed"}
                        </Text>
                        <Text fontSize="sm">
                          {test.variants.length} variants
                        </Text>
                      </Flex>
                    </Box>
                  ))}
                </Box>
                
                <Box>
                  {selectedTestResults ? (
                    <Box>
                      <Heading size="sm" mb={3}>{selectedTestResults.testName} Results</Heading>
                      <Text mb={2}>
                        <strong>Status:</strong> {selectedTestResults.isActive ? "Active" : "Completed"}
                      </Text>
                      <Text mb={3}>
                        <strong>Start Date:</strong> {new Date(selectedTestResults.startDate).toLocaleDateString()}
                        {selectedTestResults.endDate && ` - End Date: ${new Date(selectedTestResults.endDate).toLocaleDateString()}`}
                      </Text>
                      
                      <Box mt={4}>
                        <Heading size="xs" mb={2}>Variant Results</Heading>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #E2E8F0' }}>Variant</th>
                              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #E2E8F0' }}>Users</th>
                              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #E2E8F0' }}>Interactions</th>
                              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #E2E8F0' }}>Conversion</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.values(selectedTestResults.variants).map((variant: any, index: number) => (
                              <tr key={index}>
                                <td style={{ padding: '8px', borderBottom: '1px solid #E2E8F0' }}>
                                  {variant.name} {variant.isControl && "(Control)"}
                                </td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #E2E8F0' }}>{variant.userCount}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #E2E8F0' }}>{variant.interactionCount}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #E2E8F0' }}>{variant.conversionRate.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    </Box>
                  ) : (
                    <Text>Select a test to view results</Text>
                  )}
                </Box>
              </Grid>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminAnalyticsDashboard;