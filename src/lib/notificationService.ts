/**
 * NotificationService - Handles notification creation, delivery, and management
 * Implements a mock/real toggle pattern for testing and production
 */

import { 
  getFCMToken,
  initializeNotifications
} from './notificationIntegration';
import type {
  Notification,
  NotificationFilterOptions,
  NotificationPreferences,
  NotificationTriggerEvent,
  NotificationDeliveryMethod,
  NotificationType,
  NotificationDeliveryResponse,
  NotificationGroup
} from '../types/notification';
import { v4 as uuidv4 } from 'uuid';

// Toggle between mock and real implementation
const USE_MOCK_NOTIFICATIONS = true;

// Default notification storage keys
const NOTIFICATION_STORAGE_KEY = 'lawnSync_notifications';
const NOTIFICATION_PREFS_KEY = 'lawnSync_notificationPrefs';

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
    scheduled_task: {
      enabled: true,
      priority: 'medium',
      deliveryMethods: ['in_app', 'push']
    },
    weather_alert: {
      enabled: true,
      priority: 'high',
      deliveryMethods: ['in_app', 'push']
    },
    watering_event: {
      enabled: true,
      priority: 'medium',
      deliveryMethods: ['in_app', 'push']
    },
    watering_reminder: {
      enabled: true,
      priority: 'medium',
      deliveryMethods: ['in_app', 'push']
    },
    watering_completed: {
      enabled: true,
      priority: 'low',
      deliveryMethods: ['in_app']
    },
    watering_cancelled: {
      enabled: true,
      priority: 'medium',
      deliveryMethods: ['in_app', 'push']
    },
    seasonal_tip: {
      enabled: true,
      priority: 'low',
      deliveryMethods: ['in_app']
    },
    progress_update: {
      enabled: true,
      priority: 'low',
      deliveryMethods: ['in_app']
    },
    system_alert: {
      enabled: true,
      priority: 'high',
      deliveryMethods: ['in_app', 'push']
    }
  },
  wateringNotificationSettings: {
    reminderTiming: ['day_before', 'morning_of'],
    notifyOnCompletion: true,
    notifyOnCancellation: true,
    notifyOnAdjustment: true,
    minRainfallToNotify: 0.25
  }
};

/**
 * Initialize the notification system
 */
export const initializeNotificationSystem = async (): Promise<boolean> => {
  // First check if we already have notification preferences
  const existingPrefs = await getNotificationPreferences();
  if (!existingPrefs || !existingPrefs.typePreferences) {
    // If not, initialize with default preferences
    await setStoredNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
  }

  // Initialize Firebase Cloud Messaging if needed
  if (!USE_MOCK_NOTIFICATIONS) {
    return initializeNotifications();
  }
  
  console.log('Using mock notification system');
  return true;
};

// STORAGE-RELATED FUNCTIONS

/**
 * Get stored notifications from local storage
 */
export const getStoredNotifications = (): Notification[] => {
  try {
    const storedData = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error retrieving stored notifications:', error);
  }
  return [];
};

/**
 * Set stored notifications in local storage
 */
export const setStoredNotifications = (notifications: Notification[]): void => {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error storing notifications:', error);
  }
};

/**
 * Get stored notification preferences from local storage
 */
export const getStoredNotificationPreferences = (): NotificationPreferences => {
  try {
    const storedData = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error retrieving notification preferences:', error);
  }
  return DEFAULT_NOTIFICATION_PREFERENCES;
};

/**
 * Set stored notification preferences in local storage
 */
export const setStoredNotificationPreferences = (preferences: NotificationPreferences): void => {
  try {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error storing notification preferences:', error);
  }
};

/**
 * Clear notification cache (useful for testing)
 */
export const clearNotificationCache = (): void => {
  try {
    localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing notification cache:', error);
  }
};

// MOCK IMPLEMENTATION FUNCTIONS

/**
 * Create a mock notification
 */
const createMockNotification = async (
  event: NotificationTriggerEvent
): Promise<Notification> => {
  const preferences = await getNotificationPreferences();
  
  // Check if notifications are enabled globally
  if (!preferences.enabled) {
    throw new Error('Notifications are disabled');
  }
  
  // Check if this notification type is enabled
  const typeSettings = preferences.typePreferences[event.type];
  if (!typeSettings || !typeSettings.enabled) {
    throw new Error(`Notifications of type ${event.type} are disabled`);
  }
  
  // Check quiet hours
  if (preferences.quietHours.enabled && 
      event.priority !== 'urgent' && 
      isInQuietHours(preferences.quietHours.start, preferences.quietHours.end)) {
    throw new Error('Cannot send non-urgent notifications during quiet hours');
  }
  
  // Create the notification
  const notification: Notification = {
    id: uuidv4(),
    type: event.type,
    title: event.title,
    message: event.message,
    createdAt: new Date().toISOString(),
    priority: event.priority || typeSettings.priority,
    isRead: false,
    actionUrl: event.actionUrl,
    metadata: event.metadata || {},
    expiresAt: event.expiresAt,
    relatedEntityId: event.relatedEntityId,
    relatedEntityType: event.relatedEntityType
  };
  
  // Add to stored notifications
  const notifications = getStoredNotifications();
  setStoredNotifications([notification, ...notifications]);
  
  // Simulate push notification for 'push' delivery method
  if (typeSettings.deliveryMethods.includes('push') && 
      preferences.deliveryMethods.includes('push')) {
    console.log('MOCK - Sending push notification:', {
      title: notification.title,
      body: notification.message
    });
  }
  
  // Log notification creation
  console.log('MOCK - Created notification:', notification);
  
  return notification;
};

/**
 * Get mock notifications with filtering
 */
const getMockNotifications = async (
  options?: NotificationFilterOptions
): Promise<Notification[]> => {
  let notifications = getStoredNotifications();
  
  // Apply filters if provided
  if (options) {
    // Filter by type
    if (options.types && options.types.length > 0) {
      notifications = notifications.filter(n => options.types!.includes(n.type));
    }
    
    // Filter by read status
    if (options.readStatus) {
      if (options.readStatus === 'read') {
        notifications = notifications.filter(n => n.isRead);
      } else if (options.readStatus === 'unread') {
        notifications = notifications.filter(n => !n.isRead);
      }
    }
    
    // Filter by priority
    if (options.priorities && options.priorities.length > 0) {
      notifications = notifications.filter(n => options.priorities!.includes(n.priority));
    }
    
    // Filter by date range
    if (options.dateRange) {
      const fromDate = new Date(options.dateRange.from).getTime();
      const toDate = new Date(options.dateRange.to).getTime();
      
      notifications = notifications.filter(n => {
        const notificationDate = new Date(n.createdAt).getTime();
        return notificationDate >= fromDate && notificationDate <= toDate;
      });
    }
    
    // Apply limit
    if (options.limit && options.limit > 0) {
      notifications = notifications.slice(0, options.limit);
    }
  }
  
  return notifications;
};

/**
 * Group mock notifications by type
 */
const groupMockNotifications = async (
  notifications: Notification[]
): Promise<NotificationGroup[]> => {
  const groupMap: Record<string, NotificationGroup> = {};
  
  // Group notifications by type
  for (const notification of notifications) {
    if (!groupMap[notification.type]) {
      groupMap[notification.type] = {
        id: notification.type,
        title: getNotificationTypeTitle(notification.type),
        type: notification.type,
        count: 0,
        notifications: [],
        latestNotification: notification
      };
    }
    
    const group = groupMap[notification.type];
    group.notifications.push(notification);
    group.count++;
    
    // Update latest timestamp
    const notificationDate = new Date(notification.createdAt);
    const latestDate = group.latestTimestamp 
      ? new Date(group.latestTimestamp) 
      : new Date(0);
    
    if (notificationDate > latestDate) {
      group.latestTimestamp = notification.createdAt;
      group.latestNotification = notification;
    }
  }
  
  // Convert map to array and sort by latest timestamp
  return Object.values(groupMap).sort((a, b) => {
    const dateA = a.latestTimestamp ? new Date(a.latestTimestamp).getTime() : 0;
    const dateB = b.latestTimestamp ? new Date(b.latestTimestamp).getTime() : 0;
    return dateB - dateA;
  });
};

/**
 * Mark mock notification as read
 */
const markMockNotificationAsRead = async (
  notificationId: string
): Promise<Notification | null> => {
  const notifications = getStoredNotifications();
  const index = notifications.findIndex(n => n.id === notificationId);
  
  if (index === -1) {
    return null;
  }
  
  const updatedNotification = {
    ...notifications[index],
    isRead: true
  };
  
  notifications[index] = updatedNotification;
  setStoredNotifications(notifications);
  
  return updatedNotification;
};

/**
 * Delete mock notification
 */
const deleteMockNotification = async (
  notificationId: string
): Promise<boolean> => {
  const notifications = getStoredNotifications();
  const updatedNotifications = notifications.filter(n => n.id !== notificationId);
  
  if (updatedNotifications.length === notifications.length) {
    return false;
  }
  
  setStoredNotifications(updatedNotifications);
  return true;
};

/**
 * Mark all mock notifications as read
 */
const markAllMockNotificationsAsRead = async (): Promise<number> => {
  const notifications = getStoredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const updatedNotifications = notifications.map(notification => ({
    ...notification,
    isRead: true
  }));
  
  setStoredNotifications(updatedNotifications);
  return unreadCount;
};

/**
 * Get mock notification preferences
 */
const getMockNotificationPreferences = async (): Promise<NotificationPreferences> => {
  return getStoredNotificationPreferences();
};

/**
 * Update mock notification preferences
 */
const updateMockNotificationPreferences = async (
  preferencesUpdate: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  const currentPreferences = getStoredNotificationPreferences();
  
  // Ensure wateringNotificationSettings is properly initialized if missing
  const currentWateringSettings = currentPreferences.wateringNotificationSettings || {
    reminderTiming: ['day_before'],
    notifyOnCompletion: true,
    notifyOnCancellation: true,
    notifyOnAdjustment: true,
    minRainfallToNotify: 0.25
  };

  // Merge the updates with current preferences
  const updatedPreferences: NotificationPreferences = {
    ...currentPreferences,
    ...preferencesUpdate,
    // Handle nested objects
    quietHours: {
      ...currentPreferences.quietHours,
      ...(preferencesUpdate.quietHours || {})
    },
    typePreferences: {
      ...currentPreferences.typePreferences,
      ...(preferencesUpdate.typePreferences || {})
    },
    wateringNotificationSettings: {
      ...currentWateringSettings,
      ...(preferencesUpdate.wateringNotificationSettings || {}),
      // Ensure reminderTiming is always an array
      reminderTiming: preferencesUpdate.wateringNotificationSettings?.reminderTiming ||
                      currentWateringSettings.reminderTiming
    }
  };
  
  setStoredNotificationPreferences(updatedPreferences);
  return updatedPreferences;
};

// REAL IMPLEMENTATION FUNCTIONS
// Note: These would connect to your backend notification service
// For now they're mostly stubs that would need to be implemented with a real backend

/**
 * Create a real notification
 */
const createRealNotification = async (
  event: NotificationTriggerEvent
): Promise<Notification> => {
  // This would call your backend API to create a notification
  // For now, let's use the mock implementation
  return createMockNotification(event);
};

/**
 * Get real notifications with filtering
 */
const getRealNotifications = async (
  options?: NotificationFilterOptions
): Promise<Notification[]> => {
  // This would call your backend API to get notifications
  // For now, let's use the mock implementation
  return getMockNotifications(options);
};

/**
 * Group real notifications by type
 */
const groupRealNotifications = async (
  notifications: Notification[]
): Promise<NotificationGroup[]> => {
  // This would call your backend API to group notifications
  // For now, let's use the mock implementation
  return groupMockNotifications(notifications);
};

/**
 * Mark real notification as read
 */
const markRealNotificationAsRead = async (
  notificationId: string
): Promise<Notification | null> => {
  // This would call your backend API to mark a notification as read
  // For now, let's use the mock implementation
  return markMockNotificationAsRead(notificationId);
};

/**
 * Delete real notification
 */
const deleteRealNotification = async (
  notificationId: string
): Promise<boolean> => {
  // This would call your backend API to delete a notification
  // For now, let's use the mock implementation
  return deleteMockNotification(notificationId);
};

/**
 * Mark all real notifications as read
 */
const markAllRealNotificationsAsRead = async (): Promise<number> => {
  // This would call your backend API to mark all notifications as read
  // For now, let's use the mock implementation
  return markAllMockNotificationsAsRead();
};

/**
 * Get real notification preferences
 */
const getRealNotificationPreferences = async (): Promise<NotificationPreferences> => {
  // This would call your backend API to get notification preferences
  // For now, let's use the mock implementation
  return getMockNotificationPreferences();
};

/**
 * Update real notification preferences
 */
const updateRealNotificationPreferences = async (
  preferencesUpdate: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  // This would call your backend API to update notification preferences
  // For now, let's use the mock implementation
  return updateMockNotificationPreferences(preferencesUpdate);
};

// HELPER FUNCTIONS

/**
 * Check if current time is in quiet hours
 */
const isInQuietHours = (startTime: string, endTime: string): boolean => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Convert all times to minutes since midnight for easier comparison
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  const currentMinutes = currentHour * 60 + currentMinute;
  
  // Handle the case where end time is earlier than start time (spans midnight)
  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
  
  // Normal case
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

/**
 * Get human-readable title for notification type
 */
const getNotificationTypeTitle = (type: NotificationType): string => {
  switch (type) {
    case 'scheduled_task':
      return 'Task Reminders';
    case 'weather_alert':
      return 'Weather Alerts';
    case 'watering_event':
      return 'Watering Events';
    case 'watering_reminder':
      return 'Watering Reminders';
    case 'watering_completed':
      return 'Watering Completed';
    case 'watering_cancelled':
      return 'Watering Cancelled';
    case 'seasonal_tip':
      return 'Seasonal Tips';
    case 'progress_update':
      return 'Progress Updates';
    case 'system_alert':
      return 'System Alerts';
    default:
      return 'Notifications';
  }
};

// PUBLIC API FUNCTIONS
// These are exported and switch between mock/real implementations

/**
 * Create a notification
 */
export const createNotification = async (
  event: NotificationTriggerEvent
): Promise<Notification> => {
  if (USE_MOCK_NOTIFICATIONS) {
    return createMockNotification(event);
  } else {
    return createRealNotification(event);
  }
};

/**
 * Get notifications with optional filtering
 */
export const getNotifications = async (
  options?: NotificationFilterOptions
): Promise<Notification[]> => {
  if (USE_MOCK_NOTIFICATIONS) {
    return getMockNotifications(options);
  } else {
    return getRealNotifications(options);
  }
};

/**
 * Group notifications by type
 */
export const groupNotifications = async (
  notifications: Notification[]
): Promise<NotificationGroup[]> => {
  if (USE_MOCK_NOTIFICATIONS) {
    return groupMockNotifications(notifications);
  } else {
    return groupRealNotifications(notifications);
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<Notification | null> => {
  if (USE_MOCK_NOTIFICATIONS) {
    return markMockNotificationAsRead(notificationId);
  } else {
    return markRealNotificationAsRead(notificationId);
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (
  notificationId: string
): Promise<boolean> => {
  if (USE_MOCK_NOTIFICATIONS) {
    return deleteMockNotification(notificationId);
  } else {
    return deleteRealNotification(notificationId);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<number> => {
  if (USE_MOCK_NOTIFICATIONS) {
    return markAllMockNotificationsAsRead();
  } else {
    return markAllRealNotificationsAsRead();
  }
};

/**
 * Get notification preferences
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  if (USE_MOCK_NOTIFICATIONS) {
    return getMockNotificationPreferences();
  } else {
    return getRealNotificationPreferences();
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (
  preferencesUpdate: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  if (USE_MOCK_NOTIFICATIONS) {
    return updateMockNotificationPreferences(preferencesUpdate);
  } else {
    return updateRealNotificationPreferences(preferencesUpdate);
  }
};