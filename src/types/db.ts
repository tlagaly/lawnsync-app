import { PrismaClient } from '@prisma/client';

/**
 * Database client type
 */
export type DatabaseClient = PrismaClient;

/**
 * Database model types based on Prisma schema
 */

export interface LawnProfile {
  id: string;
  size: number;
  grassType: string;
  sunExposure: string;
  location: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  estimatedTime: number;
  priority: TaskPriority;
  weatherFactors: any; // JSON
  seasonality: string[];
  products?: any; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduledTask {
  id: string;
  taskId: string;
  lawnProfileId: string;
  scheduledDate: Date;
  status: TaskStatus;
  weatherAdjusted: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskHistory {
  id: string;
  scheduledTaskId: string;
  lawnProfileId: string;
  completedDate: Date;
  duration?: number;
  notes?: string;
  weather: any; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  status: string;
  subject: string;
  content: string;
  metadata?: any; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskPriority {
  high = "high",
  medium = "medium",
  low = "low",
}

export enum TaskStatus {
  pending = "pending",
  completed = "completed",
  skipped = "skipped",
  rescheduled = "rescheduled",
}

export enum NotificationType {
  task_reminder = "task_reminder",
  weather_alert = "weather_alert",
  weekly_summary = "weekly_summary",
  care_recommendation = "care_recommendation",
}