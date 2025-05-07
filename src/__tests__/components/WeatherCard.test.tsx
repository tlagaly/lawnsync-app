import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeatherCard from '../../../src/features/dashboard/components/WeatherCard';
import { mockWeatherData } from '../utils/testUtils';
import * as weatherService from '../../../src/lib/weatherService';

// Mock the weatherService
vi.mock('../../../src/lib/weatherService', () => ({
  getWeatherBasedLawnTip: vi.fn().mockReturnValue('Sample lawn tip for testing')
}));

describe('WeatherCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders without crashing', () => {
    render(<WeatherCard weather={mockWeatherData} />);
    
    // Check if the component's main header is present
    expect(screen.getByText('Weather Summary')).toBeInTheDocument();
  });
  
  it('displays current weather data correctly', () => {
    render(<WeatherCard weather={mockWeatherData} />);
    
    // Check current temperature
    expect(screen.getByText(`${mockWeatherData.current.temp}°`)).toBeInTheDocument();
    
    // Check weather condition
    expect(screen.getByText(mockWeatherData.current.condition)).toBeInTheDocument();
    
    // Check humidity and wind
    const humidityAndWind = `Humidity: ${mockWeatherData.current.humidity}% • Wind: ${mockWeatherData.current.windSpeed} mph`;
    expect(screen.getByText(humidityAndWind)).toBeInTheDocument();
  });
  
  it('displays rainfall information correctly', () => {
    render(<WeatherCard weather={mockWeatherData} />);
    
    // Check last 7 days rainfall text
    expect(screen.getByText(`${mockWeatherData.rainfall.last7Days}"`)).toBeInTheDocument();
    
    // Check projected rainfall text
    expect(screen.getByText(`${mockWeatherData.rainfall.projected7Days}"`)).toBeInTheDocument();
    
    // Check if "rainfall" text is present
    expect(screen.getByText(/rainfall/i)).toBeInTheDocument();
  });
  
  it('displays weather forecast for multiple days', () => {
    render(<WeatherCard weather={mockWeatherData} />);
    
    // Check if all days in the forecast are displayed
    mockWeatherData.forecast.forEach(day => {
      expect(screen.getByText(day.day)).toBeInTheDocument();
      expect(screen.getByText(`${day.high}°`)).toBeInTheDocument();
      expect(screen.getByText(`${day.low}°`)).toBeInTheDocument();
    });
  });
  
  it('displays a lawn tip based on weather', () => {
    render(<WeatherCard weather={mockWeatherData} />);
    
    // Check if the lawn tip is displayed
    expect(screen.getByText(/Lawn Tip:/i)).toBeInTheDocument();
    expect(screen.getByText(/Sample lawn tip for testing/i)).toBeInTheDocument();
    
    // Verify the getWeatherBasedLawnTip was called with the correct arguments
    expect(weatherService.getWeatherBasedLawnTip).toHaveBeenCalledWith(mockWeatherData);
  });
  
  it('handles different weather icons correctly', () => {
    // Create a modified version of mock data with different icons
    const modifiedWeatherData = {
      ...mockWeatherData,
      current: {
        ...mockWeatherData.current,
        icon: 'cloud-rain'
      },
      forecast: [
        {
          ...mockWeatherData.forecast[0],
          icon: 'cloud'
        },
        {
          ...mockWeatherData.forecast[1],
          icon: 'sun'
        },
        {
          ...mockWeatherData.forecast[2],
          icon: 'cloud-sun'
        }
      ]
    };
    
    render(<WeatherCard weather={modifiedWeatherData} />);
    
    // Check if SVG elements exist
    // This is a basic check - we can't easily check the specific path content in this test
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });
  
  it('handles missing data gracefully', () => {
    // Create a minimal weather data object with some missing properties
    const minimalWeatherData = {
      current: {
        temp: 72,
        condition: 'Clear',
        humidity: 45,
        windSpeed: 5,
        icon: 'sun'
      },
      forecast: [
        {
          day: 'Today',
          high: 75,
          low: 65,
          condition: 'Clear',
          icon: 'sun'
        }
      ],
      rainfall: {
        last7Days: 0.5,
        projected7Days: 0.2
      }
    };
    
    // Should render without errors even with limited data
    render(<WeatherCard weather={minimalWeatherData} />);
    expect(screen.getByText('Weather Summary')).toBeInTheDocument();
  });
  
  it('applies appropriate styling to elements', () => {
    render(<WeatherCard weather={mockWeatherData} />);
    
    // Check if the main card has some of the expected styling
    const cardElement = screen.getByText('Weather Summary').closest('div');
    expect(cardElement).toHaveStyle({
      backgroundColor: "white",
      borderRadius: "8px",
      overflow: "hidden"
    });
    
    // Check for the presence of forecast grid
    const forecastElement = mockWeatherData.forecast[0].day && 
      screen.getByText(mockWeatherData.forecast[0].day).closest('div')?.parentElement;
    
    expect(forecastElement).toHaveStyle({
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)"
    });
  });
});