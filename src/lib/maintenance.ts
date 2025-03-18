import { MaintenanceTaskResponse, ScheduledTaskResponse } from "@/types/maintenance";
import { WeatherData } from "@/types/weather";

interface WeatherCheck {
  isValid: boolean;
  reason?: string;
}

export function checkWeatherConditions(
  task: MaintenanceTaskResponse,
  weather: WeatherData
): WeatherCheck {
  const weatherFactors = task.weatherFactors as {
    temperature?: { min: number; max: number };
    precipitation?: { chance: number; intensity: number };
    wind?: { speed: number };
  };

  // If no weather factors defined, task can be done in any weather
  if (!weatherFactors) {
    return { isValid: true };
  }

  // Check temperature range
  if (weatherFactors.temperature) {
    const { min, max } = weatherFactors.temperature;
    if (weather.temperature < min) {
      return {
        isValid: false,
        reason: `Temperature too low (${weather.temperature}°C < ${min}°C)`,
      };
    }
    if (weather.temperature > max) {
      return {
        isValid: false,
        reason: `Temperature too high (${weather.temperature}°C > ${max}°C)`,
      };
    }
  }

  // Check precipitation
  if (weatherFactors.precipitation) {
    const { chance, intensity } = weatherFactors.precipitation;
    if (weather.precipitation > chance) {
      return {
        isValid: false,
        reason: `Precipitation chance too high (${weather.precipitation}% > ${chance}%)`,
      };
    }
    // Could add intensity check if weather API provides it
  }

  // Check wind speed
  if (weatherFactors.wind && weather.windSpeed > weatherFactors.wind.speed) {
    return {
      isValid: false,
      reason: `Wind speed too high (${weather.windSpeed}m/s > ${weatherFactors.wind.speed}m/s)`,
    };
  }

  return { isValid: true };
}

export function isTaskInSeason(task: MaintenanceTaskResponse): boolean {
  const currentMonth = new Date().getMonth();
  const seasons = task.seasonality;

  // Map months to seasons
  const seasonMap = {
    winter: [11, 0, 1],
    spring: [2, 3, 4],
    summer: [5, 6, 7],
    fall: [8, 9, 10],
  };

  return seasons.some((season) => 
    seasonMap[season as keyof typeof seasonMap].includes(currentMonth)
  );
}

export function shouldRescheduleTask(
  task: MaintenanceTaskResponse,
  scheduledTask: ScheduledTaskResponse,
  weather: WeatherData
): boolean {
  // Don't reschedule if task is already completed or manually rescheduled
  if (
    scheduledTask.status === "completed" ||
    scheduledTask.status === "rescheduled"
  ) {
    return false;
  }

  // Check if task is in season
  if (!isTaskInSeason(task)) {
    return true;
  }

  // Check weather conditions
  const weatherCheck = checkWeatherConditions(task, weather);
  return !weatherCheck.isValid;
}

export function getNextAvailableDate(
  task: MaintenanceTaskResponse,
  currentDate: Date,
  forecast: WeatherData[]
): Date | null {
  // Start checking from tomorrow
  let checkDate = new Date(currentDate);
  checkDate.setDate(checkDate.getDate() + 1);

  // Look through next 5 days (assuming that's our forecast range)
  for (let i = 0; i < 5; i++) {
    const dayForecast = forecast.find(
      (f) => new Date(f.date).toDateString() === checkDate.toDateString()
    );

    if (dayForecast) {
      const weatherCheck = checkWeatherConditions(task, dayForecast);
      if (weatherCheck.isValid && isTaskInSeason(task)) {
        return checkDate;
      }
    }

    checkDate.setDate(checkDate.getDate() + 1);
  }

  // If no suitable date found in forecast range
  return null;
}

export function getPriorityScore(task: MaintenanceTaskResponse): number {
  const priorityScores = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return priorityScores[task.priority as keyof typeof priorityScores] || 0;
}

export function sortTasksByPriority(tasks: MaintenanceTaskResponse[]): MaintenanceTaskResponse[] {
  return [...tasks].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
}