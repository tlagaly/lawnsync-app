/**
 * Type definitions for the Lawn Management system
 */

/**
 * Interface for overall lawn profile information
 */
export interface LawnProfile {
  id: string;
  name: string;
  address: string;
  totalSize: number; // in square feet
  createdAt: string;
  updatedAt: string;
  grassTypes: GrassTypeInfo[];
  notes?: string;
  soilType?: SoilType;
  phLevel?: number;
  zones: LawnZone[];
}

/**
 * Interface for grass type information
 */
export interface GrassTypeInfo {
  type: GrassType;
  coveragePercentage: number; // % of lawn covered with this grass type
  dateIdentified?: string;
}

/**
 * Interface for a lawn zone
 */
export interface LawnZone {
  id: string;
  name: string;
  size: number; // in square feet
  grassType: GrassType;
  soilType: SoilType;
  sunExposure: SunExposure;
  slope: Slope;
  createdAt: string;
  updatedAt: string;
  coordinates?: ZoneCoordinates; // for map representation
  tags: string[]; // e.g., "front yard", "shaded area", "problem spot"
  notes?: string;
  images?: ZoneImage[];
  currentHealth?: ZoneHealthStatus;
  metrics?: ZoneMetrics;
  tasks?: ZoneTask[];
}

/**
 * Interface for zone coordinates on map
 */
export interface ZoneCoordinates {
  points: { x: number, y: number }[]; // polygon points
  center: { x: number, y: number }; // center point for label placement
  zoom?: number; // optional zoom level for this zone
}

/**
 * Interface for zone images
 */
export interface ZoneImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  dateTaken: string;
  isBeforeImage?: boolean;
  isAfterImage?: boolean;
  problemAreas?: ZoneProblemArea[];
  weather?: {
    condition: string;
    temperature: number;
  };
  tags: string[];
}

/**
 * Interface for a problem area in a zone
 */
export interface ZoneProblemArea {
  id: string;
  x: number; // X coordinate percentage (0-100)
  y: number; // Y coordinate percentage (0-100)
  radius: number; // Size of the marked area (percentage of image)
  description: string; // Description of the problem
  status: 'identified' | 'in-progress' | 'resolved';
  identifiedAt: string;
  updatedAt: string;
  relatedTasks?: string[]; // IDs of tasks associated with this problem
}

/**
 * Interface for zone health status
 */
export interface ZoneHealthStatus {
  overallScore: number; // 0-100
  colorRating: 'poor' | 'fair' | 'good' | 'excellent';
  density: number; // 0-100
  weedCoverage: number; // percentage
  bareSpots: number; // percentage
  lastUpdated: string;
}

/**
 * Interface for zone-specific metrics
 */
export interface ZoneMetrics {
  soilMoisture?: number; // percentage
  soilTemperature?: number; // in degrees F
  soilNutrients?: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  phLevel?: number;
  lastWatered?: string;
  lastFertilized?: string;
  lastMowed?: string;
  sunlightHours?: number; // average daily
  shadePercentage?: number; // percentage of day in shade
  lastUpdated: string;
}

/**
 * Interface for zone-specific tasks
 */
export interface ZoneTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  dueDate?: string;
  completedDate?: string;
  taskType: 'watering' | 'mowing' | 'fertilizing' | 'seeding' | 'weed-control' | 'pest-control' | 'aeration' | 'other';
  priority: 'low' | 'medium' | 'high';
  seasonRecommended: 'spring' | 'summer' | 'fall' | 'winter' | 'any';
  weatherDependent: boolean;
  notes?: string;
}

/**
 * Type for comparing images within a zone
 */
export interface ZoneComparison {
  id: string;
  zoneId: string;
  beforeImageId: string;
  afterImageId: string;
  title: string;
  description?: string;
  createdAt: string;
  highlightArea?: {
    x: number;
    y: number;
    radius: number;
    description: string;
  };
  improvementScore?: number; // 0-100
}

/**
 * Soil types with different characteristics
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
 * Interface for zone-based filtering of photos
 */
export interface ZoneGalleryFilter {
  zoneId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  hasProblems?: boolean;
  sortBy: 'newest' | 'oldest' | 'title';
}

/**
 * Interface for lawn service options
 */
export interface LawnServiceOptions {
  enableAutoDetection?: boolean; // Use AI to detect zones, grass types
  syncWithCloud?: boolean; // Sync with Firebase when online
  autoGenerateReports?: boolean; // Generate weekly/monthly health reports
  enableNotifications?: boolean; // Enable notifications for tasks
}