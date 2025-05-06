import { mockUserData } from '../features/dashboard/mockData';
import type { WeatherData } from './weatherService';
import { getWeatherForLocation } from './weatherService';
import type {
  WateringSchedule,
  WateringZone,
  WateringConfig,
  RainfallData,
  WaterConservation,
  WateringSchedulerOptions,
  GrassType,
  SoilType,
  SunExposure,
  Slope
} from '../types/watering';

// Toggle between mock and real implementation
const USE_MOCK_WATERING = true;

// LocalStorage key for persistence
const STORAGE_KEY = 'lawnSync_wateringSchedules';
const CONFIG_STORAGE_KEY = 'lawnSync_wateringConfig';

// Default scheduler options
const DEFAULT_SCHEDULER_OPTIONS: WateringSchedulerOptions = {
  useWeatherForecast: true,
  autoAdjustForRain: true,
  preferredStartTime: '06:00',
  allowedDays: ['monday', 'wednesday', 'friday'],
  notifyBeforeWatering: true,
  notifyOnAdjustments: true
};

// Default watering configuration for common grass types
const DEFAULT_WATERING_CONFIGS: Record<GrassType, Partial<WateringConfig>> = {
  'bermuda': {
    rainSkipThreshold: 0.5,
    rainAdjustmentFactor: 0.8,
    minWateringTime: 15,
    maxWateringTime: 40,
    seasonPatterns: [
      {
        season: 'spring',
        daysPerWeek: 3,
        wateringDepth: 1.0,
        preferredDayTime: 'early-morning',
        preferredDays: ['monday', 'wednesday', 'friday']
      },
      {
        season: 'summer',
        daysPerWeek: 4,
        wateringDepth: 1.25,
        preferredDayTime: 'early-morning',
        preferredDays: ['monday', 'wednesday', 'friday', 'sunday']
      },
      {
        season: 'fall',
        daysPerWeek: 2,
        wateringDepth: 0.75,
        preferredDayTime: 'early-morning',
        preferredDays: ['monday', 'thursday']
      },
      {
        season: 'winter',
        daysPerWeek: 1,
        wateringDepth: 0.5,
        preferredDayTime: 'morning',
        preferredDays: ['wednesday']
      }
    ]
  },
  'fescue': {
    rainSkipThreshold: 0.75,
    rainAdjustmentFactor: 0.7,
    minWateringTime: 20,
    maxWateringTime: 45,
    seasonPatterns: [
      {
        season: 'spring',
        daysPerWeek: 2,
        wateringDepth: 1.0,
        preferredDayTime: 'morning',
        preferredDays: ['tuesday', 'friday']
      },
      {
        season: 'summer',
        daysPerWeek: 3,
        wateringDepth: 1.5,
        preferredDayTime: 'early-morning',
        preferredDays: ['monday', 'wednesday', 'friday']
      },
      {
        season: 'fall',
        daysPerWeek: 2,
        wateringDepth: 1.0,
        preferredDayTime: 'morning',
        preferredDays: ['tuesday', 'saturday']
      },
      {
        season: 'winter',
        daysPerWeek: 1,
        wateringDepth: 0.5,
        preferredDayTime: 'morning',
        preferredDays: ['thursday']
      }
    ]
  },
  'kentucky-bluegrass': {
    rainSkipThreshold: 0.5,
    rainAdjustmentFactor: 0.75,
    minWateringTime: 20,
    maxWateringTime: 45
  },
  'ryegrass': {
    rainSkipThreshold: 0.5,
    rainAdjustmentFactor: 0.8,
    minWateringTime: 15,
    maxWateringTime: 40
  },
  'st-augustine': {
    rainSkipThreshold: 0.6,
    rainAdjustmentFactor: 0.7,
    minWateringTime: 20,
    maxWateringTime: 40
  },
  'zoysia': {
    rainSkipThreshold: 0.5,
    rainAdjustmentFactor: 0.8,
    minWateringTime: 15,
    maxWateringTime: 35
  },
  'bentgrass': {
    rainSkipThreshold: 0.5,
    rainAdjustmentFactor: 0.7,
    minWateringTime: 20,
    maxWateringTime: 40
  },
  'buffalograss': {
    rainSkipThreshold: 0.75,
    rainAdjustmentFactor: 0.9,
    minWateringTime: 10, 
    maxWateringTime: 30
  },
  'centipede': {
    rainSkipThreshold: 0.6,
    rainAdjustmentFactor: 0.8,
    minWateringTime: 15,
    maxWateringTime: 35
  }
};

// Default soil modifiers
const DEFAULT_SOIL_MODIFIERS = [
  {
    soilType: 'sand' as SoilType,
    wateringMultiplier: 1.3,
    absorptionRate: 2.0
  },
  {
    soilType: 'clay' as SoilType,
    wateringMultiplier: 0.8,
    absorptionRate: 0.5
  },
  {
    soilType: 'loam' as SoilType,
    wateringMultiplier: 1.0,
    absorptionRate: 1.0
  },
  {
    soilType: 'silt' as SoilType,
    wateringMultiplier: 1.1,
    absorptionRate: 0.8
  },
  {
    soilType: 'peaty' as SoilType,
    wateringMultiplier: 0.9,
    absorptionRate: 1.5
  },
  {
    soilType: 'chalky' as SoilType,
    wateringMultiplier: 1.2,
    absorptionRate: 1.8
  }
];

// Default slope modifiers
const DEFAULT_SLOPE_MODIFIERS = [
  {
    slope: 'flat' as Slope,
    wateringMultiplier: 1.0,
    maxCycleLength: 30,
    cycleCount: 1
  },
  {
    slope: 'slight' as Slope,
    wateringMultiplier: 1.1,
    maxCycleLength: 20,
    cycleCount: 2
  },
  {
    slope: 'moderate' as Slope,
    wateringMultiplier: 1.2,
    maxCycleLength: 15,
    cycleCount: 3
  },
  {
    slope: 'steep' as Slope,
    wateringMultiplier: 1.4,
    maxCycleLength: 10,
    cycleCount: 4
  }
];

// Default exposure modifiers
const DEFAULT_EXPOSURE_MODIFIERS = [
  {
    exposure: 'full' as SunExposure,
    wateringMultiplier: 1.2
  },
  {
    exposure: 'partial' as SunExposure,
    wateringMultiplier: 1.0
  },
  {
    exposure: 'shade' as SunExposure,
    wateringMultiplier: 0.8
  }
];

// Mock watering zones for testing
const MOCK_WATERING_ZONES: WateringZone[] = [
  {
    id: 1,
    name: 'Front Yard',
    area: 1500,
    wateringDepth: 1.0,
    soilType: 'loam',
    sunExposure: 'full',
    slope: 'slight',
    enabled: true
  },
  {
    id: 2,
    name: 'Back Yard',
    area: 2000,
    wateringDepth: 1.0,
    soilType: 'clay',
    sunExposure: 'partial',
    slope: 'flat',
    enabled: true
  },
  {
    id: 3,
    name: 'Side Yard',
    area: 800,
    wateringDepth: 0.75,
    soilType: 'sand',
    sunExposure: 'partial',
    slope: 'moderate',
    enabled: true
  },
  {
    id: 4,
    name: 'Garden Beds',
    area: 400,
    wateringDepth: 0.5,
    soilType: 'loam',
    sunExposure: 'partial',
    slope: 'flat',
    enabled: false
  }
];

// Mock watering schedules
const generateMockWateringSchedules = (): WateringSchedule[] => {
  const today = new Date();
  const schedules: WateringSchedule[] = [];
  
  // Create schedules for the next 2 weeks
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    
    // Only schedule on MWF 
    if (date.getDay() === 1 || date.getDay() === 3 || date.getDay() === 5) {
      const isAdjusted = Math.random() > 0.7;
      const originalDate = isAdjusted ? new Date(date) : undefined;
      
      if (isAdjusted && originalDate) {
        // Move the original date back by 1 day
        originalDate.setDate(originalDate.getDate() - 1);
      }
      
      schedules.push({
        id: i + 1,
        scheduledDate: date.toISOString().split('T')[0],
        startTime: '06:00',
        duration: Math.floor(Math.random() * 10) + 20, // 20-30 minutes
        zones: MOCK_WATERING_ZONES.filter(zone => zone.enabled),
        isCompleted: date < today,
        isAdjusted,
        originalDate: isAdjusted && originalDate ? originalDate.toISOString().split('T')[0] : undefined,
        adjustmentReason: isAdjusted ? 'Adjusted due to forecasted rainfall' : undefined,
        waterSaved: isAdjusted ? Math.floor(Math.random() * 50) + 20 : undefined // 20-70 gallons
      });
    }
  }
  
  return schedules;
};

// Calculate water usage in gallons based on watering parameters
const calculateWaterUsage = (
  area: number, 
  wateringDepth: number, 
  wateringMultiplier: number = 1.0
): number => {
  // Convert area from square feet to square inches
  const areaInSqInches = area * 144;
  
  // Convert watering depth to inches
  const depthInInches = wateringDepth * wateringMultiplier;
  
  // Calculate volume in cubic inches (area * depth)
  const volumeInCubicInches = areaInSqInches * depthInInches;
  
  // Convert cubic inches to gallons (1 cubic inch = 0.004329 gallons)
  const gallons = volumeInCubicInches * 0.004329;
  
  return Math.round(gallons);
};

/**
 * Load watering schedules from localStorage
 */
const loadSchedulesFromStorage = (): WateringSchedule[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error loading watering schedules from storage:', error);
  }
  return [];
};

/**
 * Save watering schedules to localStorage
 */
const saveSchedulesToStorage = (schedules: WateringSchedule[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch (error) {
    console.error('Error saving watering schedules to storage:', error);
  }
};

/**
 * Load watering configuration from localStorage
 */
const loadConfigFromStorage = (): WateringConfig | null => {
  try {
    const storedData = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error loading watering config from storage:', error);
  }
  return null;
};

/**
 * Save watering configuration to localStorage
 */
const saveConfigToStorage = (config: WateringConfig): void => {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving watering config to storage:', error);
  }
};

/**
 * Get current season based on date and location
 */
const getCurrentSeason = (date: Date = new Date(), location: string = 'Northern Hemisphere'): 'spring' | 'summer' | 'fall' | 'winter' => {
  const month = date.getMonth();
  const isNorthern = !location.toLowerCase().includes('southern hemisphere');
  
  if (isNorthern) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  } else {
    if (month >= 2 && month <= 4) return 'fall';
    if (month >= 5 && month <= 7) return 'winter';
    if (month >= 8 && month <= 10) return 'spring';
    return 'summer';
  }
};

/**
 * Get the watering config for a specific grass type
 */
export const getWateringConfig = async (grassType?: GrassType): Promise<WateringConfig> => {
  if (USE_MOCK_WATERING) {
    // Use the default watering config for the specified grass type, or bermuda if not specified
    const type = grassType || mockUserData.lawnType as GrassType || 'bermuda';
    
    // Delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get default config for grass type
    const defaultConfig = DEFAULT_WATERING_CONFIGS[type];
    
    // Create a full config by merging defaults with grass-specific settings
    const config: WateringConfig = {
      grassType: type,
      seasonPatterns: defaultConfig.seasonPatterns || [],
      soilModifiers: DEFAULT_SOIL_MODIFIERS,
      slopeModifiers: DEFAULT_SLOPE_MODIFIERS,
      exposureModifiers: DEFAULT_EXPOSURE_MODIFIERS,
      rainSkipThreshold: defaultConfig.rainSkipThreshold || 0.5,
      rainAdjustmentFactor: defaultConfig.rainAdjustmentFactor || 0.8,
      minWateringTime: defaultConfig.minWateringTime || 15,
      maxWateringTime: defaultConfig.maxWateringTime || 40,
    };
    
    return config;
  }
  
  // Try to load from localStorage first
  const storedConfig = loadConfigFromStorage();
  if (storedConfig) {
    return storedConfig;
  }
  
  // Create a new config based on grass type
  const type = grassType || mockUserData.lawnType as GrassType || 'bermuda';
  const defaultConfig = DEFAULT_WATERING_CONFIGS[type];
  
  // Create a full config
  const config: WateringConfig = {
    grassType: type,
    seasonPatterns: defaultConfig.seasonPatterns || [],
    soilModifiers: DEFAULT_SOIL_MODIFIERS,
    slopeModifiers: DEFAULT_SLOPE_MODIFIERS,
    exposureModifiers: DEFAULT_EXPOSURE_MODIFIERS,
    rainSkipThreshold: defaultConfig.rainSkipThreshold || 0.5,
    rainAdjustmentFactor: defaultConfig.rainAdjustmentFactor || 0.8,
    minWateringTime: defaultConfig.minWateringTime || 15,
    maxWateringTime: defaultConfig.maxWateringTime || 40,
  };
  
  // Save the new config
  saveConfigToStorage(config);
  
  return config;
};

/**
 * Get all watering zones
 */
export const getWateringZones = async (): Promise<WateringZone[]> => {
  if (USE_MOCK_WATERING) {
    // Delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [...MOCK_WATERING_ZONES];
  }
  
  // In a real implementation, this would fetch zones from a database
  // For now, we'll use the localStorage or return mock data
  try {
    const storedData = localStorage.getItem('lawnSync_wateringZones');
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error loading watering zones from storage:', error);
  }
  
  // Save mock zones to storage for future use
  localStorage.setItem('lawnSync_wateringZones', JSON.stringify(MOCK_WATERING_ZONES));
  
  return [...MOCK_WATERING_ZONES];
};

/**
 * Get all watering schedules
 */
export const getWateringSchedules = async (): Promise<WateringSchedule[]> => {
  if (USE_MOCK_WATERING) {
    console.log('Using mock watering schedule data');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return generateMockWateringSchedules();
  }
  
  // Load from localStorage
  const schedules = loadSchedulesFromStorage();
  
  // If no schedules exist yet, generate some and save them
  if (schedules.length === 0) {
    const newSchedules = generateMockWateringSchedules();
    saveSchedulesToStorage(newSchedules);
    return newSchedules;
  }
  
  return schedules;
};

/**
 * Create a new watering schedule
 */
export const createWateringSchedule = async (
  schedule: Omit<WateringSchedule, 'id'>
): Promise<WateringSchedule> => {
  const schedules = await getWateringSchedules();
  
  // Generate new ID
  const newId = schedules.length > 0 
    ? Math.max(...schedules.map(s => s.id)) + 1 
    : 1;
  
  const newSchedule: WateringSchedule = {
    ...schedule,
    id: newId
  };
  
  // Add the new schedule
  const updatedSchedules = [...schedules, newSchedule];
  
  if (!USE_MOCK_WATERING) {
    saveSchedulesToStorage(updatedSchedules);
  } else {
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Created mock watering schedule:', newSchedule);
  }
  
  return newSchedule;
};

/**
 * Update an existing watering schedule
 */
export const updateWateringSchedule = async (
  updatedSchedule: WateringSchedule
): Promise<WateringSchedule> => {
  const schedules = await getWateringSchedules();
  
  const updatedSchedules = schedules.map(schedule => 
    schedule.id === updatedSchedule.id ? updatedSchedule : schedule
  );
  
  if (!USE_MOCK_WATERING) {
    saveSchedulesToStorage(updatedSchedules);
  } else {
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Updated mock watering schedule:', updatedSchedule);
  }
  
  return updatedSchedule;
};

/**
 * Delete a watering schedule
 */
export const deleteWateringSchedule = async (scheduleId: number): Promise<boolean> => {
  const schedules = await getWateringSchedules();
  
  const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
  
  if (updatedSchedules.length === schedules.length) {
    return false; // Schedule not found
  }
  
  if (!USE_MOCK_WATERING) {
    saveSchedulesToStorage(updatedSchedules);
  } else {
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Deleted mock watering schedule with ID:', scheduleId);
  }
  
  return true;
};

/**
 * Get rainfall data from weather forecast
 */
export const getRainfallData = async (
  location: string,
  days: number = 7
): Promise<RainfallData[]> => {
  try {
    // Get weather data
    const weatherData = await getWeatherForLocation(location);
    
    if (!weatherData) {
      throw new Error('Unable to fetch weather data');
    }
    
    const today = new Date();
    const rainfallData: RainfallData[] = [];
    
    // Use past rainfall data
    rainfallData.push({
      date: today.toISOString().split('T')[0],
      amount: weatherData.rainfall.last7Days / 7, // Approximate daily rainfall
      forecast: false
    });
    
    // Use forecast data
    for (let i = 0; i < Math.min(days, weatherData.forecast.length); i++) {
      const forecastDay = weatherData.forecast[i];
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      // Extract rainfall estimate from weather condition
      let amount = 0;
      if (forecastDay.condition.toLowerCase().includes('rain')) {
        // Extract percentage if available
        const percentMatch = forecastDay.condition.match(/(\d+)%/);
        if (percentMatch) {
          const percent = parseInt(percentMatch[1], 10);
          // Convert percentage to inches (very rough approximation)
          amount = (percent / 100) * 0.5; // Assume max 0.5 inches for 100% rain
        } else {
          // If no percentage, estimate based on condition
          if (forecastDay.condition.toLowerCase().includes('light')) {
            amount = 0.1;
          } else if (forecastDay.condition.toLowerCase().includes('heavy')) {
            amount = 0.4;
          } else {
            amount = 0.2; // Medium rain
          }
        }
      }
      
      rainfallData.push({
        date: date.toISOString().split('T')[0],
        amount,
        forecast: true
      });
    }
    
    return rainfallData;
  } catch (error) {
    console.error('Error getting rainfall data:', error);
    return [];
  }
};

/**
 * Get water conservation stats
 */
export const getWaterConservation = async (): Promise<WaterConservation> => {
  try {
    const schedules = await getWateringSchedules();
    
    // Calculate statistics
    const stats: WaterConservation = {
      totalScheduledGallons: 0,
      totalActualGallons: 0,
      gallonsSaved: 0,
      savingsPercentage: 0,
      adjustmentsCount: 0,
      rainEvents: 0
    };
    
    const zones = await getWateringZones();
    const config = await getWateringConfig();
    
    // Get total square footage from enabled zones
    const totalArea = zones
      .filter(zone => zone.enabled)
      .reduce((total, zone) => total + zone.area, 0);
    
    // Calculate stats based on schedules
    schedules.forEach(schedule => {
      // Calculate base water usage assuming standard watering depth of 1 inch
      const baseUsage = calculateWaterUsage(totalArea, 1.0);
      stats.totalScheduledGallons += baseUsage;
      
      if (schedule.isAdjusted && schedule.waterSaved) {
        stats.adjustmentsCount++;
        stats.totalActualGallons += (baseUsage - schedule.waterSaved);
        stats.gallonsSaved += schedule.waterSaved;
        
        // Count as rain event if that was the adjustment reason
        if (schedule.adjustmentReason?.toLowerCase().includes('rain')) {
          stats.rainEvents++;
        }
      } else {
        stats.totalActualGallons += baseUsage;
      }
    });
    
    // Calculate savings percentage
    if (stats.totalScheduledGallons > 0) {
      stats.savingsPercentage = Math.round((stats.gallonsSaved / stats.totalScheduledGallons) * 100);
    }
    
    return stats;
  } catch (error) {
    console.error('Error calculating water conservation stats:', error);
    
    // Return mock data on error
    return {
      totalScheduledGallons: 2500,
      totalActualGallons: 1800,
      gallonsSaved: 700,
      savingsPercentage: 28,
      adjustmentsCount: 5,
      rainEvents: 3
    };
  }
};

/**
 * Generate optimized watering schedule based on weather forecast
 */
export const generateOptimalWateringSchedule = async (
  location: string,
  grassType: GrassType,
  days: number = 14,
  options: Partial<WateringSchedulerOptions> = {}
): Promise<WateringSchedule[]> => {
  try {
    // Merge options with defaults
    const schedulerOptions: WateringSchedulerOptions = {
      ...DEFAULT_SCHEDULER_OPTIONS,
      ...options
    };
    
    // Get configuration
    const config = await getWateringConfig(grassType);
    
    // Get weather data and rainfall forecast
    const weatherData = await getWeatherForLocation(location);
    const rainfallData = await getRainfallData(location, days);
    
    // Get zones
    const zones = await getWateringZones();
    const enabledZones = zones.filter(zone => zone.enabled);
    
    // Determine current season
    const season = getCurrentSeason();
    
    // Find season pattern
    const seasonPattern = config.seasonPatterns.find(pattern => pattern.season === season);
    if (!seasonPattern) {
      throw new Error(`No watering pattern found for ${season} season`);
    }
    
    const today = new Date();
    const wateringSchedules: WateringSchedule[] = [];
    let nextId = 1; // Starting ID for new schedules
    
    // Get existing schedules to avoid duplicates
    const existingSchedules = await getWateringSchedules();
    if (existingSchedules.length > 0) {
      nextId = Math.max(...existingSchedules.map(s => s.id)) + 1;
    }
    
    // Generate schedules for the specified number of days
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // Skip if we already have a schedule for this day
      if (existingSchedules.some(s => s.scheduledDate === dateString)) {
        continue;
      }
      
      // Check if this day of week is allowed
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
      if (!schedulerOptions.allowedDays.includes(dayOfWeek as any)) {
        continue;
      }
      
      // Check if we've already scheduled enough days this week
      // (simplified implementation - in a real app we'd track per week)
      const scheduledThisWeek = wateringSchedules.length;
      if (scheduledThisWeek >= seasonPattern.daysPerWeek) {
        continue;
      }
      
      // Check rainfall forecast for this day
      const rainData = rainfallData.find(r => r.date === dateString);
      const rainAmount = rainData?.amount || 0;
      
      // Determine if we should skip due to rain
      let skipWatering = false;
      let adjustWatering = false;
      let adjustmentReason = '';
      let waterSaved = 0;
      
      if (rainAmount >= config.rainSkipThreshold) {
        skipWatering = true;
      } else if (rainAmount > 0) {
        adjustWatering = true;
        adjustmentReason = `Reduced watering due to forecasted rainfall (${rainAmount.toFixed(2)} inches)`;
        
        // Calculate water saved
        const standardUsage = calculateWaterUsage(
          enabledZones.reduce((sum, zone) => sum + zone.area, 0),
          seasonPattern.wateringDepth
        );
        const adjustmentFactor = Math.max(0, 1 - (rainAmount * config.rainAdjustmentFactor));
        const adjustedUsage = standardUsage * adjustmentFactor;
        waterSaved = Math.round(standardUsage - adjustedUsage);
      }
      
      // Skip this day if rainfall exceeds threshold
      if (skipWatering) {
        continue;
      }
      
      // Calculate watering duration
      let duration = config.minWateringTime; // Default minimum duration
      
      // Adjust based on season pattern
      if (seasonPattern) {
        // Convert watering depth to minutes (approximate)
        // Assume 1 inch = 30 minutes as a rough baseline
        duration = Math.round(seasonPattern.wateringDepth * 30);
      }
      
      // Apply adjustment if needed
      if (adjustWatering && rainAmount > 0) {
        // Reduce duration based on rain amount and adjustment factor
        const adjustmentFactor = Math.max(0, 1 - (rainAmount * config.rainAdjustmentFactor));
        duration = Math.round(duration * adjustmentFactor);
      }
      
      // Ensure duration is within min/max bounds
      duration = Math.max(config.minWateringTime, Math.min(config.maxWateringTime, duration));
      
      // Create schedule
      const schedule: WateringSchedule = {
        id: nextId++,
        scheduledDate: dateString,
        startTime: schedulerOptions.preferredStartTime,
        duration,
        zones: enabledZones,
        isCompleted: false,
        isAdjusted: adjustWatering,
        adjustmentReason: adjustWatering ? adjustmentReason : undefined,
        waterSaved: adjustWatering ? waterSaved : undefined
      };
      
      wateringSchedules.push(schedule);
    }
    
    return wateringSchedules;
  } catch (error) {
    console.error('Error generating optimal watering schedule:', error);
    return [];
  }
};

/**
 * Adjust existing schedules based on updated forecast
 */
export const adjustWateringSchedules = async (
  location: string
): Promise<WateringSchedule[]> => {
  try {
    // Get existing schedules
    const schedules = await getWateringSchedules();
    
    // Get rainfall data
    const rainfallData = await getRainfallData(location);
    
    // Get configuration
    const config = await getWateringConfig();
    
    // Get zones
    const zones = await getWateringZones();
    const enabledZones = zones.filter(zone => zone.enabled);
    const totalArea = enabledZones.reduce((sum, zone) => sum + zone.area, 0);
    
    // Process schedules that haven't happened yet
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const updatedSchedules = schedules.map(schedule => {
      // Skip completed schedules
      if (schedule.isCompleted) {
        return schedule;
      }
      
      // Convert schedule date to Date object
      const scheduleDate = new Date(schedule.scheduledDate);
      scheduleDate.setHours(0, 0, 0, 0);
      
      // Skip past schedules
      if (scheduleDate < today) {
        return schedule;
      }
      
      // Find rainfall data for this day
      const dateString = schedule.scheduledDate;
      const rainData = rainfallData.find(r => r.date === dateString);
      
      if (!rainData) {
        return schedule;
      }
      
      // Determine if we should adjust
      if (rainData.amount >= config.rainSkipThreshold) {
        // Skip this watering completely - would be handled elsewhere
        return schedule;
      } else if (rainData.amount > 0) {
        // Calculate standard water usage
        const standardUsage = calculateWaterUsage(totalArea, 1.0);
        
        // Calculate adjustment factor
        const adjustmentFactor = Math.max(0, 1 - (rainData.amount * config.rainAdjustmentFactor));
        
        // Calculate water saved
        const adjustedUsage = standardUsage * adjustmentFactor;
        const waterSaved = Math.round(standardUsage - adjustedUsage);
        
        // Calculate adjusted duration
        const adjustedDuration = Math.round(schedule.duration * adjustmentFactor);
        
        // Return adjusted schedule
        return {
          ...schedule,
          duration: Math.max(config.minWateringTime, adjustedDuration),
          isAdjusted: true,
          adjustmentReason: `Reduced watering due to forecasted rainfall (${rainData.amount.toFixed(2)} inches)`,
          waterSaved
        };
      }
      
      return schedule;
    });
    
    // Save updated schedules if not using mock
    if (!USE_MOCK_WATERING) {
      saveSchedulesToStorage(updatedSchedules);
    }
    
    return updatedSchedules;
  } catch (error) {
    console.error('Error adjusting watering schedules:', error);
    return await getWateringSchedules();
  }
};

/**
 * Clear watering data cache for testing or force refresh
 */
export const clearWateringCache = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    console.log('Watering cache cleared');
  } catch (error) {
    console.error('Error clearing watering cache:', error);
  }
};