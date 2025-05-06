import { v4 as uuidv4 } from 'uuid';
import { mockUserData } from '../features/dashboard/mockData';
import { getWateringSchedules } from './wateringService';
import type { WeatherData } from './weatherService';
import { getWeatherForLocation } from './weatherService';
import type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationDeliveryMethod,
  NotificationPreferences,
  NotificationGroup,
  NotificationFilterOptions,
  NotificationTriggerEvent,
  NotificationDeliveryResponse
} from '../types/notification';

// Toggle between mock and real implementation
const USE_MOCK_NOTIFICATIONS = true;

// LocalStorage keys for persistence
const NOTIFICATIONS_STORAGE_KEY = 'lawnSync_notifications';
const NOTIFICATION_PREFS_STORAGE_KEY = 'lawnSync_notificationPrefs';

// Default notification preferences
const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  deliveryMethods: ['in_app'],
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00'
  },
  typePreferences: {
    'scheduled_task': {
      enabled: true,
      priority: 'medium',
      deliveryMethods: ['in_app']
    },
    'weather_alert': {
      enabled: true,
      priority: 'high',
      deliveryMethods: ['in_app']
    },
    'watering_event': {
      enabled: true,
      priority: 'medium',
      deliveryMethods: ['in_app']
    },
    'seasonal_tip': {
      enabled: true,
      priority: 'low',
      deliveryMethods: ['in_app']
    },
    'progress_update': {
      enabled: true,
      priority: 'low',
      deliveryMethods: ['in_app']
    },
    'system_alert': {
      enabled: true,
      priority: 'high',
      deliveryMethods: ['in_app']
    }
  }
};

// Generate a set of mock notifications for testing
const generateMockNotifications = (): Notification[] => {
  const today = new Date();
  const notifications: Notification[] = [];
  
  // Add scheduled task notification
  notifications.push({
    id: uuidv4(),
    type: 'scheduled_task',
    title: 'Mow the lawn today',
    message: 'Weather conditions are optimal for mowing your lawn this afternoon.',
    priority: 'medium',
    createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: false,
    metadata: {
      taskId: '12345',
      weatherScore: 8.5
    },
    relatedEntityId: '12345',
    relatedEntityType: 'task',
    actionUrl: '/dashboard/tasks'
  });
  
  // Add weather alert notification
  notifications.push({
    id: uuidv4(),
    type: 'weather_alert',
    title: 'Heavy rain expected',
    message: 'Heavy rain forecasted for tomorrow. Consider rescheduling outdoor lawn activities.',
    priority: 'high',
    createdAt: new Date(today.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    isRead: true,
    metadata: {
      precipitation: 0.75,
      weatherAlert: 'heavy_rain'
    },
    actionUrl: '/dashboard/weather'
  });
  
  // Add watering event notification
  notifications.push({
    id: uuidv4(),
    type: 'watering_event',
    title: 'Watering schedule adjusted',
    message: 'Your watering schedule has been adjusted due to forecasted rainfall. 25 gallons of water saved!',
    priority: 'medium',
    createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: false,
    metadata: {
      scheduleId: '789',
      waterSaved: 25,
      originalDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    relatedEntityId: '789',
    relatedEntityType: 'watering_schedule',
    actionUrl: '/dashboard/watering'
  });
  
  // Add seasonal tip notification
  notifications.push({
    id: uuidv4(),
    type: 'seasonal_tip',
    title: 'Time for Spring overseeding',
    message: 'Spring is a great time to overseed bare patches in your lawn. Our analysis shows your lawn could benefit from overseeding the front yard.',
    priority: 'low',
    createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isRead: true,
    metadata: {
      season: 'spring',
      lawnArea: 'front_yard'
    },
    actionUrl: '/dashboard/recommendations'
  });
  
  // Add progress update notification
  notifications.push({
    id: uuidv4(),
    type: 'progress_update',
    title: 'Lawn health improving',
    message: 'Your recent photos show a 15% improvement in lawn health since last month. Keep up the good work!',
    priority: 'low',
    createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    isRead: false,
    metadata: {
      improvementPercentage: 15,
      comparisonPhotoIds: ['photo1', 'photo2']
    },
    actionUrl: '/dashboard/progress'
  });
  
  return notifications;
};

/**
 * Load notifications from localStorage
 */
const loadNotificationsFromStorage = (): Notification[] => {
  try {
    const storedData = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error loading notifications from storage:', error);
  }
  return [];
};

/**
 * Save notifications to localStorage
 */
const saveNotificationsToStorage = (notifications: Notification[]): void => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notifications to storage:', error);
  }
};

/**
 * Load notification preferences from localStorage
 */
const loadPreferencesFromStorage = (): NotificationPreferences | null => {
  try {
    const storedData = localStorage.getItem(NOTIFICATION_PREFS_STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error loading notification preferences from storage:', error);
  }
  return null;
};

/**
 * Save notification preferences to localStorage
 */
const savePreferencesToStorage = (preferences: NotificationPreferences): void => {
  try {
    localStorage.setItem(NOTIFICATION_PREFS_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving notification preferences to storage:', error);
  }
};

/**
 * Check if a notification should be delivered based on quiet hours
 */
const shouldDeliverDuringQuietHours = (
  preferences: NotificationPreferences, 
  priority: NotificationPriority
): boolean => {
  if (!preferences.quietHours.enabled) {
    return true;
  }
  
  // Always deliver urgent notifications regardless of quiet hours
  if (priority === 'urgent') {
    return true;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  const quietStart = preferences.quietHours.start.split(':');
  const quietStartTime = parseInt(quietStart[0]) * 60 + parseInt(quietStart[1]);
  
  const quietEnd = preferences.quietHours.end.split(':');
  const quietEndTime = parseInt(quietEnd[0]) * 60 + parseInt(quietEnd[1]);
  
  // Handle cases where quiet hours span midnight
  if (quietStartTime > quietEndTime) {
    return currentTime < quietStartTime && currentTime >= quietEndTime;
  } else {
    return currentTime < quietStartTime || currentTime >= quietEndTime;
  }
};

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (filters?: NotificationFilterOptions): Promise<Notification[]> => {
  let notifications: Notification[];
  
  if (USE_MOCK_NOTIFICATIONS) {
    console.log('Using mock notification data');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate or load mock notifications
    const storedNotifications = loadNotificationsFromStorage();
    notifications = storedNotifications.length > 0 ? storedNotifications : generateMockNotifications();
    
    // If first time, save generated notifications
    if (storedNotifications.length === 0) {
      saveNotificationsToStorage(notifications);
    }
  } else {
    // In a real implementation, this would fetch from a database/API
    // For now, we'll use localStorage
    notifications = loadNotificationsFromStorage();
    if (notifications.length === 0) {
      notifications = generateMockNotifications();
      saveNotificationsToStorage(notifications);
    }
  }
  
  // Apply filters if provided
  if (filters) {
    if (filters.types && filters.types.length > 0) {
      notifications = notifications.filter(n => filters.types?.includes(n.type));
    }
    
    if (filters.priorities && filters.priorities.length > 0) {
      notifications = notifications.filter(n => filters.priorities?.includes(n.priority));
    }
    
    if (filters.readStatus) {
      if (filters.readStatus === 'read') {
        notifications = notifications.filter(n => n.isRead);
      } else if (filters.readStatus === 'unread') {
        notifications = notifications.filter(n => !n.isRead);
      }
    }
    
    if (filters.dateRange) {
      const fromDate = new Date(filters.dateRange.from).getTime();
      const toDate = new Date(filters.dateRange.to).getTime();
      
      notifications = notifications.filter(n => {
        const notificationDate = new Date(n.createdAt).getTime();
        return notificationDate >= fromDate && notificationDate <= toDate;
      });
    }
  }
  
  // Sort by creation date, newest first
  return notifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Get a single notification by id
 */
export const getNotificationById = async (id: string): Promise<Notification | null> => {
  const notifications = await getNotifications();
  return notifications.find(n => n.id === id) || null;
};

/**
 * Get count of unread notifications
 */
export const getUnreadNotificationCount = async (): Promise<number> => {
  const notifications = await getNotifications();
  return notifications.filter(n => !n.isRead).length;
};

/**
 * Create a new notification
 */
export const createNotification = async (event: NotificationTriggerEvent): Promise<Notification | null> => {
  // Get user preferences
  const preferences = await getNotificationPreferences();
  
  // Check if notifications are enabled globally
  if (!preferences.enabled) {
    console.log('Notifications disabled globally');
    return null;
  }
  
  // Check if the specific notification type is enabled
  const typePrefs = preferences.typePreferences[event.type];
  if (!typePrefs.enabled) {
    console.log(`Notifications for type ${event.type} are disabled`);
    return null;
  }
  
  // Check quiet hours (except for urgent notifications)
  if (event.priority !== 'urgent' && 
      !shouldDeliverDuringQuietHours(preferences, event.priority)) {
    console.log('Notification suppressed due to quiet hours');
    return null;
  }
  
  // Create the notification
  const notification: Notification = {
    id: uuidv4(),
    type: event.type,
    title: event.title,
    message: event.message,
    priority: event.priority,
    createdAt: new Date().toISOString(),
    expiresAt: event.expiresAt,
    isRead: false,
    metadata: event.metadata,
    relatedEntityId: event.relatedEntityId,
    relatedEntityType: event.relatedEntityType,
    actionUrl: event.actionUrl
  };
  
  // Save to storage
  const notifications = await getNotifications();
  notifications.unshift(notification);
  saveNotificationsToStorage(notifications);
  
  // Deliver the notification based on delivery methods
  await deliverNotification(notification, typePrefs.deliveryMethods);
  
  return notification;
};

/**
 * Deliver a notification via specified delivery methods
 */
export const deliverNotification = async (
  notification: Notification, 
  deliveryMethods: NotificationDeliveryMethod[]
): Promise<NotificationDeliveryResponse[]> => {
  const responses: NotificationDeliveryResponse[] = [];
  
  for (const method of deliveryMethods) {
    try {
      const timestamp = new Date().toISOString();
      
      switch (method) {
        case 'in_app':
          // In-app notifications are automatically stored and displayed
          // No additional action needed
          responses.push({
            success: true,
            notificationId: notification.id,
            deliveryMethod: method,
            timestamp
          });
          break;
          
        case 'push':
          // Future implementation - push notifications
          console.log('Push notifications not yet implemented');
          responses.push({
            success: false,
            notificationId: notification.id,
            deliveryMethod: method,
            timestamp,
            error: 'Push notifications not yet implemented'
          });
          break;
          
        case 'email':
          // Future implementation - email notifications
          console.log('Email notifications not yet implemented');
          responses.push({
            success: false,
            notificationId: notification.id,
            deliveryMethod: method,
            timestamp,
            error: 'Email notifications not yet implemented'
          });
          break;
          
        case 'sms':
          // Future implementation - SMS notifications
          console.log('SMS notifications not yet implemented');
          responses.push({
            success: false,
            notificationId: notification.id,
            deliveryMethod: method,
            timestamp,
            error: 'SMS notifications not yet implemented'
          });
          break;
          
        default:
          responses.push({
            success: false,
            notificationId: notification.id,
            deliveryMethod: method,
            timestamp,
            error: `Unknown delivery method: ${method}`
          });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      responses.push({
        success: false,
        notificationId: notification.id,
        deliveryMethod: method,
        timestamp: new Date().toISOString(),
        error: errorMessage
      });
    }
  }
  
  return responses;
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  const notifications = await getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  
  if (index === -1) {
    return false;
  }
  
  notifications[index].isRead = true;
  saveNotificationsToStorage(notifications);
  return true;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  const notifications = await getNotifications();
  
  const updatedNotifications = notifications.map(n => ({
    ...n,
    isRead: true
  }));
  
  saveNotificationsToStorage(updatedNotifications);
  return true;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (id: string): Promise<boolean> => {
  const notifications = await getNotifications();
  const filteredNotifications = notifications.filter(n => n.id !== id);
  
  if (filteredNotifications.length === notifications.length) {
    return false; // No notification was deleted
  }
  
  saveNotificationsToStorage(filteredNotifications);
  return true;
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (): Promise<boolean> => {
  saveNotificationsToStorage([]);
  return true;
};

/**
 * Get notification preferences for the current user
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  if (USE_MOCK_NOTIFICATIONS) {
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Try to load from localStorage first
    const storedPrefs = loadPreferencesFromStorage();
    if (storedPrefs) {
      return storedPrefs;
    }
    
    // Return default preferences
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
  
  // In a real implementation, this would fetch from a database/API
  // For now, we'll use localStorage or defaults
  const storedPrefs = loadPreferencesFromStorage();
  if (storedPrefs) {
    return storedPrefs;
  }
  
  // Save default preferences for future use
  savePreferencesToStorage(DEFAULT_NOTIFICATION_PREFERENCES);
  return DEFAULT_NOTIFICATION_PREFERENCES;
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
  const currentPrefs = await getNotificationPreferences();
  
  // Merge the new preferences with the current ones
  const updatedPrefs: NotificationPreferences = {
    ...currentPrefs,
    ...preferences,
    typePreferences: {
      ...currentPrefs.typePreferences,
      ...(preferences.typePreferences || {})
    }
  };
  
  savePreferencesToStorage(updatedPrefs);
  return updatedPrefs;
};

/**
 * Group notifications by type for UI display
 */
export const getNotificationGroups = async (): Promise<NotificationGroup[]> => {
  const notifications = await getNotifications();
  const groupMap: Record<string, NotificationGroup> = {};
  
  for (const notification of notifications) {
    if (!groupMap[notification.type]) {
      groupMap[notification.type] = {
        type: notification.type,
        count: 0,
        notifications: [],
        latestNotification: notification
      };
    }
    
    groupMap[notification.type].count++;
    groupMap[notification.type].notifications.push(notification);
    
    // Update latest notification if this one is newer
    if (new Date(notification.createdAt).getTime() > 
        new Date(groupMap[notification.type].latestNotification.createdAt).getTime()) {
      groupMap[notification.type].latestNotification = notification;
    }
  }
  
  return Object.values(groupMap);
};

/**
 * Generate a task notification based on a scheduled task
 */
export const createTaskNotification = async (
  taskId: string,
  taskTitle: string,
  dueDate: string,
  priority: 'low' | 'medium' | 'high'
): Promise<Notification | null> => {
  const notificationPriority: NotificationPriority = 
    priority === 'high' ? 'high' : 
    priority === 'medium' ? 'medium' : 'low';
  
  return createNotification({
    type: 'scheduled_task',
    title: `Task reminder: ${taskTitle}`,
    message: `Your task "${taskTitle}" is scheduled for ${new Date(dueDate).toLocaleDateString()}.`,
    priority: notificationPriority,
    relatedEntityId: taskId,
    relatedEntityType: 'task',
    actionUrl: '/dashboard/tasks',
    metadata: {
      taskId,
      dueDate
    }
  });
};

/**
 * Generate a weather alert notification
 */
export const createWeatherAlertNotification = async (
  alert: string,
  details: string,
  severity: 'low' | 'medium' | 'high' | 'urgent'
): Promise<Notification | null> => {
  return createNotification({
    type: 'weather_alert',
    title: `Weather alert: ${alert}`,
    message: details,
    priority: severity as NotificationPriority,
    actionUrl: '/dashboard/weather',
    metadata: {
      alertType: alert,
      severity
    }
  });
};

/**
 * Generate a watering event notification
 */
export const createWateringEventNotification = async (
  scheduleId: string,
  eventType: 'scheduled' | 'adjusted' | 'completed',
  details: {
    date: string;
    zones?: string[];
    adjustmentReason?: string;
    waterSaved?: number;
  }
): Promise<Notification | null> => {
  let title = '';
  let message = '';
  
  switch (eventType) {
    case 'scheduled':
      title = 'Watering scheduled';
      message = `Watering is scheduled for ${new Date(details.date).toLocaleDateString()}.`;
      break;
    case 'adjusted':
      title = 'Watering schedule adjusted';
      message = `Your watering schedule has been adjusted${details.adjustmentReason ? ` due to ${details.adjustmentReason}` : ''}.`;
      if (details.waterSaved) {
        message += ` ${details.waterSaved} gallons of water saved!`;
      }
      break;
    case 'completed':
      title = 'Watering completed';
      message = `Watering has been completed for ${details.zones?.join(', ') || 'your lawn'}.`;
      break;
  }
  
  return createNotification({
    type: 'watering_event',
    title,
    message,
    priority: eventType === 'adjusted' ? 'high' : 'medium',
    relatedEntityId: scheduleId,
    relatedEntityType: 'watering_schedule',
    actionUrl: '/dashboard/watering',
    metadata: {
      scheduleId,
      eventType,
      ...details
    }
  });
};

/**
 * Clear the notification cache
 */
export const clearNotificationCache = (): void => {
  try {
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    console.log('Notification cache cleared');
  } catch (error) {
    console.error('Error clearing notification cache:', error);
  }
};

/**
 * Initialize the notification system by setting up event handlers
 * and checking for pending notifications
 */
export const initializeNotificationSystem = async (): Promise<void> => {
  console.log('Initializing notification system');
  
  // Get user preferences to ensure they're saved to storage
  await getNotificationPreferences();
  
  // Load notifications to ensure they're saved to storage
  await getNotifications();
  
  // In a real implementation, this would set up event listeners
  // for various services that trigger notifications
  
  console.log('Notification system initialized');
};