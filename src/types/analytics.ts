/**
 * Type definitions for the User Analytics & Feedback System
 */

// Analytics Event Types
export type AnalyticsEventType =
  | 'recommendation_viewed'
  | 'recommendation_applied'
  | 'task_completed'
  | 'task_scheduled'
  | 'photo_uploaded'
  | 'feature_used'
  | 'app_opened'
  | 'app_background'
  | 'plant_identified'
  | 'watering_scheduled'
  | 'issue_reported'
  | 'survey_completed'
  | 'feedback_submitted'
  | 'weather_checked'
  | 'offline_mode_entered'
  | 'offline_mode_exited'
  | 'test_assigned'
  | 'test_conversion'
  | 'test_variant_viewed'
  | 'recommendation_feedback';

/**
 * Interface for analytics events
 */
export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: AnalyticsEventType;
  timestamp: string;
  properties?: Record<string, any>;
  sessionId?: string;
  isOffline?: boolean;
}

/**
 * Interface for user feedback
 */
export interface UserFeedback {
  id: string;
  userId: string;
  feedbackType: 'general' | 'recommendation' | 'feature' | 'issue' | 'survey';
  rating?: number; // 1-5 rating
  comment?: string;
  submittedAt: string;
  featureId?: string; // ID of feature if feedback is for a specific feature
  recommendationId?: string; // ID of recommendation if feedback is for a specific recommendation
  isResolved?: boolean; // For issue reports
  adminResponse?: string; // Response from admin for issues or feedback
  category?: string; // Category of the feedback (UI, functionality, suggestions, etc.)
  source?: string; // Where the feedback was submitted from
  screenshot?: string; // Optional screenshot for issue reports
}

/**
 * Interface for lawn improvement metrics
 */
export interface LawnMetrics {
  id: string;
  userId: string;
  timestamp: string;
  lawnHealth: number; // 0-100 score
  weedCoverage?: number; // Percentage
  barePatches?: number; // Percentage
  color?: number; // 0-100 score
  thickness?: number; // 0-100 score
  moistureLevel?: number; // 0-100 score
  notes?: string;
  reportedBy: 'user' | 'system';
}

/**
 * Interface for feature usage metrics
 */
export interface FeatureUsage {
  id: string;
  userId: string;
  featureId: string;
  featureName: string;
  usageCount: number;
  lastUsed: string;
  averageDuration?: number; // In seconds
  completionRate?: number; // For multi-step features
}

/**
 * Interface for task completion metrics
 */
export interface TaskCompletionMetrics {
  id: string;
  userId: string;
  taskId: string;
  taskType: string;
  completedAt: string;
  scheduledFor?: string;
  delayDuration?: number; // Time between scheduled and actual completion
  weatherConditions?: string;
  difficulty?: number; // User-reported difficulty (1-5)
  satisfaction?: number; // User-reported satisfaction (1-5)
  notes?: string;
}

/**
 * Interface for system usage metrics
 */
export interface SystemUsageMetrics {
  totalUsers: number;
  activeUsers: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  completedTasks: number;
  recommendations: {
    total: number;
    applied: number;
    helpfulRating: number;
  };
  photosUploaded: number;
  offlineUsage: {
    sessions: number;
    averageDuration: number;
    syncConflicts: number;
  };
}

/**
 * Interface for user satisfaction survey
 */
export interface SatisfactionSurvey {
  id: string;
  userId: string;
  submittedAt: string;
  overallSatisfaction: number; // 1-5 rating
  easeOfUse: number; // 1-5 rating
  featureCompleteness: number; // 1-5 rating
  recommendationQuality: number; // 1-5 rating
  taskSchedulingQuality: number; // 1-5 rating
  wouldRecommend: boolean;
  mostUsedFeatures: string[];
  leastUsedFeatures: string[];
  desiredFeatures?: string;
  generalFeedback?: string;
  improvedLawn?: boolean;
  improvementAreas?: string[];
}

/**
 * Interface for A/B test configuration
 */
export interface ABTest {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  variants: ABTestVariant[];
  targetUserPercentage: number;
  targetUserCriteria?: Record<string, any>;
  metrics: string[]; // Array of metrics to track for this test
  createdBy: string;
  winner?: string; // ID of winning variant
}

/**
 * Interface for A/B test variants
 */
export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  featureToggle?: string;
  configuration?: Record<string, any>;
  controlGroup: boolean;
  userCount: number;
}

/**
 * Interface for user test group assignment
 */
export interface UserTestAssignment {
  userId: string;
  testId: string;
  variantId: string;
  assignedAt: string;
  hasInteracted: boolean;
  conversionEvents: {
    eventType: string;
    timestamp: string;
    value?: any;
  }[];
}

/**
 * Interface for analytics service options
 */
export interface AnalyticsServiceOptions {
  enableOfflineTracking: boolean;
  queueSize: number;
  samplingRate: number; // 0-1 value
  automaticPageTracking: boolean;
  sessionTimeout: number; // In minutes
  userProperties: string[];
  excludedEvents?: AnalyticsEventType[];
}