import { getAnalytics, logEvent, isSupported, setUserId, setUserProperties } from 'firebase/analytics';
import { v4 as uuidv4 } from 'uuid';
import type { 
  AnalyticsEvent, 
  AnalyticsEventType, 
  AnalyticsServiceOptions,
  FeatureUsage
} from '../types/analytics';
import { ConnectionStatus } from '../types/offline';

// Configuration
const USE_MOCK_ANALYTICS = true; // Toggle between mock and real analytics
const DEFAULT_OPTIONS: AnalyticsServiceOptions = {
  enableOfflineTracking: true,
  queueSize: 100,
  samplingRate: 1.0, // Track all events by default
  automaticPageTracking: true,
  sessionTimeout: 30, // 30 minutes
  userProperties: ['lawnType', 'location', 'goals']
};

// In-memory storage for mock analytics
let mockEvents: AnalyticsEvent[] = [];
let mockFeatureUsage: Record<string, FeatureUsage> = {};
let mockSessionId = uuidv4();
let mockApiCalls = 0;
let mockCurrentUserId: string | null = null;
let mockUserProperties: Record<string, any> = {};

// Analytics instance
let analyticsInstance: any = null;
let currentOptions: AnalyticsServiceOptions = DEFAULT_OPTIONS;
let initialized = false;
let currentSessionId = mockSessionId;

// Check if we're offline by wrapping navigator.onLine
const isOffline = (): boolean => {
  return !navigator.onLine;
};

/**
 * Initialize the analytics service
 */
export const initializeAnalytics = async (
  userId?: string, 
  options?: Partial<AnalyticsServiceOptions>
): Promise<boolean> => {
  try {
    currentOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Reset session ID for new initialization
    currentSessionId = uuidv4();
    
    if (USE_MOCK_ANALYTICS) {
      console.log('Using mock analytics implementation');
      mockCurrentUserId = userId || null;
      initialized = true;
      
      // Log app launch event
      trackEvent('app_opened', { 
        sessionId: currentSessionId 
      });
      
      return true;
    }
    
    // Check if analytics is supported in this environment
    const isAnalyticsSupported = await isSupported();
    
    if (!isAnalyticsSupported) {
      console.log('Firebase Analytics is not supported in this environment');
      return false;
    }
    
    // Initialize Firebase Analytics
    analyticsInstance = getAnalytics();
    initialized = true;
    
    // Set user ID if provided
    if (userId) {
      setUserId(analyticsInstance, userId);
    }
    
    // Log app launch event
    logEvent(analyticsInstance, 'app_opened', {
      sessionId: currentSessionId
    });
    
    return true;
  } catch (error) {
    console.error('Error initializing analytics:', error);
    return false;
  }
};

/**
 * Queue an operation for when we're online again
 */
const queueOfflineOperation = (
  entityType: string,
  operation: string,
  data: any
): void => {
  // We'll use localStorage to persist the operation when offline
  try {
    const queueKey = 'lawnsync_offline_analytics_queue';
    const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    
    queue.push({
      id: uuidv4(),
      entityType,
      operation,
      data,
      timestamp: new Date().toISOString()
    });
    
    // Limit queue size
    while (queue.length > currentOptions.queueSize) {
      queue.shift();
    }
    
    localStorage.setItem(queueKey, JSON.stringify(queue));
    console.log(`[Analytics] Queued offline operation: ${operation}`);
  } catch (error) {
    console.error('Error queueing offline operation:', error);
  }
};

/**
 * Track an analytics event
 */
export const trackEvent = (
  eventType: AnalyticsEventType,
  properties?: Record<string, any>
): void => {
  if (!initialized) {
    console.warn('Analytics not initialized. Call initializeAnalytics() first.');
    return;
  }
  
  // Check if we should sample this event
  if (Math.random() > currentOptions.samplingRate) {
    return;
  }
  
  // Check if this event type is excluded
  if (currentOptions.excludedEvents?.includes(eventType)) {
    return;
  }
  
  try {
    const offline = isOffline();
    const timestamp = new Date().toISOString();
    const userId = mockCurrentUserId || 'anonymous';
    
    // Create the event object
    const event: AnalyticsEvent = {
      id: uuidv4(),
      userId,
      eventType,
      timestamp,
      properties: properties || {},
      sessionId: currentSessionId,
      isOffline: offline
    };
    
    if (USE_MOCK_ANALYTICS) {
      mockEvents.push(event);
      mockApiCalls++;
      console.log(`[Mock Analytics] Tracked event: ${eventType}`, properties);
      
      // Update feature usage metrics if this is a feature_used event
      if (eventType === 'feature_used' && properties?.featureId) {
        updateFeatureUsage(userId, properties.featureId, properties.featureName);
      }
      
      return;
    }
    
    // If offline and offline tracking is enabled, queue the event
    if (offline && currentOptions.enableOfflineTracking) {
      queueOfflineOperation('analytics', 'trackEvent', { eventType, properties });
      return;
    }
    
    // Log the event to Firebase Analytics
    logEvent(analyticsInstance, eventType, {
      ...properties,
      timestamp,
      sessionId: currentSessionId,
      isOffline: offline
    });
    
  } catch (error) {
    console.error(`Error tracking event ${eventType}:`, error);
  }
};

/**
 * Set user properties for analytics
 */
export const setAnalyticsUserProperties = (
  properties: Record<string, any>
): void => {
  if (!initialized) {
    console.warn('Analytics not initialized. Call initializeAnalytics() first.');
    return;
  }
  
  try {
    if (USE_MOCK_ANALYTICS) {
      mockUserProperties = { ...mockUserProperties, ...properties };
      console.log('[Mock Analytics] Set user properties:', properties);
      return;
    }
    
    // Set user properties in Firebase Analytics
    setUserProperties(analyticsInstance, properties);
    
  } catch (error) {
    console.error('Error setting user properties:', error);
  }
};

/**
 * Update feature usage metrics
 */
const updateFeatureUsage = (
  userId: string,
  featureId: string,
  featureName: string
): void => {
  const key = `${userId}_${featureId}`;
  const now = new Date().toISOString();
  
  if (mockFeatureUsage[key]) {
    // Update existing feature usage record
    mockFeatureUsage[key] = {
      ...mockFeatureUsage[key],
      usageCount: mockFeatureUsage[key].usageCount + 1,
      lastUsed: now
    };
  } else {
    // Create new feature usage record
    mockFeatureUsage[key] = {
      id: uuidv4(),
      userId,
      featureId,
      featureName,
      usageCount: 1,
      lastUsed: now
    };
  }
};

/**
 * Process queued offline events
 */
export const processOfflineQueue = (): void => {
  if (!initialized || isOffline()) {
    return;
  }
  
  try {
    const queueKey = 'lawnsync_offline_analytics_queue';
    const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    
    if (queue.length === 0) {
      return;
    }
    
    console.log(`[Analytics] Processing ${queue.length} queued operations`);
    
    // Process each operation
    queue.forEach((item: any) => {
      if (item.operation === 'trackEvent' && item.data) {
        const { eventType, properties } = item.data;
        trackEvent(eventType, properties);
      }
    });
    
    // Clear the queue
    localStorage.setItem(queueKey, '[]');
    
  } catch (error) {
    console.error('Error processing offline queue:', error);
  }
};

/**
 * Get all tracked events (for mock implementation and debugging)
 */
export const getTrackedEvents = (): AnalyticsEvent[] => {
  if (!USE_MOCK_ANALYTICS) {
    console.warn('This function is only available in mock analytics mode');
    return [];
  }
  
  return [...mockEvents];
};

/**
 * Get feature usage metrics (for mock implementation and debugging)
 */
export const getFeatureUsageMetrics = (): FeatureUsage[] => {
  if (!USE_MOCK_ANALYTICS) {
    console.warn('This function is only available in mock analytics mode');
    return [];
  }
  
  return Object.values(mockFeatureUsage);
};

/**
 * Clear analytics data (for mock implementation and testing)
 */
export const clearAnalyticsData = (): void => {
  if (!USE_MOCK_ANALYTICS) {
    console.warn('This function is only available in mock analytics mode');
    return;
  }
  
  mockEvents = [];
  mockFeatureUsage = {};
  mockApiCalls = 0;
};

/**
 * Get API usage metrics
 */
export const getApiUsageMetrics = () => {
  if (!USE_MOCK_ANALYTICS) {
    console.warn('This function is only available in mock analytics mode');
    return null;
  }
  
  return {
    totalCalls: mockApiCalls,
    eventCount: mockEvents.length,
    sessionId: currentSessionId,
    userProperties: { ...mockUserProperties }
  };
};

/**
 * Track screen view
 */
export const trackScreenView = (screenName: string, screenClass?: string): void => {
  trackEvent('feature_used', {
    featureId: `screen_${screenName.toLowerCase().replace(/\s+/g, '_')}`,
    featureName: screenName,
    screenClass
  });
};

/**
 * Generate session ID
 */
export const generateNewSession = (): string => {
  currentSessionId = uuidv4();
  return currentSessionId;
};

/**
 * Get current session ID
 */
export const getCurrentSessionId = (): string => {
  return currentSessionId;
};

/**
 * Handle app background/foreground transitions
 */
export const handleAppBackground = (): void => {
  trackEvent('app_background');
};

/**
 * Handle app returning to foreground
 */
export const handleAppForeground = (): void => {
  // If session timeout has passed, generate new session
  trackEvent('app_opened');
  
  // Process any queued offline events
  processOfflineQueue();
};

// Set up event listeners for online/offline events
window.addEventListener('online', () => {
  console.log('[Analytics] Connection restored');
  processOfflineQueue();
});

window.addEventListener('offline', () => {
  console.log('[Analytics] Connection lost');
});