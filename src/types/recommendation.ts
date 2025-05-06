/**
 * Type definitions for the AI Recommendation Engine
 */

/**
 * Interface for recommendation requests
 */
export interface RecommendationRequest {
  userId: string;
  lawnType: string;
  location: string;
  goals: string[];
  currentIssues?: string[];
  lawnSize?: string;
  recentActivities?: {
    activity: string;
    date: string;
  }[];
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  weatherContext?: {
    currentCondition: string;
    temperature: number;
    rainfall: number;
    forecast: string;
  };
  photoContext?: {
    recentPhotoId?: string;
    problemAreas?: {
      id: string;
      description: string;
      status: string;
    }[];
  };
}

/**
 * Interface for recommendation responses
 */
export interface Recommendation {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
  expiresAt?: string;
  category: RecommendationType;
  priority: 'high' | 'medium' | 'low';
  contextTriggers: {
    weather?: boolean;
    season?: boolean;
    lawnCondition?: boolean;
    userActivity?: boolean;
  };
  suggestedActions?: {
    id: string;
    title: string;
    description: string;
    taskCategory?: string;
  }[];
  relatedProducts?: {
    id: string;
    name: string;
    description: string;
    applicationInstructions?: string;
    url?: string;
  }[];
  feedback?: RecommendationFeedback;
  aiConfidenceScore?: number; // 0-100 score indicating AI confidence
  source: 'ai' | 'expert' | 'system';
}

/**
 * Types of recommendations that can be provided
 */
export type RecommendationType = 
  | 'maintenance' 
  | 'problem-solving' 
  | 'seasonal' 
  | 'improvement' 
  | 'resource-saving'
  | 'preventative';

/**
 * Interface for user feedback on recommendations
 */
export interface RecommendationFeedback {
  isHelpful: boolean;
  implementedActions?: string[];
  comment?: string;
  submittedAt: string;
}

/**
 * Interface for AI-generated prompts
 */
export interface RecommendationPrompt {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
  model: string;
}

/**
 * Configuration options for the recommendation service
 */
export interface RecommendationServiceOptions {
  useOpenAI: boolean;
  defaultModel: 'gpt-3.5-turbo' | 'gpt-4';
  maxCacheAge: number; // milliseconds
  promptTemplateId?: string;
  confidenceThreshold?: number; // 0-100, minimum confidence score to display
  maxRecommendations?: number;
  enablePersonalization?: boolean;
}

/**
 * Filter options for retrieving recommendations
 */
export interface RecommendationFilterOptions {
  types?: RecommendationType[];
  minPriority?: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
  withFeedbackOnly?: boolean;
  implementedOnly?: boolean;
  limit?: number;
  sortBy?: 'newest' | 'priority' | 'expiring-soon';
}