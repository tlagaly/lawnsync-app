import { NextResponse } from 'next/server';
import { GET as getCurrentWeather } from '../current/route';
import { GET as getForecast } from '../forecast/route';
import { mockWeatherData, mockForecastData } from '@/test/utils';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      const response = new Response(JSON.stringify(data), init);
      Object.defineProperty(response, 'json', {
        writable: true,
        value: async () => data,
      });
      return response;
    },
  },
}));

// Mock the weather service
jest.mock('@/lib/weather', () => ({
  getCurrentWeather: jest.fn(),
  getForecast: jest.fn(),
}));

describe('Weather API Routes', () => {
  const mockRequest = (location?: string) => {
    const url = new URL('http://localhost:3000/api/weather');
    if (location) {
      url.searchParams.set('location', location);
    }
    return new Request(url);
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Current Weather Endpoint', () => {
    it('returns current weather data', async () => {
      const { getCurrentWeather: mockGetWeather } = require('@/lib/weather');
      mockGetWeather.mockResolvedValueOnce(mockWeatherData);

      const response = await getCurrentWeather(mockRequest('66044'));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockWeatherData);
    });

    it('handles errors', async () => {
      const { getCurrentWeather: mockGetWeather } = require('@/lib/weather');
      mockGetWeather.mockRejectedValueOnce(new Error('API error'));

      const response = await getCurrentWeather(mockRequest('66044'));
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch weather data');
    });
  });

  describe('Forecast Endpoint', () => {
    it('returns forecast data', async () => {
      const { getForecast: mockGetForecast } = require('@/lib/weather');
      mockGetForecast.mockResolvedValueOnce(mockForecastData);

      const response = await getForecast(mockRequest('66044'));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockForecastData);
    });

    it('handles errors', async () => {
      const { getForecast: mockGetForecast } = require('@/lib/weather');
      mockGetForecast.mockRejectedValueOnce(new Error('API error'));

      const response = await getForecast(mockRequest('66044'));
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch forecast data');
    });
  });
});