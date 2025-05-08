import { v4 as uuidv4 } from 'uuid';
import { mockUserData, mockTasks } from '../features/dashboard/mockData';
import { getWeatherForLocation } from './weatherService';
import type {
  Recommendation,
  RecommendationRequest,
  RecommendationFilterOptions,
  RecommendationServiceOptions,
  RecommendationType,
  RecommendationPrompt
} from '../types/recommendation';

// Environment configuration
const NODE_ENV = import.meta.env.NODE_ENV || 'development';
const USE_MOCK_RECOMMENDATIONS = import.meta.env.VITE_USE_MOCK_OPENAI === 'true';

// OpenAI API configuration based on environment
const getApiKey = (): string => {
  // Use environment-specific API key
  switch (NODE_ENV) {
    case 'production':
      return import.meta.env.VITE_OPENAI_API_KEY_PROD;
    case 'staging':
      return import.meta.env.VITE_OPENAI_API_KEY_STAGING;
    case 'development':
    default:
      return import.meta.env.VITE_OPENAI_API_KEY_DEV;
  }
};

const OPENAI_API_KEY = getApiKey();
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo';
const OPENAI_TIMEOUT = parseInt(import.meta.env.VITE_OPENAI_TIMEOUT || '10000', 10);

// Rate limiting configuration
const HOURLY_RATE_LIMIT = parseInt(import.meta.env.VITE_OPENAI_RATE_LIMIT || '50', 10);
const RATE_LIMIT_RESET_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

// Default service options
const DEFAULT_SERVICE_OPTIONS: RecommendationServiceOptions = {
  useOpenAI: true,
  defaultModel: OPENAI_MODEL,
  maxCacheAge: parseInt(import.meta.env.VITE_OPENAI_CACHE_DURATION || '86400000', 10), // Default 24 hours in milliseconds
  confidenceThreshold: 70,
  maxRecommendations: 5,
  enablePersonalization: true
};

// Rate limiting state
interface RateLimitState {
  callCount: number;
  resetTime: number;
}

const rateLimitState: RateLimitState = {
  callCount: 0,
  resetTime: Date.now() + RATE_LIMIT_RESET_INTERVAL
};

// Cache mechanism
interface RecommendationCache {
  [userId: string]: {
    recommendations: Recommendation[];
    timestamp: number;
    expires: number;
  };
}

// Storage and logging keys
const STORAGE_KEYS = {
  RECOMMENDATIONS: 'lawnsync_recommendations',
  FEEDBACK: 'lawnsync_recommendation_feedback',
  PROMPTS: 'lawnsync_recommendation_prompts',
  API_USAGE: 'lawnsync_openai_api_usage',
  ERROR_LOG: 'lawnsync_openai_errors'
};

// Cache with configurable expiration
const recommendationCache: RecommendationCache = {};
const CACHE_DURATION = DEFAULT_SERVICE_OPTIONS.maxCacheAge;

// API usage tracking
interface ApiUsageLog {
  timestamp: number;
  endpoint: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latency: number;
  success: boolean;
  error?: string;
}

// Error log for API calls
interface ApiErrorLog {
  timestamp: number;
  endpoint: string;
  error: string;
  request?: any;
  retryCount?: number;
}

/**
 * Load API usage logs from storage
 */
const loadApiUsageLogs = (): ApiUsageLog[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.API_USAGE);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error loading API usage logs:', error);
  }
  return [];
};

/**
 * Save API usage log
 */
const saveApiUsageLog = (log: ApiUsageLog): void => {
  try {
    const logs = loadApiUsageLogs();
    logs.push(log);
    
    // Keep only the last 100 logs to prevent localStorage from growing too large
    const trimmedLogs = logs.slice(-100);
    localStorage.setItem(STORAGE_KEYS.API_USAGE, JSON.stringify(trimmedLogs));
    
    // Log to console in development environment
    if (NODE_ENV === 'development') {
      console.log('OpenAI API usage:', log);
    }
  } catch (error) {
    console.error('Error saving API usage log:', error);
  }
};

/**
 * Log API error
 */
const logApiError = (error: ApiErrorLog): void => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.ERROR_LOG);
    let logs: ApiErrorLog[] = [];
    
    if (storedData) {
      logs = JSON.parse(storedData);
    }
    
    logs.push(error);
    
    // Keep only the last 50 errors
    const trimmedLogs = logs.slice(-50);
    localStorage.setItem(STORAGE_KEYS.ERROR_LOG, JSON.stringify(trimmedLogs));
    
    // Always log errors to console
    console.error('OpenAI API error:', error);
  } catch (e) {
    console.error('Error logging API error:', e);
  }
};

/**
 * Simple token count estimation (for tracking purposes)
 * Note: This is an approximation - actual token count requires a tokenizer
 */
const estimateTokenCount = (text: string): number => {
  // Rough approximation: 1 token ~= 4 characters for English text
  return Math.ceil(text.length / 4);
};

/**
 * Check and update rate limits
 * Returns true if under limit, false if limit exceeded
 */
const checkRateLimit = (): boolean => {
  const now = Date.now();
  
  // Reset counter if past reset time
  if (now > rateLimitState.resetTime) {
    rateLimitState.callCount = 0;
    rateLimitState.resetTime = now + RATE_LIMIT_RESET_INTERVAL;
  }
  
  // Check if rate limit would be exceeded
  if (rateLimitState.callCount >= HOURLY_RATE_LIMIT) {
    // Log the rate limit hit
    logApiError({
      timestamp: now,
      endpoint: 'rate-limit',
      error: `Rate limit of ${HOURLY_RATE_LIMIT} requests per hour exceeded. Resets at ${new Date(rateLimitState.resetTime).toISOString()}`
    });
    return false;
  }
  
  // Increment call count
  rateLimitState.callCount++;
  return true;
};

// Mock data for development and testing
const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    userId: 'user123',
    title: 'Apply Pre-Emergent Herbicide Now',
    description: 'Based on current weather patterns and the season, applying a pre-emergent herbicide in the next 5 days would help prevent summer weeds from germinating in your Bermuda grass lawn.',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    category: 'seasonal',
    priority: 'high',
    contextTriggers: {
      weather: true,
      season: true,
      lawnCondition: false,
      userActivity: false
    },
    suggestedActions: [
      {
        id: 'a1',
        title: 'Purchase Pre-Emergent',
        description: 'Look for a pre-emergent herbicide suitable for Bermuda grass.',
        taskCategory: 'weed-control'
      },
      {
        id: 'a2',
        title: 'Apply Pre-Emergent',
        description: 'Apply evenly across your lawn following product instructions.',
        taskCategory: 'weed-control'
      }
    ],
    relatedProducts: [
      {
        id: 'p1',
        name: 'Premium Pre-Emergent Herbicide',
        description: 'Effective against crabgrass and other common summer weeds.',
        applicationInstructions: 'Apply at a rate of 3lbs per 1000 sq ft.'
      }
    ],
    source: 'ai',
    aiConfidenceScore: 92
  },
  {
    id: '2',
    userId: 'user123',
    title: 'Adjust Watering Schedule',
    description: 'The current rainfall and upcoming forecast suggest you should reduce your watering frequency to prevent overwatering your Bermuda grass.',
    createdAt: new Date().toISOString(),
    category: 'resource-saving',
    priority: 'medium',
    contextTriggers: {
      weather: true,
      season: false,
      lawnCondition: false,
      userActivity: true
    },
    suggestedActions: [
      {
        id: 'a3',
        title: 'Update Irrigation Schedule',
        description: 'Reduce watering to once every 5 days until rainfall decreases.',
        taskCategory: 'watering'
      }
    ],
    source: 'system',
    aiConfidenceScore: 85
  },
  {
    id: '3',
    userId: 'user123',
    title: 'Address Potential Fungus Issue',
    description: 'Recent photos of your lawn show signs of brown patch fungus, which is common in Bermuda grass during periods of high humidity and warm temperatures.',
    createdAt: new Date().toISOString(),
    category: 'problem-solving',
    priority: 'high',
    contextTriggers: {
      weather: true,
      season: false,
      lawnCondition: true,
      userActivity: false
    },
    suggestedActions: [
      {
        id: 'a4',
        title: 'Apply Fungicide',
        description: 'Apply a fungicide labeled for brown patch control.',
        taskCategory: 'disease-control'
      },
      {
        id: 'a5',
        title: 'Adjust Watering Time',
        description: 'Water early in the morning to allow grass to dry during the day.',
        taskCategory: 'watering'
      }
    ],
    relatedProducts: [
      {
        id: 'p2',
        name: 'Lawn Fungus Control',
        description: 'Broad-spectrum fungicide for lawn disease management.',
        applicationInstructions: 'Mix 4oz per gallon of water and apply with a sprayer.'
      }
    ],
    source: 'ai',
    aiConfidenceScore: 78
  }
];

/**
 * Loads recommendations from localStorage
 */
const loadFromStorage = (userId: string): Recommendation[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
    if (storedData) {
      const allRecommendations = JSON.parse(storedData);
      // Filter recommendations for the specific user
      return allRecommendations.filter((rec: Recommendation) => rec.userId === userId);
    }
  } catch (error) {
    console.error('Error loading recommendations from storage:', error);
  }
  return [];
};

/**
 * Saves recommendations to localStorage
 */
const saveToStorage = (recommendations: Recommendation[]): void => {
  try {
    // First get all existing recommendations
    const storedData = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
    let allRecommendations: Recommendation[] = [];
    
    if (storedData) {
      // Parse existing recommendations
      allRecommendations = JSON.parse(storedData);
      
      // For each new recommendation
      recommendations.forEach(newRec => {
        // Find the index of the recommendation with the same ID (if it exists)
        const existingIndex = allRecommendations.findIndex(rec => rec.id === newRec.id);
        
        if (existingIndex >= 0) {
          // Replace the existing recommendation
          allRecommendations[existingIndex] = newRec;
        } else {
          // Add the new recommendation
          allRecommendations.push(newRec);
        }
      });
    } else {
      // No existing recommendations, use the new ones
      allRecommendations = recommendations;
    }
    
    // Save all recommendations back to localStorage
    localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(allRecommendations));
  } catch (error) {
    console.error('Error saving recommendations to storage:', error);
  }
};

/**
 * Get system prompt template for recommendation generation
 */
const getSystemPrompt = (): string => {
  return `You are LawnSync AI, an expert lawn care assistant that provides personalized advice.
Your goal is to provide actionable, context-aware lawn care recommendations based on:
1. User's lawn type and location
2. Current weather conditions and forecast
3. Seasonal timing and appropriate lawn care activities
4. User's lawn goals and issues

Focus on providing specific, practical advice that the user can implement right away.
Format your response as JSON following this structure:
{
  "title": "Brief, action-oriented title",
  "description": "Detailed explanation with reasoning (2-3 sentences)",
  "category": "One of: maintenance, problem-solving, seasonal, improvement, resource-saving, preventative",
  "priority": "high, medium, or low based on urgency",
  "suggestedActions": [
    {
      "title": "Clear action step title",
      "description": "How to perform this action",
      "taskCategory": "fertilizing, mowing, watering, weed-control, or soil-health"
    }
  ],
  "confidenceScore": "Number between 0-100 indicating your confidence in this recommendation"
}`;
};

/**
 * Generate user prompt for OpenAI based on context
 */
const generateUserPrompt = async (request: RecommendationRequest): Promise<string> => {
  // Get weather data for additional context
  let weatherContext = '';
  if (request.location) {
    try {
      const weather = await getWeatherForLocation(request.location);
      weatherContext = `
Current Weather: ${weather.current.condition}, ${weather.current.temp}°F, ${weather.current.humidity}% humidity
Recent Rainfall: ${weather.rainfall.last7Days} inches in the last 7 days
Forecast: ${weather.forecast.map(day => `${day.day}: ${day.condition}, ${day.high}°F/${day.low}°F`).join(', ')}`;
    } catch (error) {
      console.error('Error fetching weather data for recommendation:', error);
    }
  }

  return `Please provide a personalized lawn care recommendation for:

Lawn Type: ${request.lawnType}
Location: ${request.location}
Lawn Size: ${request.lawnSize || 'Not specified'}
Goals: ${request.goals.join(', ')}
Current Issues: ${request.currentIssues?.join(', ') || 'None specified'}
Season: ${request.season || getCurrentSeason()}
${weatherContext}

${request.recentActivities ? `Recent Activities:
${request.recentActivities.map(a => `- ${a.activity} (${a.date})`).join('\n')}` : ''}

${request.photoContext?.problemAreas ? `Problem Areas Identified in Photos:
${request.photoContext.problemAreas.map(p => `- ${p.description} (${p.status})`).join('\n')}` : ''}

Provide one specific, actionable recommendation that addresses their current needs based on all available context.`;
};

/**
 * Get current season based on month
 */
const getCurrentSeason = (): string => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

/**
 * Calls OpenAI API to generate a recommendation
 */
/**
 * Calls OpenAI API to generate a recommendation with retries, rate limiting, and logging
 */
const callOpenAI = async (prompt: RecommendationPrompt, retryCount = 0): Promise<any> => {
  if (USE_MOCK_RECOMMENDATIONS) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock AI response
    return {
      title: "Apply Slow-Release Fertilizer",
      description: "Based on your Bermuda grass type and the current spring season in Austin, applying a slow-release nitrogen fertilizer would promote healthy growth. Recent rainfall provides good soil moisture for nutrient absorption.",
      category: "seasonal",
      priority: "medium",
      suggestedActions: [
        {
          title: "Purchase 15-0-15 Fertilizer",
          description: "Look for a slow-release 15-0-15 fertilizer suitable for Bermuda grass",
          taskCategory: "fertilizing"
        },
        {
          title: "Apply Fertilizer Evenly",
          description: "Spread at rate of 1lb nitrogen per 1000 sq ft using a broadcast spreader",
          taskCategory: "fertilizing"
        }
      ],
      confidenceScore: 88
    };
  }

  // Check rate limit before proceeding
  if (!checkRateLimit()) {
    throw new Error('OpenAI API rate limit exceeded. Please try again later.');
  }

  // Generate request ID for tracking
  const requestId = uuidv4().slice(0, 8);
  const startTime = Date.now();
  const maxRetries = 2;

  // Estimate token counts for logging
  const estimatedPromptTokens = estimateTokenCount(prompt.systemPrompt + prompt.userPrompt);
  
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT);
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: prompt.model,
        messages: [
          { role: 'system', content: prompt.systemPrompt },
          { role: 'user', content: prompt.userPrompt }
        ],
        temperature: prompt.temperature,
        max_tokens: prompt.maxTokens
      }),
      signal: controller.signal
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `API request failed with status ${response.status}: ${errorText}`;
      
      // Log the API error
      logApiError({
        timestamp: Date.now(),
        endpoint: OPENAI_API_URL,
        error: errorMessage,
        request: {
          model: prompt.model,
          requestId
        },
        retryCount
      });
      
      // Handle rate limiting from OpenAI (status 429)
      if (response.status === 429 && retryCount < maxRetries) {
        // Exponential backoff: wait 2^retryCount seconds before retrying
        const backoffTime = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return callOpenAI(prompt, retryCount + 1);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const endTime = Date.now();
    
    // Extract token usage from response if available
    const tokenUsage = data.usage || {
      prompt_tokens: estimatedPromptTokens,
      completion_tokens: estimateTokenCount(data.choices[0]?.message?.content || ''),
      total_tokens: estimatedPromptTokens + estimateTokenCount(data.choices[0]?.message?.content || '')
    };
    
    // Log successful API usage
    saveApiUsageLog({
      timestamp: Date.now(),
      endpoint: OPENAI_API_URL,
      model: prompt.model,
      promptTokens: tokenUsage.prompt_tokens,
      completionTokens: tokenUsage.completion_tokens,
      totalTokens: tokenUsage.total_tokens,
      latency: endTime - startTime,
      success: true
    });
    
    // Parse the JSON from the response content
    try {
      const content = data.choices[0].message.content;
      // Extract JSON from the response (handling potential text before/after JSON)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in the response');
      }
    } catch (error) {
      // Log parsing error
      logApiError({
        timestamp: Date.now(),
        endpoint: 'json-parsing',
        error: `Error parsing OpenAI response: ${error instanceof Error ? error.message : String(error)}`,
        request: {
          model: prompt.model,
          requestId
        }
      });
      
      // Return a fallback structured response when parsing fails
      return {
        title: "Lawn Care Recommendation",
        description: data.choices[0].message.content.substring(0, 100) + "...",
        category: "maintenance",
        priority: "medium",
        suggestedActions: [
          {
            title: "Review Full Recommendation",
            description: "The AI provided a recommendation that couldn't be automatically processed",
            taskCategory: "maintenance"
          }
        ],
        confidenceScore: 60
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Log detailed error information
    logApiError({
      timestamp: Date.now(),
      endpoint: OPENAI_API_URL,
      error: `Error calling OpenAI API: ${errorMessage}`,
      request: {
        model: prompt.model,
        requestId
      },
      retryCount
    });
    
    // Handle timeout errors or network issues with retry
    if ((errorMessage.includes('timeout') || errorMessage.includes('network')) &&
        retryCount < maxRetries) {
      // Exponential backoff
      const backoffTime = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      return callOpenAI(prompt, retryCount + 1);
    }
    
    // Re-throw the error for the caller to handle
    throw error;
  }
};

/**
 * Get recommendations for a user
 */
export const getRecommendations = async (
  userId: string,
  filterOptions?: RecommendationFilterOptions,
  serviceOptions?: Partial<RecommendationServiceOptions>
): Promise<Recommendation[]> => {
  const options = { ...DEFAULT_SERVICE_OPTIONS, ...serviceOptions };
  
  if (USE_MOCK_RECOMMENDATIONS) {
    console.log('Using mock recommendation data');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let recommendations = [...mockRecommendations];
    
    // Apply filters if provided
    if (filterOptions) {
      // Filter by type
      if (filterOptions.types && filterOptions.types.length > 0) {
        recommendations = recommendations.filter(rec => 
          filterOptions.types!.includes(rec.category)
        );
      }
      
      // Filter by minimum priority
      if (filterOptions.minPriority) {
        const priorityLevel = { 'low': 1, 'medium': 2, 'high': 3 };
        const minLevel = priorityLevel[filterOptions.minPriority];
        recommendations = recommendations.filter(rec => 
          priorityLevel[rec.priority] >= minLevel
        );
      }
      
      // Sort by specified order
      if (filterOptions.sortBy) {
        switch (filterOptions.sortBy) {
          case 'newest':
            recommendations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'priority':
            const priorityValue = { 'low': 1, 'medium': 2, 'high': 3 };
            recommendations.sort((a, b) => priorityValue[b.priority] - priorityValue[a.priority]);
            break;
          case 'expiring-soon':
            recommendations.sort((a, b) => {
              const aExpiry = a.expiresAt ? new Date(a.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
              const bExpiry = b.expiresAt ? new Date(b.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
              return aExpiry - bExpiry;
            });
            break;
        }
      }
      
      // Apply limit if specified
      if (filterOptions.limit && filterOptions.limit > 0) {
        recommendations = recommendations.slice(0, filterOptions.limit);
      }
    }
    
    return recommendations;
  }
  
  // Check if we have cached data that's still valid
  const now = Date.now();
  const cachedData = recommendationCache[userId];
  
  if (
    cachedData && 
    cachedData.timestamp + cachedData.expires > now &&
    !serviceOptions?.maxCacheAge // If maxCacheAge is not explicitly set
  ) {
    console.log('Using cached recommendations for user:', userId);
    let recommendations = [...cachedData.recommendations];
    
    // Apply filtering logic
    // (Same filtering logic as the mock data section)
    
    return recommendations;
  }
  
  try {
    console.log('Fetching fresh recommendations for user:', userId);
    
    // Load from localStorage if no cache
    let recommendations = loadFromStorage(userId);
    
    // Cache the loaded recommendations
    recommendationCache[userId] = {
      recommendations,
      timestamp: now,
      expires: options.maxCacheAge || CACHE_DURATION
    };
    
    // Apply filtering logic
    // (Same filtering logic as the mock data section)
    
    return recommendations;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return USE_MOCK_RECOMMENDATIONS ? mockRecommendations : [];
  }
};

/**
 * Generate a new AI recommendation based on user context
 */
/**
 * Generate a new AI recommendation based on user context with enhanced error handling and caching
 */
export const generateRecommendation = async (
  request: RecommendationRequest,
  serviceOptions?: Partial<RecommendationServiceOptions>
): Promise<Recommendation> => {
  const options = { ...DEFAULT_SERVICE_OPTIONS, ...serviceOptions };
  
  // Generate a cache key based on relevant request properties
  const cacheKey = `${request.userId}_${request.lawnType}_${request.location}_${request.season || getCurrentSeason()}`;
  
  // Check cache first using the cache key, not just user ID
  const now = Date.now();
  const cachedRecommendations = Object.values(recommendationCache)
    .flatMap(cache => cache.recommendations)
    .filter(rec => {
      // Look for recommendations with matching attributes
      return rec.userId === request.userId &&
             rec.createdAt &&
             (new Date(rec.createdAt).getTime() > now - options.maxCacheAge) &&
             (rec.contextTriggers?.weather === Boolean(request.weatherContext)) &&
             (rec.contextTriggers?.season === true);
    });
  
  // Return cached recommendation if it exists and is still valid
  if (cachedRecommendations.length > 0) {
    console.log('Using cached recommendation for:', cacheKey);
    return cachedRecommendations[0];
  }
  
  if (USE_MOCK_RECOMMENDATIONS) {
    console.log('Using mock recommendation generation');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a new recommendation by modifying one from mock data
    const baseRec = { ...mockRecommendations[0] };
    
    const newRec: Recommendation = {
      ...baseRec,
      id: uuidv4(),
      userId: request.userId,
      title: `${getCurrentSeason().charAt(0).toUpperCase() + getCurrentSeason().slice(1)} Care for ${request.lawnType}`,
      description: `Based on your ${request.lawnType} lawn in ${request.location}, now is the ideal time to focus on proper ${getCurrentSeason()} care including optimal mowing height and appropriate fertilization.`,
      createdAt: new Date().toISOString(),
      category: 'seasonal',
      source: 'ai'
    };
    
    // Save mock recommendation to cache
    cacheRecommendation(request.userId, newRec, options.maxCacheAge);
    return newRec;
  }
  
  try {
    // Generate the prompts
    const systemPrompt = getSystemPrompt();
    const userPrompt = await generateUserPrompt(request);
    
    // Call OpenAI API with retries and logging
    const promptRequest: RecommendationPrompt = {
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 1000,
      model: options.defaultModel
    };
    
    const aiResponse = await callOpenAI(promptRequest);
    
    // Transform OpenAI response to our Recommendation format
    const recommendation: Recommendation = {
      id: uuidv4(),
      userId: request.userId,
      title: aiResponse.title,
      description: aiResponse.description,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days expiry by default
      category: aiResponse.category as RecommendationType,
      priority: aiResponse.priority,
      contextTriggers: {
        weather: request.weatherContext ? true : false,
        season: true,
        lawnCondition: request.currentIssues && request.currentIssues.length > 0,
        userActivity: request.recentActivities && request.recentActivities.length > 0
      },
      suggestedActions: aiResponse.suggestedActions,
      aiConfidenceScore: aiResponse.confidenceScore || 75,
      source: 'ai',
      metadata: {
        generatedAt: new Date().toISOString(),
        environment: NODE_ENV,
        model: options.defaultModel,
        cacheKey
      }
    };
    
    // Cache the recommendation
    cacheRecommendation(request.userId, recommendation, options.maxCacheAge);
    
    return recommendation;
  } catch (error) {
    // Log the error
    logApiError({
      timestamp: Date.now(),
      endpoint: 'generateRecommendation',
      error: `Error generating recommendation: ${error instanceof Error ? error.message : String(error)}`,
      request: {
        userId: request.userId,
        lawnType: request.lawnType,
        location: request.location
      }
    });
    
    // Return a fallback recommendation
    const fallbackRecommendation: Recommendation = {
      id: uuidv4(),
      userId: request.userId,
      title: 'General Lawn Maintenance',
      description: 'Regular maintenance is key to a healthy lawn. Consider following a seasonal care schedule for your lawn type.',
      createdAt: new Date().toISOString(),
      category: 'maintenance',
      priority: 'medium',
      contextTriggers: {
        weather: false,
        season: true,
        lawnCondition: false,
        userActivity: false
      },
      source: 'system',
      metadata: {
        fallback: true,
        error: error instanceof Error ? error.message : String(error),
        generatedAt: new Date().toISOString(),
        environment: NODE_ENV
      }
    };
    
    // Cache the fallback recommendation (with shorter expiry)
    cacheRecommendation(request.userId, fallbackRecommendation, Math.min(options.maxCacheAge, 4 * 60 * 60 * 1000)); // 4 hours max for fallbacks
    
    return fallbackRecommendation;
  }
};

/**
 * Helper function to cache a recommendation
 */
const cacheRecommendation = (
  userId: string,
  recommendation: Recommendation,
  maxCacheAge: number
): void => {
  // Save to cache
  if (!recommendationCache[userId]) {
    recommendationCache[userId] = {
      recommendations: [recommendation],
      timestamp: Date.now(),
      expires: maxCacheAge || CACHE_DURATION
    };
  } else {
    // Check if we already have a similar recommendation
    const existingIndex = recommendationCache[userId].recommendations.findIndex(
      r => r.category === recommendation.category &&
           r.priority === recommendation.priority
    );
    
    if (existingIndex >= 0) {
      // Replace existing similar recommendation
      recommendationCache[userId].recommendations[existingIndex] = recommendation;
    } else {
      // Add new recommendation
      recommendationCache[userId].recommendations.push(recommendation);
    }
    
    recommendationCache[userId].timestamp = Date.now();
  }
  
  // Save to storage
  saveToStorage([recommendation]);
};

/**
 * Submit feedback for a recommendation
 */
export const submitRecommendationFeedback = async (
  recommendationId: string,
  userId: string,
  isHelpful: boolean,
  implementedActions?: string[],
  comment?: string
): Promise<Recommendation | null> => {
  if (USE_MOCK_RECOMMENDATIONS) {
    console.log('Using mock recommendation feedback');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find the recommendation to update
    const recommendation = mockRecommendations.find(r => r.id === recommendationId);
    
    if (!recommendation) {
      return null;
    }
    
    // Create updated recommendation with feedback
    const updatedRecommendation: Recommendation = {
      ...recommendation,
      feedback: {
        isHelpful,
        implementedActions,
        comment,
        submittedAt: new Date().toISOString()
      }
    };
    
    console.log('Updated recommendation with feedback:', updatedRecommendation);
    return updatedRecommendation;
  }
  
  try {
    // Get cached recommendations or load from storage
    let userRecommendations: Recommendation[] = [];
    
    if (recommendationCache[userId]) {
      userRecommendations = [...recommendationCache[userId].recommendations];
    } else {
      userRecommendations = loadFromStorage(userId);
    }
    
    // Find the recommendation to update
    const recommendationIndex = userRecommendations.findIndex(r => r.id === recommendationId);
    
    if (recommendationIndex === -1) {
      return null;
    }
    
    // Update the recommendation with feedback
    const updatedRecommendation: Recommendation = {
      ...userRecommendations[recommendationIndex],
      feedback: {
        isHelpful,
        implementedActions,
        comment,
        submittedAt: new Date().toISOString()
      }
    };
    
    // Update in cache
    if (recommendationCache[userId]) {
      userRecommendations[recommendationIndex] = updatedRecommendation;
      recommendationCache[userId].recommendations = userRecommendations;
      recommendationCache[userId].timestamp = Date.now();
    }
    
    // Save to storage
    saveToStorage([updatedRecommendation]);
    
    return updatedRecommendation;
  } catch (error) {
    console.error('Error submitting recommendation feedback:', error);
    return null;
  }
};

/**
 * Get a specific recommendation by ID
 */
export const getRecommendationById = async (
  recommendationId: string,
  userId: string
): Promise<Recommendation | null> => {
  if (USE_MOCK_RECOMMENDATIONS) {
    console.log('Using mock recommendation data');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return mockRecommendations.find(r => r.id === recommendationId) || null;
  }
  
  try {
    // Check cache first
    if (recommendationCache[userId]) {
      const cachedRec = recommendationCache[userId].recommendations.find(
        r => r.id === recommendationId
      );
      
      if (cachedRec) {
        return cachedRec;
      }
    }
    
    // Try to find in storage
    const userRecs = loadFromStorage(userId);
    return userRecs.find(r => r.id === recommendationId) || null;
  } catch (error) {
    console.error('Error getting recommendation by ID:', error);
    return null;
  }
};

/**
 * Build a recommendation request from user profile and context
 */
export const buildRecommendationRequest = async (
  userId: string,
  includeWeather: boolean = true,
  includePhotos: boolean = true
): Promise<RecommendationRequest> => {
  // In a real app, this would fetch user profile from a store or API
  // For now, using mock data
  const userData = mockUserData;
  
  const request: RecommendationRequest = {
    userId,
    lawnType: userData.lawnType,
    location: userData.location,
    goals: userData.goals,
    lawnSize: userData.lawnSize,
    season: getCurrentSeason() as any,
  };
  
  // Add weather context if requested
  if (includeWeather) {
    try {
      const weatherData = await getWeatherForLocation(userData.location);
      request.weatherContext = {
        currentCondition: weatherData.current.condition,
        temperature: weatherData.current.temp,
        rainfall: weatherData.rainfall.last7Days,
        forecast: weatherData.forecast.map(day => `${day.day}: ${day.condition}`).join(', ')
      };
    } catch (error) {
      console.error('Error fetching weather for recommendation request:', error);
    }
  }
  
  // In a real app, we would add photo context and recent activities
  
  return request;
};

/**
 * Clear recommendation cache for testing
 */
export const clearRecommendationCache = (): void => {
  Object.keys(recommendationCache).forEach(key => {
    delete recommendationCache[key];
  });
  console.log('Recommendation cache cleared');
};

/**
 * Get API usage statistics for the admin dashboard
 */
export const getApiUsageStats = (): {
  totalCalls: number;
  successRate: number;
  avgLatency: number;
  totalTokens: number;
  callsByDay: Record<string, number>;
  errorRate: number;
  remainingQuota: number;
} => {
  const logs = loadApiUsageLogs();
  
  if (logs.length === 0) {
    return {
      totalCalls: 0,
      successRate: 100,
      avgLatency: 0,
      totalTokens: 0,
      callsByDay: {},
      errorRate: 0,
      remainingQuota: HOURLY_RATE_LIMIT
    };
  }
  
  const successfulCalls = logs.filter(log => log.success);
  const totalTokens = logs.reduce((sum, log) => sum + (log.totalTokens || 0), 0);
  const totalLatency = successfulCalls.reduce((sum, log) => sum + log.latency, 0);
  
  // Group by day
  const callsByDay: Record<string, number> = {};
  logs.forEach(log => {
    const date = new Date(log.timestamp).toISOString().split('T')[0];
    callsByDay[date] = (callsByDay[date] || 0) + 1;
  });
  
  return {
    totalCalls: logs.length,
    successRate: (successfulCalls.length / logs.length) * 100,
    avgLatency: successfulCalls.length > 0 ? totalLatency / successfulCalls.length : 0,
    totalTokens,
    callsByDay,
    errorRate: 100 - ((successfulCalls.length / logs.length) * 100),
    remainingQuota: HOURLY_RATE_LIMIT - rateLimitState.callCount
  };
};

/**
 * Reset API usage statistics (for testing)
 */
export const resetApiUsageStats = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.API_USAGE);
    localStorage.removeItem(STORAGE_KEYS.ERROR_LOG);
    rateLimitState.callCount = 0;
    rateLimitState.resetTime = Date.now() + RATE_LIMIT_RESET_INTERVAL;
    console.log('API usage statistics reset');
  } catch (error) {
    console.error('Error resetting API usage statistics:', error);
  }
};