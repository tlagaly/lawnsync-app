import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getWateringConfig,
  getWateringZones,
  getWateringSchedules,
  createWateringSchedule,
  updateWateringSchedule,
  deleteWateringSchedule,
  getRainfallData,
  getWaterConservation,
  generateOptimalWateringSchedule,
  adjustWateringSchedules,
  clearWateringCache
} from '../../lib/wateringService';
import * as weatherService from '../../lib/weatherService';
import * as notificationIntegration from '../../lib/notificationIntegration';
import { mockWeatherData } from '../utils/testUtils';
import type { WateringSchedule, WateringZone, GrassType } from '../../types/watering';

// Mock the weather service
vi.mock('../../lib/weatherService', () => ({
  getWeatherForLocation: vi.fn().mockResolvedValue(mockWeatherData),
  getWeatherBasedLawnTip: vi.fn().mockReturnValue('Sample lawn tip')
}));

// Mock the notification integration
vi.mock('../../lib/notificationIntegration', () => ({
  notifyWateringScheduled: vi.fn().mockResolvedValue(undefined),
  notifyWateringAdjusted: vi.fn().mockResolvedValue(undefined),
  notifyWateringCompleted: vi.fn().mockResolvedValue(undefined)
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
  clearWateringCache();
});

// Sample watering zone for testing
const sampleZone: WateringZone = {
  id: 1,
  name: 'Front Yard',
  area: 1500,
  wateringDepth: 1.0,
  soilType: 'loam',
  sunExposure: 'full',
  slope: 'slight',
  enabled: true
};

// Sample schedule for testing
const createSampleSchedule = (id: number = 1): Omit<WateringSchedule, 'id'> => ({
  scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
  startTime: '06:00',
  duration: 30,
  zones: [sampleZone],
  isCompleted: false,
  isAdjusted: false
});

describe('WateringService', () => {
  describe('getWateringConfig', () => {
    it('should return config for a specific grass type', async () => {
      const grassType: GrassType = 'bermuda';
      const config = await getWateringConfig(grassType);
      
      expect(config).toBeDefined();
      expect(config.grassType).toBe(grassType);
      expect(config.seasonPatterns).toBeInstanceOf(Array);
      expect(config.soilModifiers).toBeInstanceOf(Array);
      expect(config.slopeModifiers).toBeInstanceOf(Array);
      expect(config.exposureModifiers).toBeInstanceOf(Array);
    });
    
    it('should use default grass type if none provided', async () => {
      const config = await getWateringConfig();
      
      expect(config).toBeDefined();
      expect(config.grassType).toBeDefined();
    });
    
    it('should include season patterns for the grass type', async () => {
      const config = await getWateringConfig('fescue');
      
      expect(config.seasonPatterns.length).toBeGreaterThan(0);
      expect(config.seasonPatterns[0]).toHaveProperty('season');
      expect(config.seasonPatterns[0]).toHaveProperty('daysPerWeek');
      expect(config.seasonPatterns[0]).toHaveProperty('wateringDepth');
    });
  });
  
  describe('getWateringZones', () => {
    it('should return an array of watering zones', async () => {
      const zones = await getWateringZones();
      
      expect(zones).toBeDefined();
      expect(Array.isArray(zones)).toBe(true);
      expect(zones.length).toBeGreaterThan(0);
      
      // Check zone properties
      const firstZone = zones[0];
      expect(firstZone).toHaveProperty('id');
      expect(firstZone).toHaveProperty('name');
      expect(firstZone).toHaveProperty('area');
      expect(firstZone).toHaveProperty('wateringDepth');
      expect(firstZone).toHaveProperty('soilType');
      expect(firstZone).toHaveProperty('sunExposure');
      expect(firstZone).toHaveProperty('slope');
      expect(firstZone).toHaveProperty('enabled');
    });
  });
  
  describe('getWateringSchedules', () => {
    it('should return an array of watering schedules', async () => {
      const schedules = await getWateringSchedules();
      
      expect(schedules).toBeDefined();
      expect(Array.isArray(schedules)).toBe(true);
      
      // In mock mode, it should generate schedules
      expect(console.log).toHaveBeenCalledWith('Using mock watering schedule data');
    });
  });
  
  describe('createWateringSchedule', () => {
    it('should create a new watering schedule', async () => {
      const schedule = createSampleSchedule();
      const createdSchedule = await createWateringSchedule(schedule);
      
      expect(createdSchedule).toBeDefined();
      expect(createdSchedule.id).toBeDefined();
      expect(createdSchedule.scheduledDate).toBe(schedule.scheduledDate);
      expect(createdSchedule.startTime).toBe(schedule.startTime);
      expect(createdSchedule.duration).toBe(schedule.duration);
    });
    
    it('should send a notification when creating a schedule', async () => {
      const schedule = createSampleSchedule();
      await createWateringSchedule(schedule);
      
      expect(notificationIntegration.notifyWateringScheduled).toHaveBeenCalled();
    });
  });
  
  describe('updateWateringSchedule', () => {
    it('should update an existing watering schedule', async () => {
      // First create a schedule
      const initialSchedule = await createWateringSchedule(createSampleSchedule());
      
      // Then update it
      const updatedScheduleData = {
        ...initialSchedule,
        duration: 45,
        startTime: '07:00'
      };
      
      const updatedSchedule = await updateWateringSchedule(updatedScheduleData);
      
      expect(updatedSchedule).toBeDefined();
      expect(updatedSchedule.id).toBe(initialSchedule.id);
      expect(updatedSchedule.duration).toBe(45);
      expect(updatedSchedule.startTime).toBe('07:00');
    });
    
    it('should send notification when a schedule is adjusted', async () => {
      // Create schedule
      const initialSchedule = await createWateringSchedule(createSampleSchedule());
      
      // Update with adjustment
      const adjustedSchedule = {
        ...initialSchedule,
        isAdjusted: true,
        adjustmentReason: 'Forecasted rainfall',
        waterSaved: 50
      };
      
      await updateWateringSchedule(adjustedSchedule);
      
      expect(notificationIntegration.notifyWateringAdjusted).toHaveBeenCalledWith(
        expect.objectContaining({ id: initialSchedule.id }),
        'Forecasted rainfall',
        50
      );
    });
    
    it('should send notification when a schedule is completed', async () => {
      // Create schedule
      const initialSchedule = await createWateringSchedule(createSampleSchedule());
      
      // Mark as completed
      const completedSchedule = {
        ...initialSchedule,
        isCompleted: true
      };
      
      await updateWateringSchedule(completedSchedule);
      
      expect(notificationIntegration.notifyWateringCompleted).toHaveBeenCalledWith(
        expect.objectContaining({ id: initialSchedule.id })
      );
    });
  });
  
  describe('deleteWateringSchedule', () => {
    it('should delete a watering schedule', async () => {
      // First create a schedule
      const createdSchedule = await createWateringSchedule(createSampleSchedule());
      
      // Then delete it
      const result = await deleteWateringSchedule(createdSchedule.id);
      
      expect(result).toBe(true);
    });
    
    it('should return false when attempting to delete a non-existent schedule', async () => {
      const result = await deleteWateringSchedule(999999); // Non-existent ID
      
      expect(result).toBe(false);
    });
  });
  
  describe('getRainfallData', () => {
    it('should return rainfall data for a location', async () => {
      const location = 'Chicago, IL';
      const days = 7;
      
      const rainfallData = await getRainfallData(location, days);
      
      expect(rainfallData).toBeDefined();
      expect(Array.isArray(rainfallData)).toBe(true);
      expect(rainfallData.length).toBeGreaterThan(0);
      
      // Check rainfall data properties
      const firstDay = rainfallData[0];
      expect(firstDay).toHaveProperty('date');
      expect(firstDay).toHaveProperty('amount');
      expect(firstDay).toHaveProperty('forecast');
      
      // Should have called the weather service
      expect(weatherService.getWeatherForLocation).toHaveBeenCalledWith(location);
    });
    
    it('should handle the days parameter', async () => {
      const location = 'Chicago, IL';
      const days = 3;
      
      await getRainfallData(location, days);
      
      // Should have called the weather service with the correct location
      expect(weatherService.getWeatherForLocation).toHaveBeenCalledWith(location);
    });
  });
  
  describe('getWaterConservation', () => {
    it('should return water conservation statistics', async () => {
      const stats = await getWaterConservation();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totalScheduledGallons');
      expect(stats).toHaveProperty('totalActualGallons');
      expect(stats).toHaveProperty('gallonsSaved');
      expect(stats).toHaveProperty('savingsPercentage');
      expect(stats).toHaveProperty('adjustmentsCount');
      expect(stats).toHaveProperty('rainEvents');
    });
  });
  
  describe('generateOptimalWateringSchedule', () => {
    it('should generate optimal watering schedules based on weather forecast', async () => {
      const location = 'Chicago, IL';
      const grassType: GrassType = 'bermuda';
      const days = 14;
      
      const schedules = await generateOptimalWateringSchedule(location, grassType, days);
      
      expect(schedules).toBeDefined();
      expect(Array.isArray(schedules)).toBe(true);
      
      if (schedules.length > 0) {
        const firstSchedule = schedules[0];
        expect(firstSchedule).toHaveProperty('id');
        expect(firstSchedule).toHaveProperty('scheduledDate');
        expect(firstSchedule).toHaveProperty('startTime');
        expect(firstSchedule).toHaveProperty('duration');
        expect(firstSchedule).toHaveProperty('zones');
      }
      
      // Should have called the weather service
      expect(weatherService.getWeatherForLocation).toHaveBeenCalledWith(location);
    });
    
    it('should respect scheduler options', async () => {
      const location = 'Chicago, IL';
      const grassType: GrassType = 'bermuda';
      const days = 14;
      const options = {
        preferredStartTime: '05:00',
        allowedDays: ['monday', 'thursday', 'saturday'] as any
      };
      
      const schedules = await generateOptimalWateringSchedule(location, grassType, days, options);
      
      expect(schedules).toBeDefined();
      
      if (schedules.length > 0) {
        // Should use the preferred start time
        expect(schedules[0].startTime).toBe('05:00');
      }
    });
  });
  
  describe('adjustWateringSchedules', () => {
    it('should adjust watering schedules based on rainfall forecast', async () => {
      // Create a schedule first
      await createWateringSchedule(createSampleSchedule());
      
      const location = 'Chicago, IL';
      const adjustedSchedules = await adjustWateringSchedules(location);
      
      expect(adjustedSchedules).toBeDefined();
      expect(Array.isArray(adjustedSchedules)).toBe(true);
      
      // Should have called the weather service
      expect(weatherService.getWeatherForLocation).toHaveBeenCalledWith(location);
    });
  });
  
  describe('clearWateringCache', () => {
    it('should clear the watering cache', async () => {
      clearWateringCache();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith('Watering cache cleared');
    });
  });
});