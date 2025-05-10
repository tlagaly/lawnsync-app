import { v4 as uuidv4 } from 'uuid';
import type {
  LawnProfile,
  LawnZone,
  ZoneProblemArea,
  ZoneImage,
  ZoneComparison,
  ZoneHealthStatus,
  ZoneMetrics,
  ZoneGalleryFilter,
  LawnServiceOptions
} from '../types/lawn';
import { getPhotoWeatherData } from './galleryService';

// Toggle between mock and real API implementation
const USE_MOCK_LAWN = true;

// Default lawn service options
const DEFAULT_LAWN_OPTIONS: LawnServiceOptions = {
  enableAutoDetection: false,
  syncWithCloud: false,
  autoGenerateReports: false,
  enableNotifications: true
};

// LocalStorage keys
const STORAGE_KEYS = {
  LAWN_PROFILE: 'lawnsync_lawn_profile',
  LAWN_ZONES: 'lawnsync_lawn_zones',
  ZONE_IMAGES: 'lawnsync_zone_images',
  ZONE_COMPARISONS: 'lawnsync_zone_comparisons'
};

// Cache mechanism
interface LawnCache {
  profile: LawnProfile | null;
  zones: LawnZone[];
  images: ZoneImage[];
  comparisons: ZoneComparison[];
  lastUpdated: number;
}

// Mock data for development and testing
const mockLawnProfile: LawnProfile = {
  id: '1',
  name: 'Home Lawn',
  address: '123 Green Street, Anytown, USA',
  totalSize: 5000, // 5000 sq ft
  createdAt: '2025-04-01T10:00:00Z',
  updatedAt: '2025-05-01T14:30:00Z',
  grassTypes: [
    {
      type: 'kentucky-bluegrass',
      coveragePercentage: 60,
      dateIdentified: '2025-04-01T10:00:00Z'
    },
    {
      type: 'fescue',
      coveragePercentage: 40,
      dateIdentified: '2025-04-01T10:00:00Z'
    }
  ],
  notes: 'Overall in good condition with some issues in shaded areas.',
  soilType: 'loam',
  phLevel: 6.5,
  zones: []
};

const mockLawnZones: LawnZone[] = [
  {
    id: 'zone1',
    name: 'Front Yard',
    size: 2000,
    grassType: 'kentucky-bluegrass',
    soilType: 'loam',
    sunExposure: 'full',
    slope: 'slight',
    createdAt: '2025-04-01T10:00:00Z',
    updatedAt: '2025-05-01T14:30:00Z',
    coordinates: {
      points: [
        { x: 10, y: 10 },
        { x: 90, y: 10 },
        { x: 90, y: 40 },
        { x: 10, y: 40 }
      ],
      center: { x: 50, y: 25 }
    },
    tags: ['front', 'street view', 'sunny'],
    notes: 'Gets full sun most of the day.',
    currentHealth: {
      overallScore: 85,
      colorRating: 'good',
      density: 80,
      weedCoverage: 5,
      bareSpots: 2,
      lastUpdated: '2025-05-01T14:30:00Z'
    },
    metrics: {
      soilMoisture: 65,
      phLevel: 6.7,
      lastWatered: '2025-04-28T08:00:00Z',
      lastFertilized: '2025-04-15T09:00:00Z',
      lastMowed: '2025-04-30T17:00:00Z',
      sunlightHours: 7.5,
      lastUpdated: '2025-05-01T14:30:00Z'
    }
  },
  {
    id: 'zone2',
    name: 'Backyard',
    size: 2500,
    grassType: 'fescue',
    soilType: 'loam',
    sunExposure: 'partial',
    slope: 'flat',
    createdAt: '2025-04-01T10:30:00Z',
    updatedAt: '2025-05-01T14:35:00Z',
    coordinates: {
      points: [
        { x: 10, y: 60 },
        { x: 90, y: 60 },
        { x: 90, y: 90 },
        { x: 10, y: 90 }
      ],
      center: { x: 50, y: 75 }
    },
    tags: ['back', 'partial shade', 'play area'],
    notes: 'Kids play area, heavy foot traffic.',
    currentHealth: {
      overallScore: 75,
      colorRating: 'fair',
      density: 70,
      weedCoverage: 10,
      bareSpots: 8,
      lastUpdated: '2025-05-01T14:35:00Z'
    },
    metrics: {
      soilMoisture: 70,
      phLevel: 6.3,
      lastWatered: '2025-04-28T08:30:00Z',
      lastFertilized: '2025-04-15T09:30:00Z',
      lastMowed: '2025-04-30T17:30:00Z',
      sunlightHours: 5,
      lastUpdated: '2025-05-01T14:35:00Z'
    }
  },
  {
    id: 'zone3',
    name: 'Side Yard',
    size: 500,
    grassType: 'fescue',
    soilType: 'clay',
    sunExposure: 'shade',
    slope: 'moderate',
    createdAt: '2025-04-01T11:00:00Z',
    updatedAt: '2025-05-01T14:40:00Z',
    coordinates: {
      points: [
        { x: 95, y: 40 },
        { x: 99, y: 40 },
        { x: 99, y: 60 },
        { x: 95, y: 60 }
      ],
      center: { x: 97, y: 50 }
    },
    tags: ['side', 'shady', 'problem area'],
    notes: 'Difficult area with drainage issues.',
    currentHealth: {
      overallScore: 50,
      colorRating: 'poor',
      density: 40,
      weedCoverage: 25,
      bareSpots: 20,
      lastUpdated: '2025-05-01T14:40:00Z'
    },
    metrics: {
      soilMoisture: 80,
      phLevel: 5.8,
      lastWatered: '2025-04-28T09:00:00Z',
      lastFertilized: '2025-04-15T10:00:00Z',
      lastMowed: '2025-04-30T18:00:00Z',
      sunlightHours: 2,
      lastUpdated: '2025-05-01T14:40:00Z'
    }
  }
];

const mockZoneImages: ZoneImage[] = [
  {
    id: 'img1',
    imageUrl: 'https://picsum.photos/id/231/800/600',
    thumbnailUrl: 'https://picsum.photos/id/231/200/200',
    dateTaken: '2025-04-01T10:00:00Z',
    tags: ['front yard', 'spring', 'before'],
    isBeforeImage: true,
    weather: {
      condition: 'Sunny',
      temperature: 68
    }
  },
  {
    id: 'img2',
    imageUrl: 'https://picsum.photos/id/232/800/600',
    thumbnailUrl: 'https://picsum.photos/id/232/200/200',
    dateTaken: '2025-04-15T11:20:00Z',
    tags: ['front yard', 'spring', 'progress'],
    weather: {
      condition: 'Partly Cloudy',
      temperature: 72
    },
    problemAreas: [
      {
        id: 'p1',
        x: 30,
        y: 40,
        radius: 15,
        description: 'Bare spot needs reseeding',
        status: 'identified',
        identifiedAt: '2025-04-15T11:20:00Z',
        updatedAt: '2025-04-15T11:20:00Z'
      }
    ]
  },
  {
    id: 'img3',
    imageUrl: 'https://picsum.photos/id/233/800/600',
    thumbnailUrl: 'https://picsum.photos/id/233/200/200',
    dateTaken: '2025-05-01T11:20:00Z',
    tags: ['front yard', 'spring', 'after'],
    isAfterImage: true,
    weather: {
      condition: 'Sunny',
      temperature: 75
    }
  },
  {
    id: 'img4',
    imageUrl: 'https://picsum.photos/id/234/800/600',
    thumbnailUrl: 'https://picsum.photos/id/234/200/200',
    dateTaken: '2025-04-01T14:15:00Z',
    tags: ['backyard', 'spring', 'before'],
    isBeforeImage: true,
    weather: {
      condition: 'Sunny',
      temperature: 70
    }
  }
];

const mockZoneComparisons: ZoneComparison[] = [
  {
    id: 'c1',
    zoneId: 'zone1',
    beforeImageId: 'img1',
    afterImageId: 'img3',
    title: 'Front Yard - 1 Month Improvement',
    description: 'Significant greening after fertilizer application',
    createdAt: '2025-05-01T12:00:00Z',
    highlightArea: {
      x: 50,
      y: 50,
      radius: 30,
      description: 'Notice the improved color and density'
    },
    improvementScore: 85
  }
];

// Cache for lawn data
let lawnCache: LawnCache | null = null;

/**
 * Loads lawn data from localStorage
 */
const loadFromStorage = (): LawnCache => {
  try {
    const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAWN_PROFILE) || 'null');
    const zones = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAWN_ZONES) || '[]');
    const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.ZONE_IMAGES) || '[]');
    const comparisons = JSON.parse(localStorage.getItem(STORAGE_KEYS.ZONE_COMPARISONS) || '[]');
    
    return {
      profile,
      zones,
      images,
      comparisons,
      lastUpdated: Date.now()
    };
  } catch (error) {
    console.error('Error loading lawn data from storage:', error);
    return {
      profile: null,
      zones: [],
      images: [],
      comparisons: [],
      lastUpdated: Date.now()
    };
  }
};

/**
 * Saves lawn data to localStorage
 */
const saveToStorage = (data: Partial<LawnCache>): void => {
  try {
    if (data.profile !== undefined) {
      localStorage.setItem(STORAGE_KEYS.LAWN_PROFILE, JSON.stringify(data.profile));
    }
    if (data.zones !== undefined) {
      localStorage.setItem(STORAGE_KEYS.LAWN_ZONES, JSON.stringify(data.zones));
    }
    if (data.images !== undefined) {
      localStorage.setItem(STORAGE_KEYS.ZONE_IMAGES, JSON.stringify(data.images));
    }
    if (data.comparisons !== undefined) {
      localStorage.setItem(STORAGE_KEYS.ZONE_COMPARISONS, JSON.stringify(data.comparisons));
    }
  } catch (error) {
    console.error('Error saving lawn data to storage:', error);
  }
};

/**
 * Gets the lawn profile information
 */
export const getLawnProfile = async (): Promise<LawnProfile | null> => {
  if (USE_MOCK_LAWN) {
    console.log('Using mock lawn profile');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const profile = { ...mockLawnProfile, zones: mockLawnZones };
    return profile;
  }
  
  // Check if we have cached data
  if (lawnCache && lawnCache.profile && Date.now() - lawnCache.lastUpdated < 60000) { // 1 minute cache
    const profile = { ...lawnCache.profile, zones: lawnCache.zones };
    return profile;
  }
  
  // Load from localStorage if no cache
  const cache = loadFromStorage();
  lawnCache = cache;
  
  if (cache.profile) {
    const profile = { ...cache.profile, zones: cache.zones };
    return profile;
  }
  
  return null;
};

/**
 * Updates the lawn profile information
 */
export const updateLawnProfile = async (profileData: Partial<Omit<LawnProfile, 'id' | 'zones'>>): Promise<LawnProfile | null> => {
  if (USE_MOCK_LAWN) {
    console.log('Using mock lawn profile update');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedProfile = {
      ...mockLawnProfile,
      ...profileData,
      updatedAt: new Date().toISOString(),
      zones: mockLawnZones
    };
    
    console.log('Updated mock profile:', updatedProfile);
    return updatedProfile;
  }
  
  // Load cache if needed
  if (!lawnCache) {
    lawnCache = loadFromStorage();
  }
  
  // If no profile exists, create one
  if (!lawnCache.profile) {
    const newProfile: LawnProfile = {
      id: uuidv4(),
      name: profileData.name || 'My Lawn',
      address: profileData.address || '',
      totalSize: profileData.totalSize || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      grassTypes: profileData.grassTypes || [],
      soilType: profileData.soilType,
      phLevel: profileData.phLevel,
      notes: profileData.notes,
      zones: []
    };
    
    lawnCache.profile = newProfile;
    lawnCache.lastUpdated = Date.now();
    saveToStorage({ profile: newProfile });
    
    return { ...newProfile, zones: [] };
  }
  
  // Update existing profile
  const updatedProfile = {
    ...lawnCache.profile,
    ...profileData,
    updatedAt: new Date().toISOString()
  };
  
  lawnCache.profile = updatedProfile;
  lawnCache.lastUpdated = Date.now();
  saveToStorage({ profile: updatedProfile });
  
  return { ...updatedProfile, zones: lawnCache.zones };
};

/**
 * Gets all lawn zones
 */
export const getLawnZones = async (): Promise<LawnZone[]> => {
  if (USE_MOCK_LAWN) {
    console.log('Using mock lawn zones');
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockLawnZones];
  }
  
  // Check if we have cached data
  if (lawnCache && Date.now() - lawnCache.lastUpdated < 60000) { // 1 minute cache
    return [...lawnCache.zones];
  }
  
  // Load from localStorage if no cache
  const cache = loadFromStorage();
  lawnCache = cache;
  
  return [...cache.zones];
};

/**
 * Gets a specific lawn zone by ID
 */
export const getLawnZoneById = async (zoneId: string): Promise<LawnZone | null> => {
  if (USE_MOCK_LAWN) {
    console.log('Using mock lawn zone lookup');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const zone = mockLawnZones.find(z => z.id === zoneId);
    return zone ? { ...zone } : null;
  }
  
  // Check if we have cached data
  if (lawnCache && Date.now() - lawnCache.lastUpdated < 60000) { // 1 minute cache
    const zone = lawnCache.zones.find(z => z.id === zoneId);
    return zone ? { ...zone } : null;
  }
  
  // Load from localStorage if no cache
  const cache = loadFromStorage();
  lawnCache = cache;
  
  const zone = cache.zones.find(z => z.id === zoneId);
  return zone ? { ...zone } : null;
};

/**
 * Creates a new lawn zone
 */
export const createLawnZone = async (zoneData: Omit<LawnZone, 'id' | 'createdAt' | 'updatedAt'>): Promise<LawnZone> => {
  const now = new Date().toISOString();
  
  const newZone: LawnZone = {
    id: uuidv4(),
    ...zoneData,
    createdAt: now,
    updatedAt: now
  };
  
  if (USE_MOCK_LAWN) {
    console.log('Using mock lawn zone creation');
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log('Created mock zone:', newZone);
    return newZone;
  }
  
  // Load cache if needed
  if (!lawnCache) {
    lawnCache = loadFromStorage();
  }
  
  // Add zone to cache
  const updatedZones = [...lawnCache.zones, newZone];
  lawnCache.zones = updatedZones;
  lawnCache.lastUpdated = Date.now();
  
  // Update local storage
  saveToStorage({ zones: updatedZones });
  
  // Update total size in profile if it exists
  if (lawnCache.profile) {
    const updatedProfile = {
      ...lawnCache.profile,
      updatedAt: now
    };
    
    lawnCache.profile = updatedProfile;
    saveToStorage({ profile: updatedProfile });
  }
  
  return newZone;
};

/**
 * Updates an existing lawn zone
 */
export const updateLawnZone = async (zoneId: string, zoneData: Partial<Omit<LawnZone, 'id' | 'createdAt' | 'updatedAt'>>): Promise<LawnZone | null> => {
  if (USE_MOCK_LAWN) {
    console.log('Using mock lawn zone update');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const zoneIndex = mockLawnZones.findIndex(z => z.id === zoneId);
    if (zoneIndex === -1) return null;
    
    const updatedZone = {
      ...mockLawnZones[zoneIndex],
      ...zoneData,
      updatedAt: new Date().toISOString()
    };
    
    console.log('Updated mock zone:', updatedZone);
    return updatedZone;
  }
  
  // Load cache if needed
  if (!lawnCache) {
    lawnCache = loadFromStorage();
  }
  
  // Find zone index
  const zoneIndex = lawnCache.zones.findIndex(z => z.id === zoneId);
  if (zoneIndex === -1) return null;
  
  // Update zone
  const updatedZone = {
    ...lawnCache.zones[zoneIndex],
    ...zoneData,
    updatedAt: new Date().toISOString()
  };
  
  // Update in cache
  const updatedZones = [...lawnCache.zones];
  updatedZones[zoneIndex] = updatedZone;
  
  lawnCache.zones = updatedZones;
  lawnCache.lastUpdated = Date.now();
  
  // Update local storage
  saveToStorage({ zones: updatedZones });
  
  return updatedZone;
};

/**
 * Deletes a lawn zone
 */
export const deleteLawnZone = async (zoneId: string): Promise<boolean> => {
  if (USE_MOCK_LAWN) {
    console.log('Using mock lawn zone deletion');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Deleted mock zone:', zoneId);
    return true;
  }
  
  // Load cache if needed
  if (!lawnCache) {
    lawnCache = loadFromStorage();
  }
  
  // Find zone
  const zoneIndex = lawnCache.zones.findIndex(z => z.id === zoneId);
  if (zoneIndex === -1) return false;
  
  // Remove from cache
  const updatedZones = lawnCache.zones.filter(z => z.id !== zoneId);
  lawnCache.zones = updatedZones;
  lawnCache.lastUpdated = Date.now();
  
  // Update local storage
  saveToStorage({ zones: updatedZones });
  
  // Also remove any zone images and comparisons
  const updatedImages = lawnCache.images.filter(img => !img.tags.includes(zoneId));
  const updatedComparisons = lawnCache.comparisons.filter(comp => comp.zoneId !== zoneId);
  
  lawnCache.images = updatedImages;
  lawnCache.comparisons = updatedComparisons;
  
  saveToStorage({ 
    images: updatedImages,
    comparisons: updatedComparisons
  });
  
  return true;
};

/**
 * Gets zone images with optional filtering
 */
export const getZoneImages = async (
  filterOptions?: Partial<ZoneGalleryFilter>
): Promise<ZoneImage[]> => {
  let images: ZoneImage[];
  
  if (USE_MOCK_LAWN) {
    console.log('Using mock zone images');
    await new Promise(resolve => setTimeout(resolve, 300));
    images = [...mockZoneImages];
  } else {
    // Check if we have cached data
    if (lawnCache && Date.now() - lawnCache.lastUpdated < 60000) { // 1 minute cache
      images = [...lawnCache.images];
    } else {
      // Load from localStorage if no cache
      const cache = loadFromStorage();
      lawnCache = cache;
      images = [...cache.images];
    }
  }
  
  // Apply filters if provided
  if (filterOptions) {
    // Filter by zone ID
    if (filterOptions.zoneId) {
      images = images.filter(img => img.tags.includes(filterOptions.zoneId!));
    }
    
    // Filter by date range
    if (filterOptions.dateRange) {
      const startDate = new Date(filterOptions.dateRange.start).getTime();
      const endDate = new Date(filterOptions.dateRange.end).getTime();
      
      images = images.filter(img => {
        const photoDate = new Date(img.dateTaken).getTime();
        return photoDate >= startDate && photoDate <= endDate;
      });
    }
    
    // Filter by tags
    if (filterOptions.tags && filterOptions.tags.length > 0) {
      images = images.filter(img => 
        filterOptions.tags!.some(tag => img.tags.includes(tag))
      );
    }
    
    // Filter by season
    if (filterOptions.season) {
      // Simplified season detection based on month
      images = images.filter(img => {
        const month = new Date(img.dateTaken).getMonth();
        switch(filterOptions.season) {
          case 'spring': return month >= 2 && month <= 4;
          case 'summer': return month >= 5 && month <= 7;
          case 'fall': return month >= 8 && month <= 10;
          case 'winter': return month === 11 || month <= 1;
          default: return true;
        }
      });
    }
    
    // Filter for images with problem areas
    if (filterOptions.hasProblems) {
      images = images.filter(img => 
        img.problemAreas && img.problemAreas.length > 0
      );
    }
    
    // Sort images
    if (filterOptions.sortBy) {
      switch(filterOptions.sortBy) {
        case 'newest':
          images.sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime());
          break;
        case 'oldest':
          images.sort((a, b) => new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime());
          break;
        case 'title':
          // Sort by first tag if no title
          images.sort((a, b) => (a.tags[0] || '').localeCompare(b.tags[0] || ''));
          break;
      }
    }
  }
  
  return images;
};

/**
 * Adds a zone image
 */
export const addZoneImage = async (
  file: File,
  metadata: {
    zoneId: string;
    tags: string[];
    isBeforeImage?: boolean;
    isAfterImage?: boolean;
  }
): Promise<ZoneImage> => {
  // Get current date/time
  const now = new Date();
  const dateTaken = now.toISOString();
  
  // Get weather data if available
  const weatherData = await getPhotoWeatherData();
  
  if (USE_MOCK_LAWN) {
    console.log('Using mock zone image upload');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Create a mock image
    const newImage: ZoneImage = {
      id: uuidv4(),
      imageUrl: URL.createObjectURL(file),
      thumbnailUrl: URL.createObjectURL(file),
      dateTaken,
      tags: [...metadata.tags, metadata.zoneId], // Add zoneId as a tag for filtering
      isBeforeImage: metadata.isBeforeImage,
      isAfterImage: metadata.isAfterImage,
      weather: weatherData || undefined
    };
    
    console.log('Added mock zone image:', newImage);
    return newImage;
  }
  
  // Generate image URLs
  const imageUrl = URL.createObjectURL(file);
  const thumbnailUrl = URL.createObjectURL(file); // In a real implementation, we'd generate a proper thumbnail
  
  // Create new image object
  const newImage: ZoneImage = {
    id: uuidv4(),
    imageUrl,
    thumbnailUrl,
    dateTaken,
    tags: [...metadata.tags, metadata.zoneId], // Add zoneId as a tag for filtering
    isBeforeImage: metadata.isBeforeImage,
    isAfterImage: metadata.isAfterImage,
    weather: weatherData || undefined
  };
  
  // Update local cache and storage
  if (!lawnCache) {
    lawnCache = loadFromStorage();
  }
  
  const updatedImages = [...lawnCache.images, newImage];
  lawnCache.images = updatedImages;
  lawnCache.lastUpdated = Date.now();
  
  // Save to localStorage
  saveToStorage({ images: updatedImages });
  
  return newImage;
};

/**
 * Creates a before/after comparison for a zone
 */
export const createZoneComparison = async (
  zoneId: string,
  beforeImageId: string,
  afterImageId: string,
  data: {
    title: string;
    description?: string;
    highlightArea?: {
      x: number;
      y: number;
      radius: number;
      description: string;
    };
    improvementScore?: number;
  }
): Promise<ZoneComparison> => {
  const now = new Date().toISOString();
  
  const newComparison: ZoneComparison = {
    id: uuidv4(),
    zoneId,
    beforeImageId,
    afterImageId,
    title: data.title,
    description: data.description,
    highlightArea: data.highlightArea,
    improvementScore: data.improvementScore,
    createdAt: now
  };
  
  if (USE_MOCK_LAWN) {
    console.log('Using mock zone comparison creation');
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log('Created mock comparison:', newComparison);
    return newComparison;
  }
  
  // Update local cache and storage
  if (!lawnCache) {
    lawnCache = loadFromStorage();
  }
  
  const updatedComparisons = [...lawnCache.comparisons, newComparison];
  lawnCache.comparisons = updatedComparisons;
  lawnCache.lastUpdated = Date.now();
  
  // Save to localStorage
  saveToStorage({ comparisons: updatedComparisons });
  
  return newComparison;
};

/**
 * Gets all zone comparisons for a specific zone
 */
export const getZoneComparisons = async (zoneId?: string): Promise<ZoneComparison[]> => {
  if (USE_MOCK_LAWN) {
    console.log('Using mock zone comparisons');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter by zoneId if provided
    return zoneId 
      ? mockZoneComparisons.filter(c => c.zoneId === zoneId)
      : [...mockZoneComparisons];
  }
  
  // Check if we have cached data
  if (!lawnCache) {
    lawnCache = loadFromStorage();
  }
  
  // Filter by zoneId if provided
  return zoneId
    ? lawnCache.comparisons.filter(c => c.zoneId === zoneId)
    : [...lawnCache.comparisons];
};

/**
 * Adds a problem area to a zone image
 */
export const addZoneImageProblemArea = async (
  imageId: string,
  problemArea: Omit<ZoneProblemArea, 'id' | 'identifiedAt' | 'updatedAt'>
): Promise<ZoneProblemArea> => {
  const now = new Date().toISOString();
  
  const newProblemArea: ZoneProblemArea = {
    id: uuidv4(),
    ...problemArea,
    identifiedAt: now,
    updatedAt: now
  };
  
  if (USE_MOCK_LAWN) {
    console.log('Using mock problem area creation');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Created mock problem area:', newProblemArea);
    return newProblemArea;
  }
  
  // Load cache if needed
  if (!lawnCache) {
    lawnCache = loadFromStorage();
  }
  
  // Find the image
  const imageIndex = lawnCache.images.findIndex(img => img.id === imageId);
  if (imageIndex === -1) {
    throw new Error(`Image with ID ${imageId} not found`);
  }
  
  const image = lawnCache.images[imageIndex];
  const problemAreas = image.problemAreas || [];
  
  // Add problem area to image
  const updatedImage = {
    ...image,
    problemAreas: [...problemAreas, newProblemArea]
  };
  
  // Update image in the array
  const updatedImages = [...lawnCache.images];
  updatedImages[imageIndex] = updatedImage;
  
  // Update cache and storage
  lawnCache.images = updatedImages;
  lawnCache.lastUpdated = Date.now();
  saveToStorage({ images: updatedImages });
  
  return newProblemArea;
};

/**
 * Updates zone health data
 */
export const updateZoneHealth = async (
  zoneId: string,
  healthData: Partial<ZoneHealthStatus>
): Promise<ZoneHealthStatus | null> => {
  const now = new Date().toISOString();
  
  if (USE_MOCK_LAWN) {
    console.log('Using mock zone health update');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const zone = mockLawnZones.find(z => z.id === zoneId);
    if (!zone) return null;
    
    const currentHealth = zone.currentHealth || {
      overallScore: 0,
      colorRating: 'poor',
      density: 0,
      weedCoverage: 0,
      bareSpots: 0,
      lastUpdated: now
    };
    
    const updatedHealth: ZoneHealthStatus = {
      ...currentHealth,
      ...healthData,
      lastUpdated: now
    };
    
    console.log('Updated mock zone health:', updatedHealth);
    return updatedHealth;
  }
  
  // Load cache if needed
  if (!lawnCache) {
    lawnCache = loadFromStorage();
  }
  
  // Find zone
  const zoneIndex = lawnCache.zones.findIndex(z => z.id === zoneId);
  if (zoneIndex === -1) return null;
  
  const zone = lawnCache.zones[zoneIndex];
  
  // Get current health or create default
  const currentHealth = zone.currentHealth || {
    overallScore: 0,
    colorRating: 'poor',
    density: 0,
    weedCoverage: 0,
    bareSpots: 0,
    lastUpdated: now
  };
  
  // Update health data
  const updatedHealth: ZoneHealthStatus = {
    ...currentHealth,
    ...healthData,
    lastUpdated: now
  };
  
  // Create updated zone
  const updatedZone = {
    ...zone,
    currentHealth: updatedHealth,
    updatedAt: now
  };
  
  // Update zone in cache
  const updatedZones = [...lawnCache.zones];
  updatedZones[zoneIndex] = updatedZone;
  
  lawnCache.zones = updatedZones;
  lawnCache.lastUpdated = Date.now();
  
  // Update storage
  saveToStorage({ zones: updatedZones });
  
  return updatedHealth;
};

/**
 * Updates zone metrics data
 */
export const updateZoneMetrics = async (
  zoneId: string,
  metricsData: Partial<Omit<ZoneMetrics, 'lastUpdated'>>
): Promise<ZoneMetrics | null> => {
  const now = new Date().toISOString();
  
  if (USE_MOCK_LAWN) {
    console.log('Using mock zone metrics update');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const zone = mockLawnZones.find(z => z.id === zoneId);
    if (!zone) return null;
    
    const currentMetrics = zone.metrics || {
      lastUpdated: now
    };
    
    const updatedMetrics: ZoneMetrics = {
      ...currentMetrics,
      ...metricsData,
      lastUpdated: now
    };
    
    console.log('Updated mock zone metrics:', updatedMetrics);
    return updatedMetrics;
  }
  
  // Load cache if needed
  if (!lawnCache) {
    lawnCache = loadFromStorage();
  }
  
  // Find zone
  const zoneIndex = lawnCache.zones.findIndex(z => z.id === zoneId);
  if (zoneIndex === -1) return null;
  
  const zone = lawnCache.zones[zoneIndex];
  
  // Get current metrics or create default
  const currentMetrics = zone.metrics || {
    lastUpdated: now
  };
  
  // Update metrics data
  const updatedMetrics: ZoneMetrics = {
    ...currentMetrics,
    ...metricsData,
    lastUpdated: now
  };
  
  // Create updated zone
  const updatedZone = {
    ...zone,
    metrics: updatedMetrics,
    updatedAt: now
  };
  
  // Update zone in cache
  const updatedZones = [...lawnCache.zones];
  updatedZones[zoneIndex] = updatedZone;
  
  lawnCache.zones = updatedZones;
  lawnCache.lastUpdated = Date.now();
  
  // Update storage
  saveToStorage({ zones: updatedZones });
  
  return updatedMetrics;
};

/**
 * Clears the lawn data cache
 */
export const clearLawnCache = (): void => {
  lawnCache = null;
};