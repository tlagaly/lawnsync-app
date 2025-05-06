import { mockTasks } from '../features/dashboard/mockData';
import type { WeatherData } from './weatherService';
import { getWeatherForLocation, getWeatherBasedLawnTip } from './weatherService';
import type { 
  ScheduledTask, 
  WeatherCompatibility, 
  TaskSchedulingRecommendation,
  TaskSchedulerOptions
} from '../types/scheduler';

// Toggle between mock and real implementation
const USE_MOCK_SCHEDULER = true;

// Default scheduler options
const DEFAULT_SCHEDULER_OPTIONS: TaskSchedulerOptions = {
  maxDaysToLookAhead: 14,
  useWeatherForecast: true,
  minScoreThreshold: 70,
  rescheduleAutomatically: false
};

// Cache mechanism for scheduled tasks
interface TaskSchedulerCache {
  tasks: ScheduledTask[];
  lastUpdated: number;
}

// LocalStorage key for persistence
const STORAGE_KEY = 'lawnSync_scheduledTasks';

// Weather compatibility mapping for task categories
const WEATHER_COMPATIBILITY: WeatherCompatibility[] = [
  {
    category: 'mowing',
    optimalConditions: ['Clear', 'Sunny', 'Partly Cloudy'],
    incompatibleConditions: ['Rain', 'Thunderstorm', 'Snow'],
    temperatureRange: { min: 50, max: 85 },
    requiresDry: true,
    requiresSunny: false,
    minDaysWithoutRain: 1
  },
  {
    category: 'watering',
    optimalConditions: ['Clear', 'Sunny'],
    incompatibleConditions: ['Rain', 'Thunderstorm', 'Drizzle'],
    temperatureRange: { min: 60, max: 95 },
    requiresDry: true,
    requiresSunny: false,
    minDaysWithoutRain: 2
  },
  {
    category: 'fertilizing',
    optimalConditions: ['Clear', 'Sunny', 'Partly Cloudy', 'Cloudy'],
    incompatibleConditions: ['Heavy Rain', 'Thunderstorm'],
    temperatureRange: { min: 55, max: 80 },
    requiresDry: false,
    requiresSunny: false,
    minDaysWithoutRain: 0
  },
  {
    category: 'weed-control',
    optimalConditions: ['Clear', 'Sunny', 'Partly Cloudy'],
    incompatibleConditions: ['Rain', 'Thunderstorm', 'Snow', 'Windy'],
    temperatureRange: { min: 60, max: 85 },
    requiresDry: true,
    requiresSunny: false,
    minDaysWithoutRain: 1
  },
  {
    category: 'soil-health',
    optimalConditions: ['Clear', 'Sunny', 'Partly Cloudy', 'Cloudy'],
    incompatibleConditions: [],
    temperatureRange: { min: 45, max: 90 },
    requiresDry: false,
    requiresSunny: false,
    minDaysWithoutRain: 0
  }
];

// Cache for scheduled tasks
let taskCache: TaskSchedulerCache | null = null;

/**
 * Loads scheduled tasks from localStorage
 */
const loadTasksFromStorage = (): ScheduledTask[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error loading tasks from storage:', error);
  }
  return [];
};

/**
 * Saves scheduled tasks to localStorage
 */
const saveTasksToStorage = (tasks: ScheduledTask[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to storage:', error);
  }
};

/**
 * Gets all scheduled tasks
 */
export const getScheduledTasks = async (): Promise<ScheduledTask[]> => {
  if (USE_MOCK_SCHEDULER) {
    console.log('Using mock task scheduler data');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Convert regular tasks to scheduled tasks with additional properties
    const scheduledTasks: ScheduledTask[] = mockTasks.map(task => ({
      ...task,
      // Type assertion to ensure priority matches the union type
      priority: task.priority as 'high' | 'medium' | 'low',
      scheduledDate: task.dueDate,
      isWeatherAppropriate: Math.random() > 0.3, // Randomly set weather appropriateness
      weatherCondition: Math.random() > 0.5 ? 'Sunny' : 'Partly Cloudy',
      rescheduledCount: 0
    }));
    
    return scheduledTasks;
  }
  
  // Check if we have cached data
  if (taskCache && (Date.now() - taskCache.lastUpdated < 60000)) { // 1 minute cache
    return taskCache.tasks;
  }
  
  // Load from localStorage if no cache
  const tasks = loadTasksFromStorage();
  
  // Update cache
  taskCache = {
    tasks,
    lastUpdated: Date.now()
  };
  
  return tasks;
};

/**
 * Creates a new scheduled task
 */
export const createScheduledTask = async (task: Omit<ScheduledTask, 'id'>): Promise<ScheduledTask> => {
  const tasks = await getScheduledTasks();
  
  // Generate new ID
  const newId = tasks.length > 0 
    ? Math.max(...tasks.map(t => t.id)) + 1 
    : 1;
  
  const newTask: ScheduledTask = {
    ...task,
    id: newId,
    rescheduledCount: 0
  };
  
  // Add the new task
  const updatedTasks = [...tasks, newTask];
  
  if (!USE_MOCK_SCHEDULER) {
    saveTasksToStorage(updatedTasks);
    
    // Update cache
    if (taskCache) {
      taskCache.tasks = updatedTasks;
      taskCache.lastUpdated = Date.now();
    }
  } else {
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Created mock scheduled task:', newTask);
  }
  
  return newTask;
};

/**
 * Updates an existing scheduled task
 */
export const updateScheduledTask = async (updatedTask: ScheduledTask): Promise<ScheduledTask> => {
  const tasks = await getScheduledTasks();
  
  const updatedTasks = tasks.map(task => 
    task.id === updatedTask.id ? updatedTask : task
  );
  
  if (!USE_MOCK_SCHEDULER) {
    saveTasksToStorage(updatedTasks);
    
    // Update cache
    if (taskCache) {
      taskCache.tasks = updatedTasks;
      taskCache.lastUpdated = Date.now();
    }
  } else {
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Updated mock scheduled task:', updatedTask);
  }
  
  return updatedTask;
};

/**
 * Deletes a scheduled task
 */
export const deleteScheduledTask = async (taskId: number): Promise<boolean> => {
  const tasks = await getScheduledTasks();
  
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  
  if (updatedTasks.length === tasks.length) {
    return false; // Task not found
  }
  
  if (!USE_MOCK_SCHEDULER) {
    saveTasksToStorage(updatedTasks);
    
    // Update cache
    if (taskCache) {
      taskCache.tasks = updatedTasks;
      taskCache.lastUpdated = Date.now();
    }
  } else {
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Deleted mock scheduled task with ID:', taskId);
  }
  
  return true;
};

/**
 * Gets tasks that are appropriate for current weather conditions
 */
export const getWeatherCompatibleTasks = async (
  location: string,
  options?: Partial<TaskSchedulerOptions>
): Promise<ScheduledTask[]> => {
  const tasks = await getScheduledTasks();
  const mergedOptions = { ...DEFAULT_SCHEDULER_OPTIONS, ...options };
  
  // If weather forecast isn't available or option is disabled, return all tasks
  if (!mergedOptions.useWeatherForecast) {
    return tasks;
  }
  
  try {
    // Get weather data
    const weatherData = await getWeatherForLocation(location);
    
    // Update the weather appropriateness of each task
    const updatedTasks = tasks.map(task => {
      const isAppropriate = isTaskWeatherAppropriate(task, weatherData);
      return {
        ...task,
        isWeatherAppropriate: isAppropriate,
        weatherCondition: weatherData.current.condition
      };
    });
    
    if (!USE_MOCK_SCHEDULER) {
      // Save the updated weather appropriateness
      saveTasksToStorage(updatedTasks);
      
      // Update cache
      if (taskCache) {
        taskCache.tasks = updatedTasks;
        taskCache.lastUpdated = Date.now();
      }
    }
    
    return updatedTasks;
  } catch (error) {
    console.error('Error getting weather-compatible tasks:', error);
    return tasks;
  }
};

/**
 * Calculates if a task is appropriate for the given weather conditions
 */
const isTaskWeatherAppropriate = (task: ScheduledTask, weatherData: WeatherData): boolean => {
  // Find the compatibility settings for the task category
  const compatibility = WEATHER_COMPATIBILITY.find(c => c.category === task.category);
  
  if (!compatibility) {
    return true; // If no specific compatibility found, assume it's appropriate
  }
  
  const { current, forecast, rainfall } = weatherData;
  
  // Check temperature range
  const tempInRange = current.temp >= compatibility.temperatureRange.min && 
                     current.temp <= compatibility.temperatureRange.max;
  
  // Check conditions
  const isIncompatibleCondition = compatibility.incompatibleConditions.some(
    cond => current.condition.includes(cond)
  );
  
  // Check if it's optimal
  const isOptimalCondition = compatibility.optimalConditions.some(
    cond => current.condition.includes(cond)
  );
  
  // Check rainfall requirements
  const hasSufficientDryPeriod = rainfall.last7Days < 2; // Simplified check
  
  // Logic for determining appropriateness
  if (isIncompatibleCondition) {
    return false;
  }
  
  if (compatibility.requiresDry && !hasSufficientDryPeriod) {
    return false;
  }
  
  if (!tempInRange) {
    return false;
  }
  
  // If we reach here, the task is generally appropriate
  return true;
};

/**
 * Suggests optimal timing for a task based on weather forecast
 */
export const suggestOptimalTiming = async (
  task: ScheduledTask,
  location: string,
  options?: Partial<TaskSchedulerOptions>
): Promise<TaskSchedulingRecommendation[]> => {
  const mergedOptions = { ...DEFAULT_SCHEDULER_OPTIONS, ...options };
  
  if (USE_MOCK_SCHEDULER) {
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock recommendations
    const mockRecommendations: TaskSchedulingRecommendation[] = [
      {
        taskId: task.id,
        originalDate: task.scheduledDate,
        recommendedDate: addDays(new Date(), 2).toISOString().split('T')[0],
        reason: "Optimal temperature and dry conditions",
        weatherData: {
          condition: "Sunny",
          temperature: 75,
          icon: "sun"
        },
        score: 95
      },
      {
        taskId: task.id,
        originalDate: task.scheduledDate,
        recommendedDate: addDays(new Date(), 4).toISOString().split('T')[0],
        reason: "Clear weather with moderate temperature",
        weatherData: {
          condition: "Partly Cloudy",
          temperature: 72,
          icon: "cloud-sun"
        },
        score: 85
      }
    ];
    
    return mockRecommendations;
  }
  
  // Get weather data for looking ahead
  const weatherData = await getWeatherForLocation(location);
  
  // Find the compatibility settings for the task category
  const compatibility = WEATHER_COMPATIBILITY.find(c => c.category === task.category);
  
  if (!compatibility || !weatherData.forecast || weatherData.forecast.length === 0) {
    return [];
  }
  
  // Calculate scores for each day in the forecast
  const recommendations: TaskSchedulingRecommendation[] = [];
  
  weatherData.forecast.forEach((day, index) => {
    if (index >= mergedOptions.maxDaysToLookAhead) {
      return; // Skip if beyond look ahead period
    }
    
    // Calculate a score based on weather conditions
    let score = 0;
    
    // Temperature score (0-40 points)
    const tempMidpoint = (compatibility.temperatureRange.min + compatibility.temperatureRange.max) / 2;
    const tempRange = compatibility.temperatureRange.max - compatibility.temperatureRange.min;
    const tempDiff = Math.abs(day.high - tempMidpoint);
    const tempScore = Math.max(0, 40 - (tempDiff / tempRange) * 80);
    score += tempScore;
    
    // Condition score (0-40 points)
    if (compatibility.optimalConditions.some(cond => day.condition.includes(cond))) {
      score += 40; // Optimal condition
    } else if (compatibility.incompatibleConditions.some(cond => day.condition.includes(cond))) {
      score -= 40; // Incompatible condition
    } else {
      score += 20; // Neutral condition
    }
    
    // Rainfall score (0-20 points)
    // This is simplified as we don't have detailed rainfall forecast
    const isRainy = day.condition.toLowerCase().includes('rain');
    if (compatibility.requiresDry && !isRainy) {
      score += 20;
    } else if (compatibility.requiresDry && isRainy) {
      score -= 20;
    }
    
    // Only include days that meet the minimum threshold
    if (score >= mergedOptions.minScoreThreshold) {
      const date = addDays(new Date(), index).toISOString().split('T')[0];
      
      recommendations.push({
        taskId: task.id,
        originalDate: task.scheduledDate,
        recommendedDate: date,
        reason: generateRecommendationReason(compatibility, day),
        weatherData: {
          condition: day.condition,
          temperature: day.high,
          icon: day.icon
        },
        score
      });
    }
  });
  
  // Sort by score (highest first)
  return recommendations.sort((a, b) => b.score - a.score);
};

/**
 * Reschedules a task based on weather forecast
 */
export const rescheduleTask = async (
  taskId: number, 
  newDate: string,
  reason?: string
): Promise<ScheduledTask | null> => {
  const tasks = await getScheduledTasks();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return null;
  }
  
  const updatedTask: ScheduledTask = {
    ...task,
    scheduledDate: newDate,
    rescheduledCount: (task.rescheduledCount || 0) + 1
  };
  
  return updateScheduledTask(updatedTask);
};

/**
 * Helper function to add days to a date
 */
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Generates a human-readable reason for the recommendation
 */
const generateRecommendationReason = (
  compatibility: WeatherCompatibility, 
  forecastDay: { condition: string; high: number; low: number; }
): string => {
  const isOptimal = compatibility.optimalConditions.some(
    cond => forecastDay.condition.includes(cond)
  );
  
  const tempInIdealRange = 
    forecastDay.high <= compatibility.temperatureRange.max - 5 && 
    forecastDay.high >= compatibility.temperatureRange.min + 5;
  
  if (isOptimal && tempInIdealRange) {
    return `Ideal ${forecastDay.condition} conditions with perfect temperature (${forecastDay.high}°F)`;
  } else if (isOptimal) {
    return `Good ${forecastDay.condition} conditions, though temperature (${forecastDay.high}°F) is not ideal`;
  } else if (tempInIdealRange) {
    return `Ideal temperature (${forecastDay.high}°F), though conditions (${forecastDay.condition}) are not optimal`;
  } else {
    return `Acceptable conditions for ${compatibility.category} tasks`;
  }
};

/**
 * Clears the task scheduler cache and storage (for testing)
 */
export const clearTaskSchedulerCache = (): void => {
  taskCache = null;
  if (!USE_MOCK_SCHEDULER) {
    localStorage.removeItem(STORAGE_KEY);
  }
  console.log('Task scheduler cache cleared');
};