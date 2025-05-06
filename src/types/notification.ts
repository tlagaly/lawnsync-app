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
  | 'scheduled_task'     // Task reminder or notification
  | 'weather_alert'      // Weather warning or condition alert
  | 'watering_event'     // Watering schedule notification
  | 'seasonal_tip'       // Seasonal lawn care advice
  | 'progress_update'    // Lawn progress milestone
  | 'system_alert';      // System-level alert

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
 * Watering event notification specific data
 */
export interface WateringEventNotification extends Notification {
  type: 'watering_event';
  metadata: {
    scheduleId: string;
    status: 'scheduled' | 'adjusted' | 'completed' | 'skipped';
    adjustmentReason?: string;
    waterSaved?: number;
    zones?: string[];
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