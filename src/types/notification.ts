/**
 * TypeScript interfaces for the notification system
 * Defines the core structures for managing various notification types
 */

/**
 * Base notification interface defining the common structure for all notifications
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

/**
 * Supported notification types
 */
export type NotificationType =
  | 'scheduled_task'      // Task reminder or notification
  | 'weather_alert'       // Weather warning or condition alert
  | 'watering_event'      // Watering schedule notification
  | 'watering_reminder'   // Reminder for upcoming watering event
  | 'watering_completed'  // Notification for completed watering
  | 'watering_cancelled'  // Notification for cancelled watering
  | 'seasonal_tip'        // Seasonal lawn care advice
  | 'progress_update'     // Lawn progress milestone
  | 'system_alert';       // System-level alert

/**
 * Priority levels for notifications
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Status of notifications for read/unread filtering
 */
export type NotificationReadStatus = 'read' | 'unread' | 'all';

/**
 * Delivery methods for notifications
 */
export type NotificationDeliveryMethod = 'in_app' | 'push' | 'email' | 'sms';

/**
 * Filter options for querying notifications
 */
export interface NotificationFilterOptions {
  types?: NotificationType[];
  readStatus?: NotificationReadStatus;
  priorities?: NotificationPriority[];
  dateRange?: {
    from: string;
    to: string;
  };
  limit?: number;
}

/**
 * Event trigger for notification creation
 */
export interface NotificationTriggerEvent {
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  expiresAt?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  actionUrl?: string;
}

/**
 * Response from notification delivery attempt
 */
export interface NotificationDeliveryResponse {
  success: boolean;
  notificationId: string;
  deliveryMethod: NotificationDeliveryMethod;
  timestamp: string;
  error?: string;
}

/**
 * Grouped notifications for organizational display
 */
export interface NotificationGroup {
  id?: string;
  title?: string;
  type: NotificationType | 'mixed';
  count: number;
  notifications: Notification[];
  latestTimestamp?: string;
  latestNotification: Notification;
}

/**
 * User preferences for notification settings
 */
export interface NotificationPreferences {
  enabled: boolean;
  deliveryMethods: NotificationDeliveryMethod[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  typePreferences: Record<NotificationType, {
    enabled: boolean;
    priority: NotificationPriority;
    deliveryMethods: NotificationDeliveryMethod[];
  }>;
  wateringNotificationSettings?: {
    reminderTiming: ('day_before' | 'morning_of' | 'hour_before')[];
    notifyOnCompletion: boolean;
    notifyOnCancellation: boolean;
    notifyOnAdjustment: boolean;
    minRainfallToNotify: number; // in inches
  };
}

/**
 * Task notification specific data
 */
export interface TaskNotification extends Notification {
  type: 'scheduled_task';
  metadata: {
    taskId: string;
    dueDate: string;
    category?: string;
  };
}

/**
 * Weather alert notification specific data
 */
export interface WeatherAlertNotification extends Notification {
  type: 'weather_alert';
  metadata: {
    condition: string;
    temperature?: number;
    alert?: string;
    duration?: string;
  };
}

/**
 * Base interface for all watering-related notifications
 */
export interface BaseWateringNotification extends Notification {
  type: 'watering_event' | 'watering_reminder' | 'watering_completed' | 'watering_cancelled';
  metadata: {
    scheduleId: string;
    scheduledDate: string;
    startTime: string;
    zones: string[];
    waterAmount?: number; // in gallons
  };
}

/**
 * Watering event notification - used for general watering events
 */
export interface WateringEventNotification extends BaseWateringNotification {
  type: 'watering_event';
  metadata: {
    scheduleId: string;
    scheduledDate: string;
    startTime: string;
    zones: string[];
    status: 'scheduled' | 'adjusted' | 'completed' | 'skipped';
    adjustmentReason?: string;
    waterSaved?: number; // in gallons
    originalDate?: string;
    originalTime?: string;
  };
}

/**
 * Watering reminder notification - used for upcoming watering events
 */
export interface WateringReminderNotification extends BaseWateringNotification {
  type: 'watering_reminder';
  metadata: {
    scheduleId: string;
    scheduledDate: string;
    startTime: string;
    zones: string[];
    timeUntil: string; // "1 day", "4 hours", etc.
    waterAmount: number; // in gallons
    weatherForecast?: string;
    temperature?: number;
  };
}

/**
 * Watering completed notification - used when watering is finished
 */
export interface WateringCompletedNotification extends BaseWateringNotification {
  type: 'watering_completed';
  metadata: {
    scheduleId: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    zones: string[];
    waterAmount: number; // in gallons
    duration: number; // in minutes
  };
}

/**
 * Watering cancelled notification - used when watering is cancelled
 */
export interface WateringCancelledNotification extends BaseWateringNotification {
  type: 'watering_cancelled';
  metadata: {
    scheduleId: string;
    scheduledDate: string;
    startTime: string;
    zones: string[];
    cancellationReason: string;
    rainfall?: number; // in inches
    waterSaved: number; // in gallons
  };
}

/**
 * Seasonal tip notification specific data
 */
export interface SeasonalTipNotification extends Notification {
  type: 'seasonal_tip';
  metadata: {
    season: 'spring' | 'summer' | 'fall' | 'winter';
    lawnArea?: string;
  };
}

/**
 * Progress update notification specific data
 */
export interface ProgressUpdateNotification extends Notification {
  type: 'progress_update';
  metadata: {
    improvementPercentage?: number;
    comparisonPhotoIds?: string[];
    metric?: string;
  };
}

/**
 * System alert notification specific data
 */
export interface SystemAlertNotification extends Notification {
  type: 'system_alert';
  metadata: {
    errorCode?: string;
    component?: string;
    actionRequired?: boolean;
  };
}