/**
 * Type definitions for the Smart Watering Schedule system
 */

import type { WeatherData } from "../lib/weatherService";

/**
 * Interface for watering schedule entry
 */
export interface WateringSchedule {
  id: number;
  scheduledDate: string;
  startTime: string;
  duration: number; // in minutes
  zones: WateringZone[];
  isCompleted: boolean;
  isAdjusted: boolean; // if schedule was automatically adjusted due to weather
  originalDate?: string; // before weather adjustment
  adjustmentReason?: string;
  waterSaved?: number; // in gallons, if adjusted due to rainfall
}

/**
 * Interface for lawn zones with different watering needs
 */
export interface WateringZone {
  id: number;
  name: string;
  area: number; // in square feet
  wateringDepth: number; // in inches
  soilType: SoilType;
  sunExposure: SunExposure;
  slope: Slope;
  enabled: boolean;
}

/**
 * Interface for watering configuration based on grass type and season
 */
export interface WateringConfig {
  grassType: GrassType;
  seasonPatterns: SeasonWateringPattern[];
  soilModifiers: SoilModifier[];
  slopeModifiers: SlopeModifier[];
  exposureModifiers: ExposureModifier[];
  rainSkipThreshold: number; // in inches, skip if rainfall exceeds this amount
  rainAdjustmentFactor: number; // percentage to reduce watering per inch of rainfall
  minWateringTime: number; // in minutes
  maxWateringTime: number; // in minutes
}

/**
 * Soil types with different water retention characteristics
 */
export type SoilType = 'clay' | 'loam' | 'sand' | 'silt' | 'peaty' | 'chalky';

/**
 * Sun exposure types
 */
export type SunExposure = 'full' | 'partial' | 'shade';

/**
 * Slope types affecting water runoff
 */
export type Slope = 'flat' | 'slight' | 'moderate' | 'steep';

/**
 * Supported grass types
 */
export type GrassType = 
  'bermuda' | 
  'fescue' | 
  'kentucky-bluegrass' | 
  'ryegrass' | 
  'st-augustine' | 
  'zoysia' |
  'bentgrass' |
  'buffalograss' |
  'centipede';

/**
 * Season-specific watering patterns
 */
export interface SeasonWateringPattern {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  daysPerWeek: number;
  wateringDepth: number; // in inches
  preferredDayTime: 'early-morning' | 'morning' | 'evening';
  preferredDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
}

/**
 * Soil-specific water requirements
 */
export interface SoilModifier {
  soilType: SoilType;
  wateringMultiplier: number; // e.g., 1.2 for sandy soil that needs more water
  absorptionRate: number; // inches per hour
}

/**
 * Slope-specific modifiers
 */
export interface SlopeModifier {
  slope: Slope;
  wateringMultiplier: number; // e.g., 1.5 for steep slopes that need multiple short cycles
  maxCycleLength: number; // maximum minutes per watering cycle to prevent runoff
  cycleCount: number; // number of shorter cycles to achieve target watering depth
}

/**
 * Sun exposure modifiers
 */
export interface ExposureModifier {
  exposure: SunExposure;
  wateringMultiplier: number; // e.g., 1.3 for full sun areas
}

/**
 * Rainfall data used for watering adjustments
 */
export interface RainfallData {
  date: string;
  amount: number; // in inches
  forecast: boolean; // actual rainfall vs forecast
}

/**
 * Water conservation stats for user awareness
 */
export interface WaterConservation {
  totalScheduledGallons: number;
  totalActualGallons: number;
  gallonsSaved: number;
  savingsPercentage: number;
  adjustmentsCount: number;
  rainEvents: number;
}

/**
 * Configuration options for the watering scheduler
 */
export interface WateringSchedulerOptions {
  useWeatherForecast: boolean;
  autoAdjustForRain: boolean;
  preferredStartTime: string; // HH:MM in 24hr format
  allowedDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  notifyBeforeWatering: boolean;
  notifyOnAdjustments: boolean;
}