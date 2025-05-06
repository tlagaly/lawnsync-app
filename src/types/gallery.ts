/**
 * Type definitions for the Photo Gallery system
 */

/**
 * Interface for a lawn photo in the gallery
 */
export interface LawnPhoto {
  id: string;
  imageUrl: string; // URL to the image (blob URL for local storage)
  thumbnailUrl?: string; // Optional thumbnail URL for grid view
  dateTaken: string; // ISO date string
  title?: string; // Optional title for the photo
  description?: string; // Optional description
  tags: string[]; // Tags for filtering (e.g., "front yard", "problem area")
  location?: {
    latitude: number;
    longitude: number;
  }; // Optional geolocation data
  weather?: {
    condition: string;
    temperature: number;
  }; // Optional weather data when photo was taken
  problemAreas?: PhotoProblemArea[]; // Optional marked problem areas
}

/**
 * Interface for a marked problem area in a photo
 */
export interface PhotoProblemArea {
  id: string;
  x: number; // X coordinate percentage (0-100)
  y: number; // Y coordinate percentage (0-100)
  radius: number; // Size of the marked area (percentage of image)
  description: string; // Description of the problem
  status: 'identified' | 'in-progress' | 'resolved'; // Status of the problem
}

/**
 * Interface for photo comparison data
 */
export interface PhotoComparison {
  id: string;
  beforePhotoId: string;
  afterPhotoId: string;
  title: string;
  description?: string;
  createdAt: string; // ISO date string
  highlight?: {
    x: number;
    y: number;
    radius: number;
    description: string;
  }; // Optional highlight of improvement area
}

/**
 * Interface for photo filter options
 */
export interface GalleryFilterOptions {
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
 * Configuration options for the GalleryService
 */
export interface GalleryServiceOptions {
  storageQuota?: number; // Maximum storage in bytes
  thumbnailSize?: number; // Thumbnail dimensions in pixels
  maxImageSize?: number; // Maximum image dimensions
  compressionQuality?: number; // 0-1 for image compression
  enableAutoTagging?: boolean; // Use image analysis for auto-tagging
  syncWithCloud?: boolean; // Sync with Firebase storage when online
}