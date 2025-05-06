    import { mockWeatherData } from '../features/dashboard/mockData';

// Toggle between mock and real API implementation
const USE_MOCK_WEATHER = true;

// OpenWeatherMap API configuration
const OPENWEATHER_API_KEY = 'demo-api-key-for-testing';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/3.0';

// Simple cache mechanism
interface WeatherCache {
  [locationKey: string]: {
    data: WeatherData;
    timestamp: number;
    expires: number;
  };
}

// Weather data interface - matches the structure expected by the WeatherCard component
export interface WeatherData {
  current: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
  rainfall: {
    last7Days: number;
    projected7Days: number;
  };
}

// Cache with 30-minute expiration by default
const weatherCache: WeatherCache = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Convert OpenWeatherMap icon code to our custom icon names
const mapWeatherIcon = (owmIcon: string): string => {
  const iconMap: Record<string, string> = {
    '01d': 'sun',
    '01n': 'sun',
    '02d': 'cloud-sun',
    '02n': 'cloud-sun',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloud',
    '04n': 'cloud',
    '09d': 'cloud-rain',
    '09n': 'cloud-rain',
    '10d': 'cloud-rain',
    '10n': 'cloud-rain',
    '11d': 'cloud-rain',
    '11n': 'cloud-rain',
    '13d': 'cloud',
    '13n': 'cloud',
    '50d': 'cloud',
    '50n': 'cloud'
  };
  
  return iconMap[owmIcon] || 'sun';
};

// Convert day index to day name
const getDayName = (dayIndex: number): string => {
  if (dayIndex === 0) return 'Today';
  if (dayIndex === 1) return 'Tomorrow';
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date();
  date.setDate(date.getDate() + dayIndex);
  return days[date.getDay()];
};

// Convert temperature from Kelvin to Fahrenheit
const kelvinToFahrenheit = (kelvin: number): number => {
  return Math.round((kelvin - 273.15) * 9/5 + 32);
};

// Get lawn care tips based on weather conditions
export const getWeatherBasedLawnTip = (weatherData: WeatherData): string => {
  const { current, rainfall, forecast } = weatherData;
  const temp = current.temp;
  const isRainy = current.condition.toLowerCase().includes('rain');
  const isHot = temp > 85;
  const isCold = temp < 50;
  const isWindy = current.windSpeed > 15;
  const lowRainfall = rainfall.last7Days < 0.5;
  const highRainfall = rainfall.last7Days > 2;
  const rainSoon = forecast.some(day => 
    day.condition.toLowerCase().includes('rain') && 
    (day.day === 'Today' || day.day === 'Tomorrow')
  );

  if (isRainy) {
    return "Hold off on mowing until your lawn dries. Perfect time to plan your next lawn care steps.";
  } else if (isHot && lowRainfall) {
    return "Water deeply in early morning to minimize evaporation and help roots grow deeper.";
  } else if (rainSoon && !isRainy) {
    return "Rain in the forecast. Consider holding off on watering to avoid overwatering your lawn.";
  } else if (isWindy) {
    return "Avoid fertilizing today as wind can cause uneven distribution and chemical drift.";
  } else if (isCold) {
    return "Cold temperatures slow grass growth. Raise mowing height to reduce stress on your lawn.";
  } else if (highRainfall) {
    return "Your lawn has received ample rain lately. Monitor for fungus and avoid overwatering.";
  } else {
    return "Ideal weather for lawn maintenance. Consider mowing or fertilizing if needed.";
  }
};

/**
 * Get weather data for a specific location
 * Uses mock data or real OpenWeatherMap API depending on USE_MOCK_WEATHER setting
 */
export const getWeatherForLocation = async (
  location: string,
  options = { forceRefresh: false }
): Promise<WeatherData> => {
  if (USE_MOCK_WEATHER) {
    console.log('Using mock weather data for:', location);
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockWeatherData };
  }
  
  // Create a cache key from the location
  const cacheKey = location.toLowerCase().trim();
  
  // Check if we have cached data that's still valid
  const now = Date.now();
  const cachedData = weatherCache[cacheKey];
  
  if (
    !options.forceRefresh && 
    cachedData && 
    cachedData.timestamp + cachedData.expires > now
  ) {
    console.log('Using cached weather data for:', location);
    return cachedData.data;
  }
  
  try {
    console.log('Fetching fresh weather data for:', location);
    
    // Step 1: Geocode the location to get coordinates
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData || geocodeData.length === 0) {
      throw new Error('Location not found');
    }
    
    const { lat, lon } = geocodeData[0];
    
    // Step 2: Get weather data using One Call API
    const weatherUrl = `${OPENWEATHER_BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${OPENWEATHER_API_KEY}`;
    const weatherResponse = await fetch(weatherUrl);
    const owmData = await weatherResponse.json();
    
    // Transform OpenWeatherMap data to our format
    const transformedData: WeatherData = {
      current: {
        temp: kelvinToFahrenheit(owmData.current.temp),
        condition: owmData.current.weather[0].main,
        humidity: owmData.current.humidity,
        windSpeed: Math.round(owmData.current.wind_speed * 2.237), // Convert m/s to mph
        icon: mapWeatherIcon(owmData.current.weather[0].icon)
      },
      forecast: owmData.daily.slice(0, 5).map((day: any, index: number) => ({
        day: getDayName(index),
        high: kelvinToFahrenheit(day.temp.max),
        low: kelvinToFahrenheit(day.temp.min),
        condition: day.weather[0].main,
        icon: mapWeatherIcon(day.weather[0].icon)
      })),
      rainfall: {
        // Calculate past 7 days rainfall (would need historical data)
        last7Days: calculatePastRainfall(owmData),
        // Project next 7 days rainfall from forecast
        projected7Days: calculateProjectedRainfall(owmData)
      }
    };
    
    // Cache the data
    weatherCache[cacheKey] = {
      data: transformedData,
      timestamp: now,
      expires: CACHE_DURATION
    };
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Fallback to mock data on error
    return { ...mockWeatherData };
  }
};

// Calculate past rainfall based on available data
// In a real implementation, this would use historical data from another API endpoint
const calculatePastRainfall = (owmData: any): number => {
  // This is a simplified estimation since we don't have historical data
  // In reality, you would use a separate API call to get this data
  return parseFloat((Math.random() * 1.5).toFixed(1));
};

// Calculate projected rainfall for next 7 days
const calculateProjectedRainfall = (owmData: any): number => {
  let totalRain = 0;
  
  // Sum up precipitation for next 7 days (or however many days are available)
  const daysToConsider = Math.min(7, owmData.daily.length);
  
  for (let i = 0; i < daysToConsider; i++) {
    const day = owmData.daily[i];
    // rain is in mm, convert to inches (1 mm = 0.0393701 inches)
    if (day.rain) {
      totalRain += day.rain * 0.0393701;
    }
  }
  
  return parseFloat(totalRain.toFixed(1));
};

/**
 * Clear weather data cache for testing or force refresh
 */
export const clearWeatherCache = (): void => {
  Object.keys(weatherCache).forEach(key => {
    delete weatherCache[key];
  });
  console.log('Weather cache cleared');
};