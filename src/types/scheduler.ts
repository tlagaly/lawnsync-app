/**
 * Type definitions for the TaskScheduler system
 */

import type { WeatherData } from "../lib/weatherService";

/**
 * Interface for scheduled tasks, extending the existing Task interface
 * with scheduling and weather-related properties
 */
export interface ScheduledTask {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  scheduledDate: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  isCompleted: boolean;
  icon: string;
  isWeatherAppropriate?: boolean;
  weatherCondition?: string;
  suggestedDate?: string;
  rescheduledCount?: number;
}

/**
 * Interface to map task categories to optimal weather conditions
 */
export interface WeatherCompatibility {
  category: string;
  optimalConditions: string[];
  incompatibleConditions: string[];
  temperatureRange: {
    min: number;
    max: number;
  };
  requiresDry: boolean;
  requiresSunny: boolean;
  minDaysWithoutRain: number;
}

/**
 * Interface for the Calendar view data structure
 */
export interface CalendarViewData {
  month: number;
  year: number;
  days: CalendarDay[];
}

/**
 * Interface for a single day in the calendar view
 */
export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  dayOfWeek: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: ScheduledTask[];
  weather?: {
    condition: string;
    high: number;
    low: number;
    icon: string;
  };
  isWeatherAppropriate?: boolean;
}

/**
 * Interface for task scheduling recommendations
 */
export interface TaskSchedulingRecommendation {
  taskId: number;
  originalDate: string;
  recommendedDate: string;
  reason: string;
  weatherData: {
    condition: string;
    temperature: number;
    icon: string;
  };
  score: number; // 0-100 score indicating how optimal the recommendation is
}

/**
 * Configuration options for the task scheduler
 */
export interface TaskSchedulerOptions {
  maxDaysToLookAhead: number;
  useWeatherForecast: boolean;
  minScoreThreshold: number;
  rescheduleAutomatically: boolean;
}