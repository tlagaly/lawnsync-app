import { render } from '@react-email/render';
import TaskReminder from '@/components/emails/task-reminder';
import WeatherAlert from '@/components/emails/weather-alert';
import WeeklySummary from '@/components/emails/weekly-summary';
import CareRecommendations from '@/components/emails/care-recommendations';
import type { NotificationType } from '@/types/notifications';

interface RenderEmailOptions {
  type: NotificationType;
  data: any; // Type will be inferred based on the notification type
}

/**
 * Render an email template based on the notification type
 */
export async function renderEmailTemplate({ type, data }: RenderEmailOptions): Promise<string> {
  switch (type) {
    case 'task_reminder':
      return await render(TaskReminder(data));

    case 'weather_alert':
      return await render(WeatherAlert(data));

    case 'weekly_summary':
      return await render(WeeklySummary(data));

    case 'care_recommendation':
      return await render(CareRecommendations(data));

    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}

/**
 * Type guard for task reminder data
 */
export function isTaskReminderData(data: any): data is {
  taskName: string;
  scheduledDate: Date;
  userName: string;
  lawnLocation: string;
} {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.taskName === 'string' &&
    data.scheduledDate instanceof Date &&
    typeof data.userName === 'string' &&
    typeof data.lawnLocation === 'string'
  );
}

/**
 * Type guard for weather alert data
 */
export function isWeatherAlertData(data: any): data is {
  userName: string;
  lawnLocation: string;
  condition: string;
  affectedTasks: Array<{
    name: string;
    scheduledDate: Date;
  }>;
} {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.userName === 'string' &&
    typeof data.lawnLocation === 'string' &&
    typeof data.condition === 'string' &&
    Array.isArray(data.affectedTasks) &&
    data.affectedTasks.every(
      (task: any) =>
        typeof task === 'object' &&
        task !== null &&
        typeof task.name === 'string' &&
        task.scheduledDate instanceof Date
    )
  );
}

/**
 * Type guard for weekly summary data
 */
export function isWeeklySummaryData(data: any): data is {
  userName: string;
  weekStartDate: Date;
  weekEndDate: Date;
  completedTasks: Array<{
    name: string;
    completedDate: Date;
    duration?: number;
  }>;
  upcomingTasks: Array<{
    name: string;
    scheduledDate: Date;
    priority: 'high' | 'medium' | 'low';
  }>;
  weatherForecast: {
    condition: string;
    temperature: string;
  };
} {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.userName === 'string' &&
    data.weekStartDate instanceof Date &&
    data.weekEndDate instanceof Date &&
    Array.isArray(data.completedTasks) &&
    Array.isArray(data.upcomingTasks) &&
    typeof data.weatherForecast === 'object' &&
    data.weatherForecast !== null &&
    typeof data.weatherForecast.condition === 'string' &&
    typeof data.weatherForecast.temperature === 'string'
  );
}

/**
 * Type guard for care recommendations data
 */
export function isCareRecommendationsData(data: any): data is {
  userName: string;
  grassType: string;
  season: string;
  recommendations: Array<{
    title: string;
    description: string;
    importance: 'essential' | 'recommended' | 'optional';
  }>;
  products?: Array<{
    name: string;
    description: string;
    purpose: string;
  }>;
} {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.userName === 'string' &&
    typeof data.grassType === 'string' &&
    typeof data.season === 'string' &&
    Array.isArray(data.recommendations) &&
    data.recommendations.every(
      (rec: any) =>
        typeof rec === 'object' &&
        rec !== null &&
        typeof rec.title === 'string' &&
        typeof rec.description === 'string' &&
        ['essential', 'recommended', 'optional'].includes(rec.importance)
    ) &&
    (!data.products ||
      (Array.isArray(data.products) &&
        data.products.every(
          (product: any) =>
            typeof product === 'object' &&
            product !== null &&
            typeof product.name === 'string' &&
            typeof product.description === 'string' &&
            typeof product.purpose === 'string'
        )))
  );
}