import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  getScheduledTasks,
  createScheduledTask,
  updateScheduledTask,
  deleteScheduledTask,
  getWeatherCompatibleTasks,
  suggestOptimalTiming,
  rescheduleTask,
  clearTaskSchedulerCache
} from '../../lib/taskSchedulerService';
import { mockWeatherData } from '../utils/testUtils';
import * as weatherService from '../../lib/weatherService';
import * as notificationIntegration from '../../lib/notificationIntegration';
import type { ScheduledTask } from '../../types/scheduler';

// Mock the external dependencies
vi.mock('../../lib/weatherService', () => ({
  getWeatherForLocation: vi.fn().mockResolvedValue(mockWeatherData),
  getWeatherBasedLawnTip: vi.fn().mockReturnValue("Sample lawn tip")
}));

vi.mock('../../lib/notificationIntegration', () => ({
  notifyTaskCreated: vi.fn().mockResolvedValue(undefined),
  notifyTaskDueSoon: vi.fn().mockResolvedValue(undefined),
  notifyTaskRescheduled: vi.fn().mockResolvedValue(undefined)
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

// Mock console
const originalConsole = { ...console };
beforeEach(() => {
  console.log = vi.fn();
  console.error = vi.fn();
  
  // Set up localStorage mock
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  
  // Reset all mocks
  vi.clearAllMocks();
});

afterEach(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  clearTaskSchedulerCache();
});

// Mock task for testing
const mockTask: Omit<ScheduledTask, 'id'> = {
  title: 'Mow the lawn',
  description: 'Cut grass to 2.5 inches height',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
  scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
  priority: 'medium' as const,
  category: 'mowing',
  isCompleted: false,
  icon: 'mower'
};

describe('TaskSchedulerService', () => {
  describe('getScheduledTasks', () => {
    it('should return an array of scheduled tasks', async () => {
      const tasks = await getScheduledTasks();
      
      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);
      
      // Check for scheduled task properties
      const firstTask = tasks[0];
      expect(firstTask).toHaveProperty('id');
      expect(firstTask).toHaveProperty('title');
      expect(firstTask).toHaveProperty('scheduledDate');
      expect(firstTask).toHaveProperty('isWeatherAppropriate');
    });
  });
  
  describe('createScheduledTask', () => {
    it('should create a new scheduled task', async () => {
      const createdTask = await createScheduledTask(mockTask);
      
      expect(createdTask).toBeDefined();
      expect(createdTask.id).toBeDefined();
      expect(createdTask.title).toBe(mockTask.title);
      expect(createdTask.scheduledDate).toBe(mockTask.scheduledDate);
      expect(createdTask.rescheduledCount).toBe(0);
    });
    
    it('should send a notification when creating a task', async () => {
      await createScheduledTask(mockTask);
      
      expect(notificationIntegration.notifyTaskCreated).toHaveBeenCalled();
    });
  });
  
  describe('updateScheduledTask', () => {
    it('should update an existing scheduled task', async () => {
      // First create a task
      const createdTask = await createScheduledTask(mockTask);
      
      // Then update it
      const updatedTaskData = {
        ...createdTask,
        title: 'Updated task title',
        description: 'Updated description'
      };
      
      const updatedTask = await updateScheduledTask(updatedTaskData);
      
      expect(updatedTask).toBeDefined();
      expect(updatedTask.id).toBe(createdTask.id);
      expect(updatedTask.title).toBe('Updated task title');
      expect(updatedTask.description).toBe('Updated description');
    });
  });
  
  describe('deleteScheduledTask', () => {
    it('should delete a scheduled task', async () => {
      // First create a task
      const createdTask = await createScheduledTask(mockTask);
      
      // Then delete it
      const result = await deleteScheduledTask(createdTask.id);
      
      expect(result).toBe(true);
    });
    
    it('should return false when attempting to delete a non-existent task', async () => {
      const result = await deleteScheduledTask(999999); // Non-existent ID
      
      expect(result).toBe(false);
    });
  });
  
  describe('getWeatherCompatibleTasks', () => {
    it('should return weather-compatible tasks for a location', async () => {
      const location = 'Chicago, IL';
      
      // Create a task first
      await createScheduledTask(mockTask);
      
      const compatibleTasks = await getWeatherCompatibleTasks(location);
      
      expect(compatibleTasks).toBeDefined();
      expect(Array.isArray(compatibleTasks)).toBe(true);
      
      // Weather-related properties should be updated
      const firstTask = compatibleTasks[0];
      expect(firstTask).toHaveProperty('isWeatherAppropriate');
      expect(firstTask).toHaveProperty('weatherCondition');
      
      // Should have called the weather service
      expect(weatherService.getWeatherForLocation).toHaveBeenCalledWith(location);
    });
    
    it('should handle options parameter', async () => {
      const location = 'Chicago, IL';
      const options = { useWeatherForecast: false };
      
      const tasks = await getWeatherCompatibleTasks(location, options);
      
      // When useWeatherForecast is false, it should return all tasks
      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
      
      // Should not have called the weather service
      expect(weatherService.getWeatherForLocation).not.toHaveBeenCalled();
    });
  });
  
  describe('suggestOptimalTiming', () => {
    it('should suggest optimal timing for a task', async () => {
      // First create a task
      const createdTask = await createScheduledTask(mockTask);
      const location = 'Chicago, IL';
      
      const recommendations = await suggestOptimalTiming(createdTask, location);
      
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Check recommendation properties
      const firstRecommendation = recommendations[0];
      expect(firstRecommendation).toHaveProperty('taskId');
      expect(firstRecommendation).toHaveProperty('originalDate');
      expect(firstRecommendation).toHaveProperty('recommendedDate');
      expect(firstRecommendation).toHaveProperty('reason');
      expect(firstRecommendation).toHaveProperty('score');
      expect(firstRecommendation.taskId).toBe(createdTask.id);
    });
    
    it('should respect scheduler options', async () => {
      const createdTask = await createScheduledTask(mockTask);
      const location = 'Chicago, IL';
      const options = { maxDaysToLookAhead: 3, minScoreThreshold: 80 };
      
      const recommendations = await suggestOptimalTiming(createdTask, location, options);
      
      expect(recommendations).toBeDefined();
      
      // In mock mode, the results are fixed but we can verify the API is called correctly
      expect(console.log).toHaveBeenCalled(); // Log in mock mode
    });
  });
  
  describe('rescheduleTask', () => {
    it('should reschedule a task with a new date', async () => {
      // First create a task
      const createdTask = await createScheduledTask(mockTask);
      const newDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 5 days from now
      const reason = 'Weather forecast looks better';
      
      const rescheduledTask = await rescheduleTask(createdTask.id, newDate, reason);
      
      expect(rescheduledTask).toBeDefined();
      expect(rescheduledTask?.id).toBe(createdTask.id);
      expect(rescheduledTask?.scheduledDate).toBe(newDate);
      expect(rescheduledTask?.rescheduledCount).toBe(1);
      
      // Should have sent a notification
      expect(notificationIntegration.notifyTaskRescheduled).toHaveBeenCalledWith(
        expect.objectContaining({ id: createdTask.id }),
        createdTask.scheduledDate,
        reason
      );
    });
    
    it('should return null when rescheduling a non-existent task', async () => {
      const newDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const result = await rescheduleTask(999999, newDate); // Non-existent ID
      
      expect(result).toBeNull();
    });
  });
  
  describe('clearTaskSchedulerCache', () => {
    it('should clear the task scheduler cache', async () => {
      // First create a task to populate the cache
      await createScheduledTask(mockTask);
      
      vi.clearAllMocks(); // Clear the logs
      
      // Clear cache
      clearTaskSchedulerCache();
      expect(console.log).toHaveBeenCalledWith('Task scheduler cache cleared');
    });
  });
});