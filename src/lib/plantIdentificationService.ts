import { v4 as uuidv4 } from 'uuid';
import { getWeatherForLocation } from './weatherService';
import type {
  PlantIdentificationRequest,
  PlantIdentificationResult,
  PlantSpecies,
  CareRecommendation,
  PlantCategory,
  PlantIdentificationFilterOptions,
  PlantIdentificationServiceOptions,
  PlantIdentificationHistory
} from '../types/plantIdentification';

// Toggle between mock and real API implementation
const USE_MOCK_IDENTIFICATION = true;

// Plant.id API configuration
const PLANT_ID_API_KEY = 'demo-api-key-for-testing';
const PLANT_ID_API_URL = 'https://api.plant.id/v2/identify';

// Default service options
const DEFAULT_SERVICE_OPTIONS: PlantIdentificationServiceOptions = {
  usePlantId: true,
  maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  confidenceThreshold: 60,
  maxDailyRequests: 50,
  enableAutoTagging: true,
  enableLocalProcessing: false
};

// LocalStorage keys
const STORAGE_KEYS = {
  IDENTIFICATION_RESULTS: 'lawnsync_plant_identifications',
  IDENTIFICATION_HISTORY: 'lawnsync_identification_history',
  DAILY_REQUEST_COUNT: 'lawnsync_plant_id_daily_requests'
};

// Cache mechanism
interface IdentificationCache {
  [userId: string]: {
    results: PlantIdentificationResult[];
    timestamp: number;
    expires: number;
  };
}

// Cache with 7-day expiration by default
const identificationCache: IdentificationCache = {};
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Mock data for development and testing
const mockIdentificationResults: PlantIdentificationResult[] = [
  {
    id: '1',
    userId: 'user123',
    requestId: 'req1',
    imageUrl: 'https://picsum.photos/id/119/800/600',
    thumbnailUrl: 'https://picsum.photos/id/119/200/200',
    identifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    identificationStatus: 'completed',
    identifiedSpecies: {
      scientificName: 'Taraxacum officinale',
      commonName: 'Dandelion',
      category: 'weed',
      probability: 0.95,
      description: 'Common perennial weed with bright yellow flowers that mature into spherical seed heads. Deeply rooted with long taproots making them difficult to remove completely.',
      isInvasive: true,
      isToxic: false,
      characteristics: {
        leafType: 'Toothed, basal rosette',
        flowerColor: 'Yellow',
        growthHabit: 'Low-growing',
        height: {
          value: 25,
          unit: 'cm'
        }
      },
      careRecommendations: [
        {
          id: 'cr1',
          title: 'Manual Removal',
          description: 'Remove dandelions by digging out the entire taproot to prevent regrowth.',
          type: 'removal',
          priority: 'medium',
          difficultyLevel: 'moderate',
          timeToComplete: {
            value: 15,
            unit: 'minutes'
          },
          materials: ['Dandelion weeder tool', 'Gloves', 'Garden bucket'],
          steps: [
            {
              stepNumber: 1,
              instruction: 'Water the area to soften soil if it is dry'
            },
            {
              stepNumber: 2,
              instruction: 'Insert dandelion weeder tool at a 45-degree angle next to the root'
            },
            {
              stepNumber: 3,
              instruction: 'Leverage the tool to loosen and lift the entire root'
            }
          ]
        },
        {
          id: 'cr2',
          title: 'Selective Herbicide Application',
          description: 'Use a selective broadleaf herbicide to target dandelions without harming grass.',
          type: 'treatment',
          priority: 'high',
          difficultyLevel: 'easy',
          timeToComplete: {
            value: 30,
            unit: 'minutes'
          },
          materials: ['Selective broadleaf herbicide', 'Sprayer', 'Protective gear'],
          relatedProducts: [
            {
              id: 'p1',
              name: 'Broadleaf Weed Control',
              description: 'Selectively targets broadleaf weeds like dandelion while not harming turfgrass.',
              applicationInstructions: 'Apply when plants are actively growing and not under stress.'
            }
          ]
        }
      ]
    },
    possibleMatches: [
      {
        scientificName: 'Taraxacum officinale',
        commonName: 'Dandelion',
        category: 'weed',
        probability: 0.95
      },
      {
        scientificName: 'Bellis perennis',
        commonName: 'Common daisy',
        category: 'weed',
        probability: 0.03
      }
    ],
    aiConfidenceScore: 95,
    source: 'mock'
  },
  {
    id: '2',
    userId: 'user123',
    requestId: 'req2',
    imageUrl: 'https://picsum.photos/id/250/800/600',
    thumbnailUrl: 'https://picsum.photos/id/250/200/200',
    identifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    identificationStatus: 'completed',
    identifiedSpecies: {
      scientificName: 'Cynodon dactylon',
      commonName: 'Bermuda grass',
      category: 'grass',
      probability: 0.88,
      description: 'Warm-season grass with fine texture and excellent heat tolerance. Spreads via rhizomes and stolons. Forms a dense, low-growing turf that can withstand heavy traffic.',
      isInvasive: false,
      characteristics: {
        leafType: 'Fine, pointed blades',
        growthHabit: 'Spreading',
        height: {
          value: 5,
          unit: 'cm'
        }
      },
      careRecommendations: [
        {
          id: 'cr3',
          title: 'Proper Mowing Height',
          description: 'Maintain Bermuda grass at 1-1.5 inches for optimal health and appearance.',
          type: 'maintenance',
          priority: 'medium',
          difficultyLevel: 'easy',
          timeToComplete: {
            value: 45,
            unit: 'minutes'
          },
          materials: ['Mower with sharp blades', 'Rake for clippings']
        }
      ]
    },
    aiConfidenceScore: 88,
    source: 'mock'
  },
  {
    id: '3',
    userId: 'user123',
    requestId: 'req3',
    imageUrl: 'https://picsum.photos/id/118/800/600',
    thumbnailUrl: 'https://picsum.photos/id/118/200/200',
    identifiedAt: new Date().toISOString(), // Today
    identificationStatus: 'completed',
    identifiedSpecies: {
      scientificName: 'Rhizoctonia solani',
      commonName: 'Brown patch',
      category: 'turf_disease',
      probability: 0.82,
      description: 'Fungal disease that appears as circular patches of dead grass with a brown or tan color. Often appears during hot, humid weather. Can spread rapidly in favorable conditions.',
      careRecommendations: [
        {
          id: 'cr4',
          title: 'Apply Fungicide',
          description: 'Apply a broad-spectrum fungicide labeled for brown patch control.',
          type: 'treatment',
          priority: 'high',
          difficultyLevel: 'moderate',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Water the lawn lightly before application'
            },
            {
              stepNumber: 2,
              instruction: 'Apply fungicide following product label directions'
            },
            {
              stepNumber: 3,
              instruction: 'Wait 24-48 hours before watering again'
            }
          ],
          relatedProducts: [
            {
              id: 'p2',
              name: 'Turf Disease Control',
              description: 'Broad-spectrum fungicide effective against brown patch and other lawn diseases.',
              applicationInstructions: 'Apply at first sign of disease and repeat as directed.'
            }
          ]
        },
        {
          id: 'cr5',
          title: 'Improve Air Circulation',
          description: 'Core aerate lawn to improve drainage and reduce moisture retention that promotes fungal growth.',
          type: 'prevention',
          priority: 'medium',
          difficultyLevel: 'difficult',
          timeToComplete: {
            value: 3,
            unit: 'hours'
          }
        }
      ]
    },
    possibleMatches: [
      {
        scientificName: 'Rhizoctonia solani',
        commonName: 'Brown patch',
        category: 'turf_disease',
        probability: 0.82
      },
      {
        scientificName: 'Sclerotinia homoeocarpa',
        commonName: 'Dollar spot',
        category: 'turf_disease',
        probability: 0.12
      }
    ],
    aiConfidenceScore: 82,
    source: 'mock'
  }
];

/**
 * Loads identification results from localStorage
 */
const loadFromStorage = (userId: string): PlantIdentificationResult[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.IDENTIFICATION_RESULTS);
    if (storedData) {
      const allResults = JSON.parse(storedData);
      // Filter results for the specific user
      return allResults.filter((result: PlantIdentificationResult) => result.userId === userId);
    }
  } catch (error) {
    console.error('Error loading identification results from storage:', error);
  }
  return [];
};

/**
 * Saves identification results to localStorage
 */
const saveToStorage = (results: PlantIdentificationResult[]): void => {
  try {
    // First get all existing results
    const storedData = localStorage.getItem(STORAGE_KEYS.IDENTIFICATION_RESULTS);
    let allResults: PlantIdentificationResult[] = [];
    
    if (storedData) {
      // Parse existing results
      allResults = JSON.parse(storedData);
      
      // For each new result
      results.forEach(newResult => {
        // Find the index of the result with the same ID (if it exists)
        const existingIndex = allResults.findIndex(result => result.id === newResult.id);
        
        if (existingIndex >= 0) {
          // Replace the existing result
          allResults[existingIndex] = newResult;
        } else {
          // Add the new result
          allResults.push(newResult);
        }
      });
    } else {
      // No existing results, use the new ones
      allResults = results;
    }
    
    // Save all results back to localStorage
    localStorage.setItem(STORAGE_KEYS.IDENTIFICATION_RESULTS, JSON.stringify(allResults));
  } catch (error) {
    console.error('Error saving identification results to storage:', error);
  }
};

/**
 * Updates the user's identification history
 */
const updateIdentificationHistory = (userId: string, identification: {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  identifiedAt: string;
  plantName?: string;
  category?: PlantCategory;
  confidence?: number;
}): void => {
  try {
    // Get existing history
    const storedData = localStorage.getItem(STORAGE_KEYS.IDENTIFICATION_HISTORY);
    let allHistory: PlantIdentificationHistory[] = [];
    
    if (storedData) {
      allHistory = JSON.parse(storedData);
    }
    
    // Find user's history
    const userHistoryIndex = allHistory.findIndex(history => history.userId === userId);
    
    if (userHistoryIndex >= 0) {
      // Add to existing history
      const userHistory = allHistory[userHistoryIndex];
      const existingIndex = userHistory.identifications.findIndex(item => item.id === identification.id);
      
      if (existingIndex >= 0) {
        // Update existing entry
        userHistory.identifications[existingIndex] = identification;
      } else {
        // Add new entry
        userHistory.identifications.push(identification);
      }
      
      allHistory[userHistoryIndex] = userHistory;
    } else {
      // Create new history for user
      allHistory.push({
        userId,
        identifications: [identification]
      });
    }
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEYS.IDENTIFICATION_HISTORY, JSON.stringify(allHistory));
  } catch (error) {
    console.error('Error updating identification history:', error);
  }
};

/**
 * Tracks daily API usage to prevent exceeding limits
 */
const trackDailyUsage = (): number => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const storedData = localStorage.getItem(STORAGE_KEYS.DAILY_REQUEST_COUNT);
    
    if (storedData) {
      const usage = JSON.parse(storedData);
      
      if (usage.date === today) {
        // Same day, increment count
        usage.count++;
        localStorage.setItem(STORAGE_KEYS.DAILY_REQUEST_COUNT, JSON.stringify(usage));
        return usage.count;
      } else {
        // New day, reset count
        const newUsage = { date: today, count: 1 };
        localStorage.setItem(STORAGE_KEYS.DAILY_REQUEST_COUNT, JSON.stringify(newUsage));
        return 1;
      }
    } else {
      // First usage
      const newUsage = { date: today, count: 1 };
      localStorage.setItem(STORAGE_KEYS.DAILY_REQUEST_COUNT, JSON.stringify(newUsage));
      return 1;
    }
  } catch (error) {
    console.error('Error tracking daily usage:', error);
    return 0;
  }
};

/**
 * Get daily API usage count
 */
const getDailyUsage = (): number => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const storedData = localStorage.getItem(STORAGE_KEYS.DAILY_REQUEST_COUNT);
    
    if (storedData) {
      const usage = JSON.parse(storedData);
      
      if (usage.date === today) {
        return usage.count;
      }
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting daily usage:', error);
    return 0;
  }
};

/**
 * Handles image processing before sending to API
 */
const processImage = async (imageData: string): Promise<string> => {
  // In a real implementation, this would resize, compress, or otherwise 
  // prepare the image for the API. For the mock version, we'll just return it.
  return imageData;
};

/**
 * Calls Plant.id API to identify a plant
 */
const callPlantIdAPI = async (imageData: string, options: PlantIdentificationServiceOptions): Promise<any> => {
  if (USE_MOCK_IDENTIFICATION) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a mock API response
    return {
      id: uuidv4(),
      suggestions: [
        {
          id: 12345,
          plant_name: 'Taraxacum officinale',
          plant_details: {
            common_names: ['Dandelion', 'Common dandelion'],
            taxonomy: {
              class: 'Magnoliopsida',
              family: 'Asteraceae',
              genus: 'Taraxacum',
              order: 'Asterales',
              phylum: 'Tracheophyta'
            }
          },
          probability: 0.95,
          similar_images: [
            { url: 'https://plant-id.org/images/dandelion1.jpg' },
            { url: 'https://plant-id.org/images/dandelion2.jpg' }
          ]
        },
        {
          id: 12346,
          plant_name: 'Bellis perennis',
          plant_details: {
            common_names: ['Common daisy', 'Lawn daisy'],
            taxonomy: {
              class: 'Magnoliopsida',
              family: 'Asteraceae',
              genus: 'Bellis',
              order: 'Asterales',
              phylum: 'Tracheophyta'
            }
          },
          probability: 0.03,
          similar_images: [
            { url: 'https://plant-id.org/images/daisy1.jpg' }
          ]
        }
      ]
    };
  }

  try {
    // Track API usage to avoid exceeding daily limit
    const dailyUsage = trackDailyUsage();
    if (dailyUsage > (options.maxDailyRequests || DEFAULT_SERVICE_OPTIONS.maxDailyRequests!)) {
      throw new Error('Daily Plant.id API request limit exceeded');
    }

    const response = await fetch(PLANT_ID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': options.apiKey || PLANT_ID_API_KEY
      },
      body: JSON.stringify({
        images: [imageData],
        modifiers: ["crops_fast", "similar_images"],
        plant_language: "en",
        plant_details: [
          "common_names",
          "taxonomy",
          "url",
          "wiki_description",
          "edible_parts",
          "watering",
          "propagation_methods"
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Plant.id API:', error);
    throw error;
  }
};

/**
 * Maps Plant.id API response to our internal types
 */
const mapPlantIdResponse = (apiResponse: any, imageUrl: string): PlantIdentificationResult => {
  // Extract the top suggestion
  const topSuggestion = apiResponse.suggestions[0];
  
  // Create the identified species
  const identifiedSpecies: PlantSpecies = {
    scientificName: topSuggestion.plant_name,
    commonName: topSuggestion.plant_details.common_names?.[0] || topSuggestion.plant_name,
    category: determinePlantCategory(topSuggestion),
    probability: topSuggestion.probability,
    description: topSuggestion.plant_details.wiki_description?.value || '',
    characteristics: {
      // Map any available characteristics from the API response
    },
    images: topSuggestion.similar_images?.map((img: any) => ({
      url: img.url,
      type: 'plant'
    })) || [],
    // Generate care recommendations based on identified plant
    careRecommendations: generateCareRecommendations(topSuggestion)
  };
  
  // Map possible matches
  const possibleMatches: PlantSpecies[] = apiResponse.suggestions.map((suggestion: any) => ({
    scientificName: suggestion.plant_name,
    commonName: suggestion.plant_details.common_names?.[0] || suggestion.plant_name,
    category: determinePlantCategory(suggestion),
    probability: suggestion.probability
  }));
  
  // Create the full identification result
  return {
    id: uuidv4(),
    userId: 'current-user', // Should be replaced with actual user ID
    requestId: apiResponse.id,
    imageUrl,
    identifiedAt: new Date().toISOString(),
    identificationStatus: 'completed',
    identifiedSpecies,
    possibleMatches,
    aiConfidenceScore: Math.round(topSuggestion.probability * 100),
    source: 'plant.id'
  };
};

/**
 * Determines plant category based on API response
 */
const determinePlantCategory = (suggestion: any): PlantCategory => {
  // This would ideally use more sophisticated logic based on the API response
  // For the mock, we'll just return a default
  return 'weed';
};

/**
 * Generates care recommendations based on identified plant
 */
const generateCareRecommendations = (suggestion: any): CareRecommendation[] => {
  // This would ideally generate recommendations based on the specific plant
  // For the mock, we'll return a generic recommendation
  return [
    {
      id: uuidv4(),
      title: 'Remove from Lawn',
      description: 'This appears to be a weed. Remove it promptly to prevent spread.',
      type: 'removal',
      priority: 'medium',
      difficultyLevel: 'easy',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Dig out the entire plant including roots'
        },
        {
          stepNumber: 2,
          instruction: 'Dispose of in yard waste (do not compost invasive species)'
        }
      ]
    }
  ];
};

/**
 * Submit a new plant identification request
 */
export const identifyPlant = async (
  request: PlantIdentificationRequest,
  serviceOptions?: Partial<PlantIdentificationServiceOptions>
): Promise<PlantIdentificationResult> => {
  const options = { ...DEFAULT_SERVICE_OPTIONS, ...serviceOptions };
  
  if (USE_MOCK_IDENTIFICATION) {
    console.log('Using mock plant identification');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get a random mock result and customize it
    const randomIndex = Math.floor(Math.random() * mockIdentificationResults.length);
    const mockResult = { ...mockIdentificationResults[randomIndex] };
    
    const newResult: PlantIdentificationResult = {
      ...mockResult,
      id: uuidv4(),
      userId: request.userId,
      requestId: uuidv4(),
      identifiedAt: new Date().toISOString()
    };
    
    // Add to history
    updateIdentificationHistory(request.userId, {
      id: newResult.id,
      imageUrl: newResult.imageUrl,
      thumbnailUrl: newResult.thumbnailUrl,
      identifiedAt: newResult.identifiedAt,
      plantName: newResult.identifiedSpecies?.commonName,
      category: newResult.identifiedSpecies?.category,
      confidence: newResult.aiConfidenceScore
    });
    
    // Save to storage
    saveToStorage([newResult]);
    
    return newResult;
  }
  
  try {
    // Process the image for the API
    const processedImage = await processImage(request.imageData);
    
    // Call the Plant.id API
    const apiResponse = await callPlantIdAPI(processedImage, options);
    
    // Create a blob URL for the image (in a real implementation, this would be a URL to the stored image)
    const imageUrl = `data:image/jpeg;base64,${request.imageData}`;
    
    // Map the API response to our internal format
    const result = mapPlantIdResponse(apiResponse, imageUrl);
    result.userId = request.userId;
    
    // Add to history
    updateIdentificationHistory(request.userId, {
      id: result.id,
      imageUrl: result.imageUrl,
      thumbnailUrl: result.thumbnailUrl,
      identifiedAt: result.identifiedAt,
      plantName: result.identifiedSpecies?.commonName,
      category: result.identifiedSpecies?.category,
      confidence: result.aiConfidenceScore
    });
    
    // Save to cache and storage
    if (!identificationCache[request.userId]) {
      identificationCache[request.userId] = {
        results: [],
        timestamp: Date.now(),
        expires: options.maxCacheAge || CACHE_DURATION
      };
    }
    
    identificationCache[request.userId].results.push(result);
    saveToStorage([result]);
    
    return result;
  } catch (error) {
    console.error('Error identifying plant:', error);
    throw error;
  }
};

/**
 * Get identification results for a user
 */
export const getIdentificationResults = async (
  userId: string,
  filterOptions?: PlantIdentificationFilterOptions,
  serviceOptions?: Partial<PlantIdentificationServiceOptions>
): Promise<PlantIdentificationResult[]> => {
  const options = { ...DEFAULT_SERVICE_OPTIONS, ...serviceOptions };
  
  if (USE_MOCK_IDENTIFICATION) {
    console.log('Using mock identification results');
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let results = [...mockIdentificationResults];
    
    // Apply filters if provided
    if (filterOptions) {
      // Filter by category
      if (filterOptions.categories && filterOptions.categories.length > 0) {
        results = results.filter(result => 
          result.identifiedSpecies && 
          filterOptions.categories!.includes(result.identifiedSpecies.category)
        );
      }
      
      // Filter by minimum confidence
      if (filterOptions.minConfidence) {
        results = results.filter(result => 
          (result.aiConfidenceScore || 0) >= filterOptions.minConfidence!
        );
      }
      
      // Filter by date range
      if (filterOptions.startDate && filterOptions.endDate) {
        const startDate = new Date(filterOptions.startDate).getTime();
        const endDate = new Date(filterOptions.endDate).getTime();
        
        results = results.filter(result => {
          const identifiedDate = new Date(result.identifiedAt).getTime();
          return identifiedDate >= startDate && identifiedDate <= endDate;
        });
      }
      
      // Sort by specified order
      if (filterOptions.sortBy) {
        switch (filterOptions.sortBy) {
          case 'newest':
            results.sort((a, b) => new Date(b.identifiedAt).getTime() - new Date(a.identifiedAt).getTime());
            break;
          case 'oldest':
            results.sort((a, b) => new Date(a.identifiedAt).getTime() - new Date(b.identifiedAt).getTime());
            break;
          case 'confidence':
            results.sort((a, b) => (b.aiConfidenceScore || 0) - (a.aiConfidenceScore || 0));
            break;
        }
      }
      
      // Apply limit if specified
      if (filterOptions.limit && filterOptions.limit > 0) {
        results = results.slice(0, filterOptions.limit);
      }
    }
    
    return results;
  }
  
  // Check if we have cached data that's still valid
  const now = Date.now();
  const cachedData = identificationCache[userId];
  
  if (
    cachedData && 
    cachedData.timestamp + cachedData.expires > now &&
    !serviceOptions?.maxCacheAge // If maxCacheAge is not explicitly set
  ) {
    console.log('Using cached identification results for user:', userId);
    let results = [...cachedData.results];
    
    // Apply filtering logic here (same as mock section)
    
    return results;
  }
  
  try {
    console.log('Fetching fresh identification results for user:', userId);
    
    // Load from localStorage if no cache
    let results = loadFromStorage(userId);
    
    // Cache the loaded results
    identificationCache[userId] = {
      results,
      timestamp: now,
      expires: options.maxCacheAge || CACHE_DURATION
    };
    
    // Apply filtering logic here (same as mock section)
    
    return results;
  } catch (error) {
    console.error('Error getting identification results:', error);
    return USE_MOCK_IDENTIFICATION ? mockIdentificationResults : [];
  }
};

/**
 * Get a specific identification result by ID
 */
export const getIdentificationById = async (
  identificationId: string
): Promise<PlantIdentificationResult | null> => {
  if (USE_MOCK_IDENTIFICATION) {
    console.log('Using mock identification lookup');
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find the mock result
    const result = mockIdentificationResults.find(r => r.id === identificationId);
    return result || null;
  }
  
  try {
    // Check all user caches first
    for (const userId in identificationCache) {
      const result = identificationCache[userId].results.find(r => r.id === identificationId);
      if (result) {
        return result;
      }
    }
    
    // If not found in cache, check localStorage
    const storedData = localStorage.getItem(STORAGE_KEYS.IDENTIFICATION_RESULTS);
    if (storedData) {
      const allResults = JSON.parse(storedData);
      const result = allResults.find((r: PlantIdentificationResult) => r.id === identificationId);
      return result || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting identification by ID:', error);
    return null;
  }
};

/**
 * Get identification history for a user
 */
export const getIdentificationHistory = async (
  userId: string
): Promise<PlantIdentificationHistory | null> => {
  if (USE_MOCK_IDENTIFICATION) {
    console.log('Using mock identification history');
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Create a history from mock results
    return {
      userId,
      identifications: mockIdentificationResults.map(result => ({
        id: result.id,
        imageUrl: result.imageUrl,
        thumbnailUrl: result.thumbnailUrl,
        identifiedAt: result.identifiedAt,
        plantName: result.identifiedSpecies?.commonName,
        category: result.identifiedSpecies?.category,
        confidence: result.aiConfidenceScore
      }))
    };
  }
  
  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.IDENTIFICATION_HISTORY);
    if (storedData) {
      const allHistory = JSON.parse(storedData);
      const userHistory = allHistory.find((h: PlantIdentificationHistory) => h.userId === userId);
      return userHistory || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting identification history:', error);
    return null;
  }
};

/**
 * Clear the identification cache
 */
export const clearIdentificationCache = (): void => {
  console.log('Clearing identification cache');
  for (const userId in identificationCache) {
    delete identificationCache[userId];
  }
};

/**
 * Helper function to get a weather-aware context for the identification request
 */
export const getIdentificationWeatherContext = async (
  location: string
): Promise<string | null> => {
  if (USE_MOCK_IDENTIFICATION) {
    return 'Sunny, 75°F, moderate humidity';
  }
  
  try {
    const weather = await getWeatherForLocation(location);
    return `${weather.current.condition}, ${weather.current.temp}°F, ${weather.current.humidity}% humidity`;
  } catch (error) {
    console.error('Error getting weather for identification context:', error);
    return null;
  }
};