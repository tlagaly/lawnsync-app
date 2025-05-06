import { createNotification } from './notificationService';
import type {
  Notification,
  NotificationTriggerEvent,
  NotificationPriority
} from '../types/notification';
import type { WateringSchedule } from '../types/watering';
import type { WeatherData } from './weatherService';
import type { ScheduledTask } from '../types/scheduler';

/**
 * Create a notification for a watering schedule
 */
export const notifyWateringScheduled = async (schedule: WateringSchedule): Promise<Notification | null> => {
  const date = new Date(schedule.scheduledDate);
  const formattedDate = formatDate(date);
  
  const event: NotificationTriggerEvent = {
    type: 'watering_event',
    title: `Watering scheduled for ${formattedDate}`,
    message: `Your lawn is scheduled to be watered on ${formattedDate} at ${schedule.startTime}. This will water ${schedule.zones.length} zone(s) for ${schedule.duration} minutes.`,
    priority: 'medium',
    relatedEntityId: schedule.id.toString(),
    relatedEntityType: 'watering_schedule',
    actionUrl: '/dashboard/watering',
    metadata: {
      scheduleId: schedule.id.toString(),
      status: 'scheduled',
      zones: schedule.zones.map(z => z.name)
    }
  };
  
  return createNotification(event);
};

/**
 * Create a notification for an adjusted watering schedule
 */
export const notifyWateringAdjusted = async (
  schedule: WateringSchedule, 
  reason: string,
  waterSaved?: number
): Promise<Notification | null> => {
  const date = new Date(schedule.scheduledDate);
  const formattedDate = formatDate(date);
  
  let message = `Your watering schedule for ${formattedDate} has been adjusted due to ${reason}.`;
  
  if (waterSaved) {
    message += ` This adjustment will save approximately ${waterSaved} gallons of water.`;
  }
  
  const event: NotificationTriggerEvent = {
    type: 'watering_event',
    title: `Watering schedule adjusted`,
    message,
    priority: 'medium',
    relatedEntityId: schedule.id.toString(),
    relatedEntityType: 'watering_schedule',
    actionUrl: '/dashboard/watering',
    metadata: {
      scheduleId: schedule.id.toString(),
      status: 'adjusted',
      adjustmentReason: reason,
      waterSaved,
      originalDate: schedule.originalDate
    }
  };
  
  return createNotification(event);
};

/**
 * Create a notification for a completed watering schedule
 */
export const notifyWateringCompleted = async (schedule: WateringSchedule): Promise<Notification | null> => {
  const date = new Date(schedule.scheduledDate);
  const formattedDate = formatDate(date);
  
  const event: NotificationTriggerEvent = {
    type: 'watering_event',
    title: `Watering completed`,
    message: `Watering scheduled for ${formattedDate} has been completed. ${schedule.zones.length} zone(s) were watered for a total of ${schedule.duration} minutes.`,
    priority: 'low',
    relatedEntityId: schedule.id.toString(),
    relatedEntityType: 'watering_schedule',
    actionUrl: '/dashboard/watering',
    metadata: {
      scheduleId: schedule.id.toString(),
      status: 'completed',
      zones: schedule.zones.map(z => z.name)
    }
  };
  
  return createNotification(event);
};

/**
 * Create a notification for a weather alert
 */
export const notifyWeatherAlert = async (
  weatherData: WeatherData, 
  severity: NotificationPriority
): Promise<Notification | null> => {
  let title = '';
  let message = '';
  
  // Determine title and message based on weather conditions
  if (weatherData.current.condition.toLowerCase().includes('storm') || 
      weatherData.current.condition.toLowerCase().includes('thunder')) {
    title = 'Storm Warning';
    message = `A storm is currently in your area. Consider moving lawn equipment indoors and checking for any potential hazards.`;
  } else if (weatherData.current.condition.toLowerCase().includes('heavy rain')) {
    title = 'Heavy Rain Alert';
    message = `Heavy rain is occurring in your area. Your lawn's watering schedule may be automatically adjusted.`;
  } else if (weatherData.current.temp < 32) {
    title = 'Freeze Warning';
    message = `Temperatures are below freezing. Consider protecting sensitive plants and checking irrigation systems.`;
  } else if (weatherData.current.temp > 95) {
    title = 'Extreme Heat Alert';
    message = `Extreme heat detected. Your lawn may need additional watering. Consider watering during early morning or evening.`;
  } else if (weatherData.current.windSpeed > 20) {
    title = 'High Wind Alert';
    message = `High winds detected in your area. Avoid fertilizing or applying treatments until conditions improve.`;
  } else if (weatherData.forecast.some(day => 
      day.condition.toLowerCase().includes('storm') && ['Today', 'Tomorrow'].includes(day.day))) {
    title = 'Upcoming Storm Alert';
    message = `A storm is forecasted for ${weatherData.forecast.find(day => 
      day.condition.toLowerCase().includes('storm') && ['Today', 'Tomorrow'].includes(day.day))?.day}. Plan your lawn care activities accordingly.`;
  } else {
    // Generic weather alert
    title = 'Weather Update';
    message = `Current conditions may affect your lawn. ${weatherData.current.condition} with a temperature of ${weatherData.current.temp}°F.`;
  }
  
  const event: NotificationTriggerEvent = {
    type: 'weather_alert',
    title,
    message,
    priority: severity,
    actionUrl: '/dashboard/weather',
    metadata: {
      condition: weatherData.current.condition,
      temperature: weatherData.current.temp,
      humidity: weatherData.current.humidity,
      windSpeed: weatherData.current.windSpeed,
      icon: weatherData.current.icon
    }
  };
  
  return createNotification(event);
};

/**
 * Create a notification for a task reminder
 */
export const notifyTaskReminder = async (
  taskId: string,
  taskTitle: string,
  dueDate: string,
  priority: NotificationPriority = 'medium'
): Promise<Notification | null> => {
  const event: NotificationTriggerEvent = {
    type: 'scheduled_task',
    title: `Task Reminder: ${taskTitle}`,
    message: `Don't forget to complete "${taskTitle}" by ${formatDate(new Date(dueDate))}.`,
    priority,
    relatedEntityId: taskId,
    relatedEntityType: 'task',
    actionUrl: '/dashboard/tasks',
    metadata: {
      taskId,
      dueDate
    }
  };
  
  return createNotification(event);
};

/**
 * Create a notification for a seasonal tip
 */
export const notifySeasonalTip = async (
  tip: string,
  season: 'spring' | 'summer' | 'fall' | 'winter',
  area?: string
): Promise<Notification | null> => {
  const event: NotificationTriggerEvent = {
    type: 'seasonal_tip',
    title: `${season.charAt(0).toUpperCase() + season.slice(1)} Lawn Care Tip`,
    message: tip,
    priority: 'low',
    actionUrl: '/dashboard/recommendations',
    metadata: {
      season,
      lawnArea: area
    }
  };
  
  return createNotification(event);
};

/**
 * Create a progress update notification
 */
export const notifyProgressUpdate = async (
  message: string,
  improvementPercentage?: number,
  comparisonPhotoIds?: string[]
): Promise<Notification | null> => {
  const event: NotificationTriggerEvent = {
    type: 'progress_update',
    title: 'Lawn Progress Update',
    message,
    priority: 'low',
    actionUrl: '/dashboard/progress',
    metadata: {
      improvementPercentage,
      comparisonPhotoIds
    }
  };
  
  return createNotification(event);
};

/**
 * Create a notification for a newly created task
 */
export const notifyTaskCreated = async (
  task: ScheduledTask
): Promise<Notification | null> => {
  const event: NotificationTriggerEvent = {
    type: 'scheduled_task',
    title: `New Task Created: ${task.title}`,
    message: `A new task "${task.title}" has been added to your schedule for ${formatDate(new Date(task.dueDate))}.`,
    priority: 'medium',
    relatedEntityId: task.id.toString(),
    relatedEntityType: 'task',
    actionUrl: '/dashboard/tasks',
    metadata: {
      taskId: task.id,
      dueDate: task.dueDate,
      category: task.category
    }
  };
  
  return createNotification(event);
};

/**
 * Create a notification for a task that is due soon
 */
export const notifyTaskDueSoon = async (
  task: ScheduledTask,
  daysRemaining: number
): Promise<Notification | null> => {
  const event: NotificationTriggerEvent = {
    type: 'scheduled_task',
    title: `Task Due Soon: ${task.title}`,
    message: `Your task "${task.title}" is due ${daysRemaining === 0 ? 'today' : 
              daysRemaining === 1 ? 'tomorrow' : 
              `in ${daysRemaining} days`} (${formatDate(new Date(task.dueDate))}).`,
    priority: daysRemaining === 0 ? 'high' : 'medium',
    relatedEntityId: task.id.toString(),
    relatedEntityType: 'task',
    actionUrl: '/dashboard/tasks',
    metadata: {
      taskId: task.id,
      dueDate: task.dueDate,
      daysRemaining
    }
  };
  
  return createNotification(event);
};

/**
 * Create a notification for a rescheduled task
 */
export const notifyTaskRescheduled = async (
  task: ScheduledTask,
  originalDate: string,
  reason?: string
): Promise<Notification | null> => {
  let message = `Your task "${task.title}" has been rescheduled from ${formatDate(new Date(originalDate))} to ${formatDate(new Date(task.dueDate))}.`;
  
  if (reason) {
    message += ` Reason: ${reason}.`;
  }
  
  const event: NotificationTriggerEvent = {
    type: 'scheduled_task',
    title: `Task Rescheduled: ${task.title}`,
    message,
    priority: 'medium',
    relatedEntityId: task.id.toString(),
    relatedEntityType: 'task',
    actionUrl: '/dashboard/tasks',
    metadata: {
      taskId: task.id,
      dueDate: task.dueDate,
      originalDate,
      reason
    }
  };
  
  return createNotification(event);
};

/**
 * Helper function to generate a DateUtils module for date formatting if it doesn't exist
 * This is a placeholder that will be replaced by actual implementation
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(date);
}