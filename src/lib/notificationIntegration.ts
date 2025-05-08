/**
 * Notification integration module
 * 
 * This module handles the connection between various services and notification delivery.
 * It implements a facade over the base notification service to enable domain-specific 
 * notification handling.
 */

import { initializeMessaging } from './firebase';
import {
  createNotification,
  clearNotificationCache,
  getNotificationPreferences,
  updateNotificationPreferences,
  markNotificationAsRead,
  getNotifications
} from './notificationService';
import type {
  NotificationPreferences,
  NotificationType,
  NotificationDeliveryMethod,
  NotificationTriggerEvent,
  Notification,
  WateringReminderNotification,
  WateringEventNotification,
  WateringCompletedNotification,
  WateringCancelledNotification
} from '../types/notification';
import type { WateringSchedule, WateringZone } from '../types/watering';
import { getWeatherForLocation } from './weatherService';
import { v4 as uuidv4 } from 'uuid';

// Default notification storage key
const FCM_TOKEN_STORAGE_KEY = 'lawnSync_fcmToken';

// Toggle between mock and real implementation
const USE_MOCK_NOTIFICATIONS = true;

/**
 * Initialize notification system including Firebase Cloud Messaging
 */
export const initializeNotifications = async (): Promise<boolean> => {
  try {
    // Initialize Firebase Cloud Messaging if available
    // This will return null for unsupported browsers or if FCM is disabled
    const fcmToken = await initializeMessaging();
    
    if (fcmToken) {
      // Store the token for later use
      localStorage.setItem(FCM_TOKEN_STORAGE_KEY, fcmToken);
      console.log('Notification system initialized with FCM');
    } else {
      console.log('Notification system initialized without FCM (using in-app only)');
    }
    
    // Set up default notification preferences if they don't exist
    const preferences = await getNotificationPreferences();
    if (!preferences.wateringNotificationSettings) {
      await updateNotificationPreferences({
        wateringNotificationSettings: {
          reminderTiming: ['day_before', 'morning_of'],
          notifyOnCompletion: true,
          notifyOnCancellation: true,
          notifyOnAdjustment: true,
          minRainfallToNotify: 0.25
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing notification system:', error);
    return false;
  }
};

/**
 * Get the FCM token if available
 */
export const getFCMToken = (): string | null => {
  try {
    return localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error retrieving FCM token:', error);
    return null;
  }
};

/**
 * Clear FCM token (useful for logout)
 */
export const clearFCMToken = (): void => {
  try {
    localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing FCM token:', error);
  }
};

/**
 * Check if push notifications are supported and enabled
 */
export const arePushNotificationsEnabled = async (): Promise<boolean> => {
  try {
    // Check if browser supports service workers and notification API
    const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    
    if (!pushSupported) {
      return false;
    }
    
    // Check if permissions are granted
    const permission = await Notification.requestPermission();
    const permissionGranted = permission === 'granted';
    
    // Check if we have an FCM token
    const hasToken = !!getFCMToken();
    
    // Check if user has enabled push notifications in preferences
    const preferences = await getNotificationPreferences();
    const userEnabled = preferences.enabled && 
      preferences.deliveryMethods.includes('push');
    
    return permissionGranted && hasToken && userEnabled;
  } catch (error) {
    console.error('Error checking push notification status:', error);
    return false;
  }
};

/**
 * Request permission for push notifications
 */
export const requestPushNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Initialize FCM and save token
      await initializeNotifications();
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Creates a watering reminder notification based on upcoming watering schedule
 */
export const createWateringReminderNotification = async (
  wateringSchedule: WateringSchedule,
  reminderType: 'day_before' | 'morning_of' | 'hour_before'
): Promise<WateringReminderNotification | null> => {
  const preferences = await getNotificationPreferences();
  
  // Ensure watering notifications are enabled
  if (!preferences.typePreferences.watering_reminder?.enabled) {
    return null;
  }
  
  // Calculate time until watering
  const scheduleDate = new Date(wateringSchedule.scheduledDate);
  const timeUntilText = reminderType === 'day_before'
    ? '1 day'
    : reminderType === 'morning_of'
      ? 'today'
      : '1 hour';
      
  // Get weather forecast for the scheduled day if available
  let weatherText = '';
  let temperature: number | undefined = undefined;
  try {
    // This would normally get the location from the user profile
    const mockLocation = 'Chicago, IL';
    const weather = await getWeatherForLocation(mockLocation);
    
    if (weather) {
      // Find forecast for the scheduled day
      const scheduleDateString = wateringSchedule.scheduledDate;
      const forecast = weather.forecast.find(f =>
        f.day === scheduleDateString);
        
      if (forecast) {
        weatherText = forecast.condition;
        temperature = forecast.high;
      }
    }
  } catch (error) {
    console.error('Error getting weather forecast for watering reminder:', error);
  }
  
  // Calculate water amount (simplified)
  const waterAmount = wateringSchedule.zones.reduce((total, zone) => {
    return total + zone.area * zone.wateringDepth * 0.623; // Gallons per square foot
  }, 0);
  
  // Create notification event
  const zoneNames = wateringSchedule.zones.map(z => z.name).join(', ');
  const event: NotificationTriggerEvent = {
    type: 'watering_reminder',
    title: `Watering reminder: ${timeUntilText}`,
    message: `Scheduled watering for ${zoneNames} ${reminderType === 'day_before' ? 'tomorrow' : reminderType === 'morning_of' ? 'today' : 'in 1 hour'}`,
    priority: 'medium',
    actionUrl: '/dashboard/watering',
    relatedEntityId: String(wateringSchedule.id),
    relatedEntityType: 'watering_schedule',
    metadata: {
      scheduleId: String(wateringSchedule.id),
      scheduledDate: wateringSchedule.scheduledDate,
      startTime: wateringSchedule.startTime,
      zones: wateringSchedule.zones.map(z => z.name),
      timeUntil: timeUntilText,
      waterAmount: Math.round(waterAmount),
      weatherForecast: weatherText || undefined,
      temperature: temperature
    }
  };
  
  // Create and return the notification
  const notification = await createNotification(event);
  return notification as WateringReminderNotification | null;
};

/**
 * Creates a watering event notification (for adjustments, etc.)
 */
export const createWateringEventNotification = async (
  wateringSchedule: WateringSchedule,
  adjustmentReason?: string
): Promise<WateringEventNotification | null> => {
  const preferences = await getNotificationPreferences();
  
  // Ensure watering event notifications are enabled
  if (!preferences.typePreferences.watering_event?.enabled) {
    return null;
  }
  
  // Skip if adjustment notifications are disabled
  if (wateringSchedule.isAdjusted && 
      !preferences.wateringNotificationSettings?.notifyOnAdjustment) {
    return null;
  }
  
  // Create notification event
  const zoneNames = wateringSchedule.zones.map(z => z.name).join(', ');
  const event: NotificationTriggerEvent = {
    type: 'watering_event',
    title: wateringSchedule.isAdjusted 
      ? 'Watering schedule adjusted' 
      : 'Watering scheduled',
    message: wateringSchedule.isAdjusted
      ? `Your watering schedule for ${zoneNames} has been adjusted${adjustmentReason ? ` due to ${adjustmentReason}` : ''}.`
      : `Watering scheduled for ${zoneNames} on ${new Date(wateringSchedule.scheduledDate).toLocaleDateString()}.`,
    priority: wateringSchedule.isAdjusted ? 'high' : 'medium',
    actionUrl: '/dashboard/watering',
    relatedEntityId: String(wateringSchedule.id),
    relatedEntityType: 'watering_schedule',
    metadata: {
      scheduleId: String(wateringSchedule.id),
      scheduledDate: wateringSchedule.scheduledDate,
      startTime: wateringSchedule.startTime,
      zones: wateringSchedule.zones.map(z => z.name),
      status: wateringSchedule.isAdjusted ? 'adjusted' : 'scheduled',
      adjustmentReason: adjustmentReason || wateringSchedule.adjustmentReason,
      waterSaved: wateringSchedule.waterSaved,
      originalDate: wateringSchedule.originalDate
    }
  };
  
  // Create and return the notification
  const notification = await createNotification(event);
  return notification as WateringEventNotification | null;
};

/**
 * Creates a watering completed notification
 */
export const createWateringCompletedNotification = async (
  wateringSchedule: WateringSchedule
): Promise<WateringCompletedNotification | null> => {
  const preferences = await getNotificationPreferences();
  
  // Skip if completion notifications are disabled
  if (!preferences.wateringNotificationSettings?.notifyOnCompletion) {
    return null;
  }
  
  // Calculate end time (start time + duration)
  const [hours, minutes] = wateringSchedule.startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + wateringSchedule.duration * 60000);
  const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  
  // Calculate water amount (simplified)
  const waterAmount = wateringSchedule.zones.reduce((total, zone) => {
    return total + zone.area * zone.wateringDepth * 0.623; // Gallons per square foot
  }, 0);
  
  // Create notification event
  const zoneNames = wateringSchedule.zones.map(z => z.name).join(', ');
  const event: NotificationTriggerEvent = {
    type: 'watering_completed',
    title: 'Watering completed',
    message: `Watering has been completed for ${zoneNames}.`,
    priority: 'low',
    actionUrl: '/dashboard/watering',
    relatedEntityId: String(wateringSchedule.id),
    relatedEntityType: 'watering_schedule',
    metadata: {
      scheduleId: String(wateringSchedule.id),
      scheduledDate: wateringSchedule.scheduledDate,
      startTime: wateringSchedule.startTime,
      endTime: endTime,
      zones: wateringSchedule.zones.map(z => z.name),
      waterAmount: Math.round(waterAmount),
      duration: wateringSchedule.duration
    }
  };
  
  // Create and return the notification
  const notification = await createNotification(event);
  return notification as WateringCompletedNotification | null;
};

/**
 * Creates a watering cancelled notification
 */
export const createWateringCancelledNotification = async (
  wateringSchedule: WateringSchedule,
  cancellationReason: string,
  rainfall?: number
): Promise<WateringCancelledNotification | null> => {
  const preferences = await getNotificationPreferences();
  
  // Skip if cancellation notifications are disabled
  if (!preferences.wateringNotificationSettings?.notifyOnCancellation) {
    return null;
  }
  
  // Skip if rainfall is below the notification threshold
  if (rainfall && rainfall < (preferences.wateringNotificationSettings?.minRainfallToNotify || 0)) {
    return null;
  }
  
  // Calculate water saved (simplified)
  const waterSaved = wateringSchedule.zones.reduce((total, zone) => {
    return total + zone.area * zone.wateringDepth * 0.623; // Gallons per square foot
  }, 0);
  
  // Create notification event
  const zoneNames = wateringSchedule.zones.map(z => z.name).join(', ');
  const event: NotificationTriggerEvent = {
    type: 'watering_cancelled',
    title: 'Watering cancelled',
    message: `Watering for ${zoneNames} has been cancelled due to ${cancellationReason}${rainfall ? `. ${Math.round(waterSaved)} gallons of water saved!` : ''}`,
    priority: 'medium',
    actionUrl: '/dashboard/watering',
    relatedEntityId: String(wateringSchedule.id),
    relatedEntityType: 'watering_schedule',
    metadata: {
      scheduleId: String(wateringSchedule.id),
      scheduledDate: wateringSchedule.scheduledDate,
      startTime: wateringSchedule.startTime,
      zones: wateringSchedule.zones.map(z => z.name),
      cancellationReason: cancellationReason,
      rainfall: rainfall,
      waterSaved: Math.round(waterSaved)
    }
  };
  
  // Create and return the notification
  const notification = await createNotification(event);
  return notification as WateringCancelledNotification | null;
};

/**
 * Schedule watering reminders for a watering event
 */
export const scheduleWateringReminders = async (
  wateringSchedule: WateringSchedule
): Promise<void> => {
  try {
    const preferences = await getNotificationPreferences();
    const reminderTiming = preferences.wateringNotificationSettings?.reminderTiming || [];
    
    if (!preferences.enabled || !preferences.typePreferences.watering_reminder?.enabled) {
      console.log('Watering reminders are disabled in user preferences');
      return;
    }
    
    // Check if any reminders are configured
    if (reminderTiming.length === 0) {
      console.log('No watering reminder timings configured');
      return;
    }
    
    // Check if watering already happened
    const scheduleDate = new Date(wateringSchedule.scheduledDate);
    const now = new Date();
    if (scheduleDate < now) {
      console.log('Watering date is in the past, not scheduling reminders');
      return;
    }
    
    console.log(`Scheduling watering reminders for schedule #${wateringSchedule.id}`);
    
    // Schedule day-before reminder if enabled
    if (reminderTiming.includes('day_before')) {
      const oneDayBefore = new Date(scheduleDate);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      
      if (oneDayBefore > now) {
        // If this were a real implementation, we would actually schedule this
        // For this mock implementation, we'll just create the notification immediately
        if (USE_MOCK_NOTIFICATIONS) {
          await createWateringReminderNotification(wateringSchedule, 'day_before');
        } else {
          // In a real implementation, we would store this schedule for later processing
          console.log(`Scheduled day-before reminder for ${oneDayBefore.toISOString()}`);
        }
      }
    }
    
    // Schedule morning-of reminder if enabled
    if (reminderTiming.includes('morning_of')) {
      const morningOf = new Date(scheduleDate);
      morningOf.setHours(8, 0, 0, 0); // 8:00 AM
      
      if (morningOf > now) {
        // If this were a real implementation, we would actually schedule this
        if (USE_MOCK_NOTIFICATIONS) {
          await createWateringReminderNotification(wateringSchedule, 'morning_of');
        } else {
          console.log(`Scheduled morning-of reminder for ${morningOf.toISOString()}`);
        }
      }
    }
    
    // Schedule hour-before reminder if enabled
    if (reminderTiming.includes('hour_before')) {
      const [hours, minutes] = wateringSchedule.startTime.split(':').map(Number);
      const startDateTime = new Date(scheduleDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const oneHourBefore = new Date(startDateTime.getTime() - 60 * 60 * 1000);
      
      if (oneHourBefore > now) {
        // If this were a real implementation, we would actually schedule this
        if (USE_MOCK_NOTIFICATIONS) {
          await createWateringReminderNotification(wateringSchedule, 'hour_before');
        } else {
          console.log(`Scheduled hour-before reminder for ${oneHourBefore.toISOString()}`);
        }
      }
    }
  } catch (error) {
    console.error('Error scheduling watering reminders:', error);
  }
};

/**
 * Cancel all watering reminders for a specific schedule
 */
export const cancelWateringReminders = async (
  scheduleId: number
): Promise<void> => {
  try {
    // Get all notifications
    const notifications = await getNotifications({
      types: ['watering_reminder'],
    });
    
    // Filter for unread notifications related to this schedule
    const scheduleReminders = notifications.filter(
      n => !n.isRead && 
      n.metadata?.scheduleId === String(scheduleId)
    );
    
    // Mark them all as read to "cancel" them
    for (const notification of scheduleReminders) {
      await markNotificationAsRead(notification.id);
    }
    
    console.log(`Cancelled ${scheduleReminders.length} watering reminders for schedule #${scheduleId}`);
  } catch (error) {
    console.error('Error cancelling watering reminders:', error);
  }
};

/**
 * Process watering schedule for notification generation
 * This is the main entry point for creating notifications from watering schedules
 */
export const processWateringScheduleNotifications = async (
  wateringSchedule: WateringSchedule,
  action: 'create' | 'update' | 'cancel' | 'complete'
): Promise<void> => {
  try {
    const preferences = await getNotificationPreferences();
    
    if (!preferences.enabled) {
      console.log('Notifications are disabled in user preferences');
      return;
    }
    
    switch (action) {
      case 'create':
        // New watering schedule created
        await createWateringEventNotification(wateringSchedule);
        await scheduleWateringReminders(wateringSchedule);
        break;
        
      case 'update':
        // Watering schedule updated (e.g. due to rainfall forecast)
        if (wateringSchedule.isAdjusted) {
          await createWateringEventNotification(wateringSchedule, wateringSchedule.adjustmentReason);
          
          // Reschedule reminders if the date/time changed
          await cancelWateringReminders(wateringSchedule.id);
          await scheduleWateringReminders(wateringSchedule);
        }
        break;
        
      case 'cancel':
        // Watering cancelled (e.g. due to rainfall)
        await cancelWateringReminders(wateringSchedule.id);
        
        // Create cancellation notification
        // For simplicity, we'll assume rainfall as the reason
        const rainfall = 0.5; // Example rainfall in inches
        await createWateringCancelledNotification(
          wateringSchedule, 
          'forecasted rainfall',
          rainfall
        );
        break;
        
      case 'complete':
        // Watering completed
        await cancelWateringReminders(wateringSchedule.id);
        
        // Mark schedule as completed
        const completedSchedule = {
          ...wateringSchedule,
          isCompleted: true
        };
        
        await createWateringCompletedNotification(completedSchedule);
        break;
    }
  } catch (error) {
    console.error('Error processing watering schedule notifications:', error);
  }
};