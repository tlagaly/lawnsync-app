export type NotificationType = 'task_reminder' | 'weather_alert' | 'weekly_summary' | 'care_recommendation';

export type NotificationStatus = 'sent' | 'failed' | 'delivered';

export interface NotificationPreferences {
  id: string;
  userId: string;
  taskReminders: boolean;
  weatherAlerts: boolean;
  weeklySummary: boolean;
  careRecommendations: boolean;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationHistory {
  id: string;
  userId: string;
  type: NotificationType;
  status: NotificationStatus;
  subject: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailOptions {
  to: string;
  subject: string;
  content: string;
  metadata?: Record<string, any>;
}