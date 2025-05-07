import { vi } from 'vitest';
import type { WeatherData } from '../../lib/weatherService';

// Mock localStorage for all tests
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string): string | null => {
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string): void => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string): void => {
      delete store[key];
    }),
    clear: vi.fn((): void => {
      Object.keys(store).forEach(key => {
        delete store[key];
      });
    }),
    length: Object.keys(store).length,
    key: vi.fn((index: number): string | null => {
      return Object.keys(store)[index] || null;
    }),
    getAllItems: (): Record<string, string> => ({ ...store }),
  };
};

// Sample weather data for testing
export const mockWeatherData: WeatherData = {
  current: {
    temp: 75,
    condition: 'Sunny',
    humidity: 45,
    windSpeed: 8,
    icon: 'sun',
  },
  forecast: [
    {
      day: 'Today',
      high: 78,
      low: 62,
      condition: 'Sunny',
      icon: 'sun',
    },
    {
      day: 'Tomorrow',
      high: 80,
      low: 65,
      condition: 'Partly Cloudy',
      icon: 'cloud-sun',
    },
    {
      day: 'Wednesday',
      high: 72,
      low: 60,
      condition: 'Rain',
      icon: 'cloud-rain',
    },
  ],
  rainfall: {
    last7Days: 1.2,
    projected7Days: 0.8,
  },
};

// Sample rainy weather data for testing
export const mockRainyWeatherData: WeatherData = {
  current: {
    temp: 68,
    condition: 'Rain',
    humidity: 85,
    windSpeed: 12,
    icon: 'cloud-rain',
  },
  forecast: [
    {
      day: 'Today',
      high: 72,
      low: 60,
      condition: 'Rain',
      icon: 'cloud-rain',
    },
    {
      day: 'Tomorrow',
      high: 70,
      low: 58,
      condition: 'Rain',
      icon: 'cloud-rain',
    },
    {
      day: 'Wednesday',
      high: 75,
      low: 62,
      condition: 'Partly Cloudy',
      icon: 'cloud-sun',
    },
  ],
  rainfall: {
    last7Days: 2.5,
    projected7Days: 1.5,
  },
};

// Helper for mocking API responses
export const mockFetch = (data: any) => {
  return vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    })
  );
};

// Helper for waiting in tests
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));