/**
 * TypeScript interfaces for the Plant Identification feature
 * Defines structures for API requests, responses, and component props
 */

// Plant category types
export type PlantCategory = 
  | 'weed'
  | 'grass'
  | 'turf_disease'
  | 'fungus'
  | 'insect_damage'
  | 'ornamental'
  | 'nutrient_deficiency'
  | 'herb'
  | 'tree'
  | 'shrub'
  | 'unknown';

// Status of an identification request
export type IdentificationStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

// Source of plant identification
export type IdentificationSource = 
  | 'plant.id'
  | 'mock'
  | 'manual'
  | 'user'
  | 'community';

// Image type categories for plant images
export type PlantImageType = 
  | 'plant'
  | 'close_up'
  | 'whole_plant'
  | 'leaf'
  | 'flower'
  | 'fruit'
  | 'bark'
  | 'root';

// Types of care recommendations
export type CareRecommendationType = 
  | 'removal'
  | 'treatment'
  | 'prevention'
  | 'maintenance'
  | 'watering'
  | 'fertilizing';

// Priority levels for recommendations
export type RecommendationPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

// Difficulty levels for tasks
export type DifficultyLevel = 
  | 'easy'
  | 'moderate'
  | 'difficult';

// Measurement units
export type MeasurementUnit = 
  | 'cm'
  | 'inches'
  | 'feet'
  | 'mm'
  | 'm'
  | 'hours'
  | 'minutes'
  | 'days'
  | 'weeks';

// Sort options for filtering results
export type SortOption = 
  | 'newest'
  | 'oldest'
  | 'confidence';

// Measurement value with unit
export interface Measurement {
  value: number;
  unit: MeasurementUnit;
}

// Plant physical characteristics
export interface PlantCharacteristics {
  leafType?: string;
  flowerColor?: string;
  growthHabit?: string;
  height?: Measurement;
  spreadRadius?: Measurement;
  rootSystem?: string;
  [key: string]: any; // Allow for additional characteristics
}

// Plant image
export interface PlantImage {
  url: string;
  type: PlantImageType;
  caption?: string;
  dateTaken?: string;
}

// Steps for care recommendations
export interface CareStep {
  stepNumber: number;
  instruction: string;
  imageUrl?: string;
}

// Related product for care recommendations
export interface RelatedProduct {
  id: string;
  name: string;
  description?: string;
  applicationInstructions?: string;
  purchaseLink?: string;
  price?: string;
  imageUrl?: string;
}

// Care recommendation
export interface CareRecommendation {
  id: string;
  title: string;
  description: string;
  type: CareRecommendationType;
  priority: RecommendationPriority;
  difficultyLevel?: DifficultyLevel;
  timeToComplete?: Measurement;
  materials?: string[];
  steps?: CareStep[];
  relatedProducts?: RelatedProduct[];
  imageUrl?: string;
  videoUrl?: string;
  tips?: string[];
  warnings?: string[];
}

// Detailed plant species information
export interface PlantSpecies {
  scientificName: string;
  commonName: string;
  category: PlantCategory;
  probability?: number;
  description?: string;
  isInvasive?: boolean;
  isToxic?: boolean;
  characteristics?: PlantCharacteristics;
  images?: PlantImage[];
  careRecommendations?: CareRecommendation[];
  similarSpecies?: string[];
  usda_zones?: string[];
  native_regions?: string[];
  growthRate?: string;
  lifespan?: string;
  url?: string;
}

// Request to identify a plant
export interface PlantIdentificationRequest {
  userId: string;
  imageData: string; // Base64 encoded image data
  dateTaken?: string;
  location?: string;
  additionalContext?: {
    weatherConditions?: string;
    notes?: string;
    tags?: string[];
    [key: string]: any;
  };
}

// Result of a plant identification
export interface PlantIdentificationResult {
  id: string;
  userId: string;
  requestId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  identifiedAt: string;
  identificationStatus: IdentificationStatus;
  identifiedSpecies?: PlantSpecies;
  possibleMatches?: PlantSpecies[];
  aiConfidenceScore?: number;
  source: IdentificationSource;
  rawApiResponse?: any;
  userFeedback?: {
    isCorrect: boolean;
    userProvidedName?: string;
    comments?: string;
    timestamp?: string;
  };
}

// Filter options for retrieving identification results
export interface PlantIdentificationFilterOptions {
  categories?: PlantCategory[];
  minConfidence?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  sortBy?: SortOption;
  userId?: string;
  isCorrect?: boolean;
}

// Service configuration options
export interface PlantIdentificationServiceOptions {
  usePlantId?: boolean;
  apiKey?: string;
  maxCacheAge?: number; // milliseconds
  confidenceThreshold?: number;
  maxDailyRequests?: number;
  enableAutoTagging?: boolean;
  enableLocalProcessing?: boolean;
}

// User's identification history
export interface PlantIdentificationHistory {
  userId: string;
  identifications: {
    id: string;
    imageUrl: string;
    thumbnailUrl?: string;
    identifiedAt: string;
    plantName?: string;
    category?: PlantCategory;
    confidence?: number;
  }[];
}