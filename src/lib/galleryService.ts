import { v4 as uuidv4 } from 'uuid';
import type { 
  LawnPhoto, 
  PhotoComparison, 
  GalleryFilterOptions,
  GalleryServiceOptions,
  PhotoProblemArea
} from '../types/gallery';

// Toggle between mock and real API implementation
const USE_MOCK_GALLERY = true;

// Default gallery service options
const DEFAULT_GALLERY_OPTIONS: GalleryServiceOptions = {
  storageQuota: 100 * 1024 * 1024, // 100MB default quota
  thumbnailSize: 200, // 200px thumbnails
  maxImageSize: 1200, // 1200px max dimension
  compressionQuality: 0.8, // 80% quality
  enableAutoTagging: false, // Auto-tagging disabled by default
  syncWithCloud: false // Cloud sync disabled by default
};

// LocalStorage keys
const STORAGE_KEYS = {
  PHOTOS: 'lawnsync_photos',
  COMPARISONS: 'lawnsync_comparisons',
  TAGS: 'lawnsync_photo_tags'
};

// Cache mechanism
interface GalleryCache {
  photos: LawnPhoto[];
  comparisons: PhotoComparison[];
  tags: string[];
  lastUpdated: number;
}

// Mock data for development and testing
const mockPhotos: LawnPhoto[] = [
  {
    id: '1',
    imageUrl: 'https://picsum.photos/id/231/800/600',
    thumbnailUrl: 'https://picsum.photos/id/231/200/200',
    dateTaken: '2025-04-01T10:00:00Z',
    title: 'Front Yard - Initial Condition',
    tags: ['front yard', 'spring', 'before'],
    weather: {
      condition: 'Sunny',
      temperature: 68
    }
  },
  {
    id: '2',
    imageUrl: 'https://picsum.photos/id/232/800/600',
    thumbnailUrl: 'https://picsum.photos/id/232/200/200',
    dateTaken: '2025-04-08T09:30:00Z',
    title: 'Front Yard - 1 Week Progress',
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
        status: 'identified'
      }
    ]
  },
  {
    id: '3',
    imageUrl: 'https://picsum.photos/id/233/800/600',
    thumbnailUrl: 'https://picsum.photos/id/233/200/200',
    dateTaken: '2025-04-15T11:20:00Z',
    title: 'Front Yard - 2 Weeks Progress',
    tags: ['front yard', 'spring', 'progress'],
    weather: {
      condition: 'Sunny',
      temperature: 75
    }
  },
  {
    id: '4',
    imageUrl: 'https://picsum.photos/id/234/800/600',
    thumbnailUrl: 'https://picsum.photos/id/234/200/200',
    dateTaken: '2025-04-01T14:15:00Z',
    title: 'Backyard - Initial Condition',
    tags: ['backyard', 'spring', 'before'],
    weather: {
      condition: 'Sunny',
      temperature: 70
    },
    problemAreas: [
      {
        id: 'p2',
        x: 45,
        y: 55,
        radius: 20,
        description: 'Patchy area with potential fungus',
        status: 'identified'
      }
    ]
  }
];

const mockComparisons: PhotoComparison[] = [
  {
    id: 'c1',
    beforePhotoId: '1',
    afterPhotoId: '3',
    title: 'Front Yard - 2 Week Improvement',
    description: 'Significant greening after fertilizer application',
    createdAt: '2025-04-15T12:00:00Z',
    highlight: {
      x: 50,
      y: 50,
      radius: 30,
      description: 'Notice the improved color and density'
    }
  }
];

// Cache for gallery data
let galleryCache: GalleryCache | null = null;

/**
 * Loads gallery data from localStorage
 */
const loadFromStorage = (): GalleryCache => {
  try {
    const photos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PHOTOS) || '[]');
    const comparisons = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPARISONS) || '[]');
    const tags = JSON.parse(localStorage.getItem(STORAGE_KEYS.TAGS) || '[]');
    
    return {
      photos,
      comparisons,
      tags,
      lastUpdated: Date.now()
    };
  } catch (error) {
    console.error('Error loading gallery data from storage:', error);
    return {
      photos: [],
      comparisons: [],
      tags: [],
      lastUpdated: Date.now()
    };
  }
};

/**
 * Saves gallery data to localStorage
 */
const saveToStorage = (data: Partial<GalleryCache>): void => {
  try {
    if (data.photos) {
      localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(data.photos));
    }
    if (data.comparisons) {
      localStorage.setItem(STORAGE_KEYS.COMPARISONS, JSON.stringify(data.comparisons));
    }
    if (data.tags) {
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(data.tags));
    }
  } catch (error) {
    console.error('Error saving gallery data to storage:', error);
  }
};

/**
 * Gets all saved photo tags
 */
export const getPhotoTags = async (): Promise<string[]> => {
  if (USE_MOCK_GALLERY) {
    console.log('Using mock gallery tags');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Extract unique tags from mock photos
    const uniqueTags = new Set<string>();
    mockPhotos.forEach(photo => {
      photo.tags.forEach(tag => uniqueTags.add(tag));
    });
    
    return Array.from(uniqueTags);
  }
  
  // Check if we have cached data
  if (galleryCache && Date.now() - galleryCache.lastUpdated < 60000) { // 1 minute cache
    return galleryCache.tags;
  }
  
  // Load from localStorage if no cache
  const cache = loadFromStorage();
  galleryCache = cache;
  
  return cache.tags;
};

/**
 * Gets all photos with optional filtering
 */
export const getPhotos = async (
  filterOptions?: Partial<GalleryFilterOptions>
): Promise<LawnPhoto[]> => {
  let photos: LawnPhoto[];
  
  if (USE_MOCK_GALLERY) {
    console.log('Using mock gallery photos');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 300));
    photos = [...mockPhotos];
  } else {
    // Check if we have cached data
    if (galleryCache && Date.now() - galleryCache.lastUpdated < 60000) { // 1 minute cache
      photos = [...galleryCache.photos];
    } else {
      // Load from localStorage if no cache
      const cache = loadFromStorage();
      galleryCache = cache;
      photos = [...cache.photos];
    }
  }
  
  // Apply filters if provided
  if (filterOptions) {
    // Filter by date range
    if (filterOptions.dateRange) {
      const startDate = new Date(filterOptions.dateRange.start).getTime();
      const endDate = new Date(filterOptions.dateRange.end).getTime();
      
      photos = photos.filter(photo => {
        const photoDate = new Date(photo.dateTaken).getTime();
        return photoDate >= startDate && photoDate <= endDate;
      });
    }
    
    // Filter by tags
    if (filterOptions.tags && filterOptions.tags.length > 0) {
      photos = photos.filter(photo => 
        filterOptions.tags!.some(tag => photo.tags.includes(tag))
      );
    }
    
    // Filter by season
    if (filterOptions.season) {
      // Simplified season detection based on month
      photos = photos.filter(photo => {
        const month = new Date(photo.dateTaken).getMonth();
        switch(filterOptions.season) {
          case 'spring': return month >= 2 && month <= 4;
          case 'summer': return month >= 5 && month <= 7;
          case 'fall': return month >= 8 && month <= 10;
          case 'winter': return month === 11 || month <= 1;
          default: return true;
        }
      });
    }
    
    // Filter for photos with problem areas
    if (filterOptions.hasProblems) {
      photos = photos.filter(photo => 
        photo.problemAreas && photo.problemAreas.length > 0
      );
    }
    
    // Sort photos
    if (filterOptions.sortBy) {
      switch(filterOptions.sortBy) {
        case 'newest':
          photos.sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime());
          break;
        case 'oldest':
          photos.sort((a, b) => new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime());
          break;
        case 'title':
          photos.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          break;
      }
    }
  }
  
  return photos;
};

/**
 * Uploads a new photo to the gallery
 */
export const uploadPhoto = async (
  file: File,
  metadata: Omit<LawnPhoto, 'id' | 'imageUrl' | 'thumbnailUrl'>
): Promise<LawnPhoto> => {
  if (USE_MOCK_GALLERY) {
    console.log('Using mock gallery for upload');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Create a mock photo
    const newPhoto: LawnPhoto = {
      id: uuidv4(),
      imageUrl: URL.createObjectURL(file),
      thumbnailUrl: URL.createObjectURL(file),
      ...metadata
    };
    
    console.log('Uploaded mock photo:', newPhoto);
    return newPhoto;
  }
  
  // Generate thumbnail and prepare for storage
  const imageUrl = await processAndStoreImage(file);
  const thumbnailUrl = await generateThumbnail(file);
  
  // Create new photo object
  const newPhoto: LawnPhoto = {
    id: uuidv4(),
    imageUrl,
    thumbnailUrl,
    ...metadata
  };
  
  // Update local cache and storage
  let photos: LawnPhoto[] = [];
  let tags: string[] = [];
  
  if (galleryCache) {
    photos = [...galleryCache.photos, newPhoto];
    
    // Update tags
    const uniqueTags = new Set([...galleryCache.tags]);
    metadata.tags.forEach(tag => uniqueTags.add(tag));
    tags = Array.from(uniqueTags);
    
    galleryCache.photos = photos;
    galleryCache.tags = tags;
    galleryCache.lastUpdated = Date.now();
  } else {
    const cache = loadFromStorage();
    photos = [...cache.photos, newPhoto];
    
    // Update tags
    const uniqueTags = new Set([...cache.tags]);
    metadata.tags.forEach(tag => uniqueTags.add(tag));
    tags = Array.from(uniqueTags);
    
    galleryCache = {
      ...cache,
      photos,
      tags,
      lastUpdated: Date.now()
    };
  }
  
  // Save to localStorage
  saveToStorage({ photos, tags });
  
  return newPhoto;
};

/**
 * Adds a problem area marker to a photo
 */
export const addProblemArea = async (
  photoId: string,
  problemArea: Omit<PhotoProblemArea, 'id'>
): Promise<PhotoProblemArea> => {
  const newProblemArea: PhotoProblemArea = {
    id: uuidv4(),
    ...problemArea
  };
  
  if (USE_MOCK_GALLERY) {
    console.log('Using mock gallery for adding problem area');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Added problem area to photo:', photoId, newProblemArea);
    return newProblemArea;
  }
  
  // Load photos if cache doesn't exist
  if (!galleryCache) {
    galleryCache = loadFromStorage();
  }
  
  // Find and update the photo
  const photoIndex = galleryCache.photos.findIndex(p => p.id === photoId);
  
  if (photoIndex === -1) {
    throw new Error(`Photo with ID ${photoId} not found`);
  }
  
  const photo = galleryCache.photos[photoIndex];
  const problemAreas = photo.problemAreas || [];
  const updatedPhoto = {
    ...photo,
    problemAreas: [...problemAreas, newProblemArea]
  };
  
  // Update the photo in the array
  const updatedPhotos = [...galleryCache.photos];
  updatedPhotos[photoIndex] = updatedPhoto;
  
  // Update cache and storage
  galleryCache.photos = updatedPhotos;
  galleryCache.lastUpdated = Date.now();
  saveToStorage({ photos: updatedPhotos });
  
  return newProblemArea;
};

/**
 * Updates a problem area status
 */
export const updateProblemAreaStatus = async (
  photoId: string, 
  problemAreaId: string, 
  status: 'identified' | 'in-progress' | 'resolved'
): Promise<PhotoProblemArea | null> => {
  if (USE_MOCK_GALLERY) {
    console.log('Using mock gallery for updating problem area');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Updated problem area status:', photoId, problemAreaId, status);
    
    // Return a mock updated problem area
    return {
      id: problemAreaId,
      x: 50,
      y: 50,
      radius: 15,
      description: 'Updated mock problem area',
      status
    };
  }
  
  // Load photos if cache doesn't exist
  if (!galleryCache) {
    galleryCache = loadFromStorage();
  }
  
  // Find the photo
  const photoIndex = galleryCache.photos.findIndex(p => p.id === photoId);
  
  if (photoIndex === -1) {
    throw new Error(`Photo with ID ${photoId} not found`);
  }
  
  const photo = galleryCache.photos[photoIndex];
  
  if (!photo.problemAreas) {
    return null;
  }
  
  // Find and update the problem area
  const problemAreaIndex = photo.problemAreas.findIndex(p => p.id === problemAreaId);
  
  if (problemAreaIndex === -1) {
    return null;
  }
  
  const updatedProblemArea = {
    ...photo.problemAreas[problemAreaIndex],
    status
  };
  
  // Update the problem area in the photo
  const updatedProblemAreas = [...photo.problemAreas];
  updatedProblemAreas[problemAreaIndex] = updatedProblemArea;
  
  const updatedPhoto = {
    ...photo,
    problemAreas: updatedProblemAreas
  };
  
  // Update the photo in the array
  const updatedPhotos = [...galleryCache.photos];
  updatedPhotos[photoIndex] = updatedPhoto;
  
  // Update cache and storage
  galleryCache.photos = updatedPhotos;
  galleryCache.lastUpdated = Date.now();
  saveToStorage({ photos: updatedPhotos });
  
  return updatedProblemArea;
};

/**
 * Creates a before/after photo comparison
 */
export const createPhotoComparison = async (
  beforePhotoId: string,
  afterPhotoId: string,
  data: {
    title: string;
    description?: string;
    highlight?: {
      x: number;
      y: number;
      radius: number;
      description: string;
    };
  }
): Promise<PhotoComparison> => {
  const newComparison: PhotoComparison = {
    id: uuidv4(),
    beforePhotoId,
    afterPhotoId,
    title: data.title,
    description: data.description,
    highlight: data.highlight,
    createdAt: new Date().toISOString()
  };
  
  if (USE_MOCK_GALLERY) {
    console.log('Using mock gallery for creating comparison');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Created photo comparison:', newComparison);
    return newComparison;
  }
  
  // Load comparisons if cache doesn't exist
  if (!galleryCache) {
    galleryCache = loadFromStorage();
  }
  
  // Add the new comparison
  const updatedComparisons = [...galleryCache.comparisons, newComparison];
  
  // Update cache and storage
  galleryCache.comparisons = updatedComparisons;
  galleryCache.lastUpdated = Date.now();
  saveToStorage({ comparisons: updatedComparisons });
  
  return newComparison;
};

/**
 * Gets all photo comparisons
 */
export const getPhotoComparisons = async (): Promise<PhotoComparison[]> => {
  if (USE_MOCK_GALLERY) {
    console.log('Using mock gallery comparisons');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockComparisons];
  }
  
  // Check if we have cached data
  if (galleryCache && Date.now() - galleryCache.lastUpdated < 60000) { // 1 minute cache
    return [...galleryCache.comparisons];
  }
  
  // Load from localStorage if no cache
  const cache = loadFromStorage();
  galleryCache = cache;
  
  return [...cache.comparisons];
};

/**
 * Gets a specific photo by ID
 */
export const getPhotoById = async (photoId: string): Promise<LawnPhoto | null> => {
  if (USE_MOCK_GALLERY) {
    console.log('Using mock gallery for photo lookup');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 200));
    const photo = mockPhotos.find(p => p.id === photoId);
    return photo ? { ...photo } : null;
  }
  
  // Load photos if cache doesn't exist
  if (!galleryCache) {
    galleryCache = loadFromStorage();
  }
  
  const photo = galleryCache.photos.find(p => p.id === photoId);
  return photo ? { ...photo } : null;
};

/**
 * Gets a specific comparison by ID
 */
export const getComparisonById = async (comparisonId: string): Promise<PhotoComparison | null> => {
  if (USE_MOCK_GALLERY) {
    console.log('Using mock gallery for comparison lookup');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 200));
    const comparison = mockComparisons.find(c => c.id === comparisonId);
    return comparison ? { ...comparison } : null;
  }
  
  // Load comparisons if cache doesn't exist
  if (!galleryCache) {
    galleryCache = loadFromStorage();
  }
  
  const comparison = galleryCache.comparisons.find(c => c.id === comparisonId);
  return comparison ? { ...comparison } : null;
};

/**
 * Deletes a photo and its associated comparisons
 */
export const deletePhoto = async (photoId: string): Promise<boolean> => {
  if (USE_MOCK_GALLERY) {
    console.log('Using mock gallery for photo deletion');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 400));
    console.log('Deleted photo:', photoId);
    return true;
  }
  
  // Load data if cache doesn't exist
  if (!galleryCache) {
    galleryCache = loadFromStorage();
  }
  
  // Remove the photo
  const updatedPhotos = galleryCache.photos.filter(p => p.id !== photoId);
  
  // Also remove any comparisons using this photo
  const updatedComparisons = galleryCache.comparisons.filter(
    c => c.beforePhotoId !== photoId && c.afterPhotoId !== photoId
  );
  
  // Update cache and storage
  galleryCache.photos = updatedPhotos;
  galleryCache.comparisons = updatedComparisons;
  galleryCache.lastUpdated = Date.now();
  saveToStorage({ photos: updatedPhotos, comparisons: updatedComparisons });
  
  return true;
};

/**
 * Clears the gallery cache
 */
export const clearGalleryCache = (): void => {
  galleryCache = null;
  console.log('Gallery cache cleared');
};

/**
 * Helper function to process and store an image
 * In a real implementation, this would handle compression and storage
 */
const processAndStoreImage = async (file: File): Promise<string> => {
  // For simplicity, we're just returning a blob URL
  // In production, this would compress the image and store it
  return URL.createObjectURL(file);
};

/**
 * Helper function to generate a thumbnail
 * In a real implementation, this would resize and compress the image
 */
const generateThumbnail = async (file: File): Promise<string> => {
  // For simplicity, using the same image for thumbnail
  // In production, this would resize and compress the image
  return URL.createObjectURL(file);
};

/**
 * Takes a photo using the device camera
 */
export const takePhoto = async (): Promise<File | null> => {
  try {
    // Request access to the camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    
    // Create video and canvas elements
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    
    // Wait for video to be ready
    await new Promise<void>(resolve => {
      video.onloadedmetadata = () => {
        resolve();
      };
    });
    
    // Create canvas to capture the image
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Stop the camera stream
    stream.getTracks().forEach(track => track.stop());
    
    // Convert canvas to blob
    const blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9);
    });
    
    if (!blob) return null;
    
    // Convert blob to file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const file = new File([blob], `lawn-photo-${timestamp}.jpg`, { type: 'image/jpeg' });
    
    return file;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

/**
 * Gets the current weather data to attach to a photo
 */
export const getPhotoWeatherData = async (): Promise<{condition: string; temperature: number} | null> => {
  // This would integrate with the weatherService in a real implementation
  // For simplicity, we'll return mock data
  if (USE_MOCK_GALLERY) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      condition: 'Sunny',
      temperature: 75
    };
  }
  
  try {
    // In a real implementation, this would call the weather service
    return {
      condition: 'Sunny',
      temperature: 75
    };
  } catch (error) {
    console.error('Error getting weather data for photo:', error);
    return null;
  }
};

/**
 * Exports a photo comparison as a single image
 */
export const exportComparison = async (comparisonId: string): Promise<string | null> => {
  try {
    // Get the comparison
    const comparison = await getComparisonById(comparisonId);
    if (!comparison) throw new Error('Comparison not found');
    
    // Get the before and after photos
    const beforePhoto = await getPhotoById(comparison.beforePhotoId);
    const afterPhoto = await getPhotoById(comparison.afterPhotoId);
    
    if (!beforePhoto || !afterPhoto) throw new Error('Photos not found');
    
    // In a real implementation, this would create a side-by-side image
    // For simplicity, we're just returning a mock URL
    if (USE_MOCK_GALLERY) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return 'https://picsum.photos/id/237/800/400';
    }
    
    // This would be implemented to combine the before/after images
    console.log('Exporting comparison', comparison.id);
    return null;
  } catch (error) {
    console.error('Error exporting comparison:', error);
    return null;
  }
};