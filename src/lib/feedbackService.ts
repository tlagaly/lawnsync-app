import { v4 as uuidv4 } from 'uuid';
import type { UserFeedback, SatisfactionSurvey } from '../types/analytics';
import { trackEvent } from './analyticsService';

// Mock implementation toggle
const USE_MOCK_FEEDBACK = true;

// In-memory storage for mock feedback
let mockFeedbackItems: UserFeedback[] = [];
let mockSurveys: SatisfactionSurvey[] = [];

// Collection names for Firestore
const COLLECTIONS = {
  FEEDBACK: 'user_feedback',
  SURVEYS: 'satisfaction_surveys'
};

/**
 * Submit user feedback
 */
export const submitFeedback = async (
  userId: string,
  feedbackType: UserFeedback['feedbackType'],
  rating?: number,
  comment?: string,
  metadata?: Record<string, any>
): Promise<UserFeedback | null> => {
  try {
    const timestamp = new Date().toISOString();
    
    // Create feedback object
    const feedback: UserFeedback = {
      id: uuidv4(),
      userId,
      feedbackType,
      rating,
      comment,
      submittedAt: timestamp,
      ...metadata
    };

    if (USE_MOCK_FEEDBACK) {
      console.log('Using mock feedback submission');
      mockFeedbackItems.push(feedback);
      console.log('Feedback submitted:', feedback);
      
      // Track the event in analytics
      trackEvent('feedback_submitted', {
        feedbackType,
        rating,
        hasFeedback: !!comment
      });
      
      return feedback;
    }

    // TODO: Implement Firestore version when ready
    // For now, just return the mock version

    return feedback;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return null;
  }
};

/**
 * Submit a satisfaction survey
 */
export const submitSatisfactionSurvey = async (
  survey: Omit<SatisfactionSurvey, 'id' | 'submittedAt'>
): Promise<SatisfactionSurvey | null> => {
  try {
    const submittedAt = new Date().toISOString();
    
    // Create survey object
    const newSurvey: SatisfactionSurvey = {
      id: uuidv4(),
      submittedAt,
      ...survey
    };

    if (USE_MOCK_FEEDBACK) {
      console.log('Using mock survey submission');
      mockSurveys.push(newSurvey);
      console.log('Survey submitted:', newSurvey);
      
      // Track the event in analytics
      trackEvent('survey_completed', {
        overallSatisfaction: newSurvey.overallSatisfaction,
        wouldRecommend: newSurvey.wouldRecommend,
        improvedLawn: newSurvey.improvedLawn
      });
      
      return newSurvey;
    }

    // TODO: Implement Firestore version when ready
    // For now, just return the mock version

    return newSurvey;
  } catch (error) {
    console.error('Error submitting survey:', error);
    return null;
  }
};

/**
 * Get all feedback for a user
 */
export const getUserFeedback = async (userId: string): Promise<UserFeedback[]> => {
  if (USE_MOCK_FEEDBACK) {
    return mockFeedbackItems.filter(feedback => feedback.userId === userId);
  }
  
  // TODO: Implement Firestore version when ready
  return [];
};

/**
 * Get all feedback for all users (admin function)
 */
export const getAllFeedback = async (): Promise<UserFeedback[]> => {
  if (USE_MOCK_FEEDBACK) {
    return [...mockFeedbackItems];
  }
  
  // TODO: Implement Firestore version when ready
  return [];
};

/**
 * Get all surveys
 */
export const getAllSurveys = async (): Promise<SatisfactionSurvey[]> => {
  if (USE_MOCK_FEEDBACK) {
    return [...mockSurveys];
  }
  
  // TODO: Implement Firestore version when ready
  return [];
};

/**
 * Get survey for a specific user
 */
export const getUserSurvey = async (userId: string): Promise<SatisfactionSurvey | null> => {
  if (USE_MOCK_FEEDBACK) {
    // Get the most recent survey
    const userSurveys = mockSurveys.filter(survey => survey.userId === userId);
    if (userSurveys.length === 0) {
      return null;
    }
    
    return userSurveys.sort((a, b) => {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    })[0];
  }
  
  // TODO: Implement Firestore version when ready
  return null;
};

/**
 * Should show survey to user based on usage
 * This will be called to determine if it's time to show the survey
 */
export const shouldShowSurvey = async (userId: string): Promise<boolean> => {
  const userSurvey = await getUserSurvey(userId);
  
  // If user already completed a survey in the last 30 days, don't show
  if (userSurvey) {
    const surveyDate = new Date(userSurvey.submittedAt);
    const now = new Date();
    const daysSinceSurvey = Math.floor((now.getTime() - surveyDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceSurvey < 30) {
      return false;
    }
  }
  
  // TODO: Add additional logic for when to show survey
  // For example, show after 2 weeks of usage or after certain number of sessions
  
  return true;
};

/**
 * Resolve a feedback item (mark as resolved)
 */
export const resolveFeedback = async (feedbackId: string, response?: string): Promise<boolean> => {
  try {
    if (USE_MOCK_FEEDBACK) {
      const index = mockFeedbackItems.findIndex(item => item.id === feedbackId);
      if (index === -1) {
        return false;
      }
      
      mockFeedbackItems[index] = {
        ...mockFeedbackItems[index],
        isResolved: true,
        adminResponse: response
      };
      
      return true;
    }
    
    // TODO: Implement Firestore version when ready
    return false;
  } catch (error) {
    console.error('Error resolving feedback:', error);
    return false;
  }
};

/**
 * Clear all feedback data (for testing)
 */
export const clearFeedbackData = (): void => {
  if (!USE_MOCK_FEEDBACK) {
    console.warn('This function is only available in mock feedback mode');
    return;
  }
  
  mockFeedbackItems = [];
  mockSurveys = [];
};

/**
 * Get feedback statistics
 */
export const getFeedbackStats = (): Record<string, any> => {
  if (!USE_MOCK_FEEDBACK) {
    console.warn('This function is only available in mock feedback mode');
    return {};
  }
  
  // Calculate average ratings by type
  const typeRatings: Record<string, { sum: number; count: number }> = {};
  
  mockFeedbackItems.forEach(item => {
    if (item.rating) {
      if (!typeRatings[item.feedbackType]) {
        typeRatings[item.feedbackType] = { sum: 0, count: 0 };
      }
      
      typeRatings[item.feedbackType].sum += item.rating;
      typeRatings[item.feedbackType].count++;
    }
  });
  
  const averageRatings: Record<string, number> = {};
  Object.entries(typeRatings).forEach(([type, data]) => {
    averageRatings[type] = data.sum / data.count;
  });
  
  // Calculate overall survey statistics
  const surveyStats = {
    totalSurveys: mockSurveys.length,
    averageSatisfaction: 0,
    recommendRate: 0,
    improvementRate: 0
  };
  
  if (mockSurveys.length > 0) {
    const satisfactionSum = mockSurveys.reduce((sum, survey) => sum + survey.overallSatisfaction, 0);
    surveyStats.averageSatisfaction = satisfactionSum / mockSurveys.length;
    
    const recommendCount = mockSurveys.filter(survey => survey.wouldRecommend).length;
    surveyStats.recommendRate = (recommendCount / mockSurveys.length) * 100;
    
    const improvementCount = mockSurveys.filter(survey => survey.improvedLawn).length;
    surveyStats.improvementRate = (improvementCount / mockSurveys.length) * 100;
  }
  
  return {
    totalFeedback: mockFeedbackItems.length,
    resolvedFeedback: mockFeedbackItems.filter(item => item.isResolved).length,
    averageRatings,
    feedbackByType: Object.fromEntries(
      Object.entries(
        mockFeedbackItems.reduce((acc, item) => {
          acc[item.feedbackType] = (acc[item.feedbackType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      )
    ),
    surveyStats
  };
};