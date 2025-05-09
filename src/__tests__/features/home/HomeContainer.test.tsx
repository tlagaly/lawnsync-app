import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HomeContainer from '../../../features/home/HomeContainer';
import { getWeatherForLocation } from '../../../lib/weatherService';
import { getWeatherCompatibleTasks } from '../../../lib/taskSchedulerService';
import { getWateringSchedules, getWaterConservation } from '../../../lib/wateringService';
import { mockWeatherData } from '../../utils/testUtils';
import userEvent from '@testing-library/user-event';

// Mock the service dependencies
vi.mock('../../../lib/weatherService', () => ({
  getWeatherForLocation: vi.fn(),
  getWeatherBasedLawnTip: vi.fn().mockReturnValue('Sample lawn tip for testing')
}));

vi.mock('../../../lib/taskSchedulerService', () => ({
  getWeatherCompatibleTasks: vi.fn(),
  getScheduledTasks: vi.fn()
}));

vi.mock('../../../lib/wateringService', () => ({
  getWateringSchedules: vi.fn(),
  getWaterConservation: vi.fn()
}));

vi.mock('../../../lib/notificationService', () => ({
  getUnreadNotificationCount: vi.fn().mockResolvedValue(2)
}));

describe('HomeContainer', () => {
  // Mock data setup
  const mockTasks = [
    {
      id: '1',
      title: 'Mow the lawn',
      description: 'Weekly lawn mowing',
      dueDate: new Date().toISOString(),
      category: 'mowing',
      priority: 'high',
      isCompleted: false,
      isWeatherAppropriate: true,
      icon: 'cut',
      weatherCondition: 'Sunny'
    },
    {
      id: '2',
      title: 'Apply fertilizer',
      description: 'Apply summer fertilizer',
      dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      category: 'fertilizing',
      priority: 'medium',
      isCompleted: false,
      isWeatherAppropriate: true,
      icon: 'leaf',
      weatherCondition: 'Sunny'
    }
  ];

  const mockWateringSchedules = [
    {
      id: 1,
      scheduledDate: new Date().toISOString(),
      startTime: '06:30',
      duration: 30,
      zones: ['Front Yard', 'Backyard'],
      isCompleted: false,
      isAdjusted: false
    }
  ];

  const mockWaterConservation = {
    gallonsSaved: 1250,
    savingsPercentage: 22
  };

  beforeEach(() => {
    // Setup mock implementations
    (getWeatherForLocation as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockWeatherData);
    (getWeatherCompatibleTasks as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);
    (getWateringSchedules as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockWateringSchedules);
    (getWaterConservation as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockWaterConservation);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders migrated dashboard components correctly', async () => {
    render(<HomeContainer />);
    
    // Initially shows loading state
    expect(screen.getByText(/loading weather data/i)).toBeInTheDocument();
    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      // Check that WeatherCard is rendered with data
      expect(screen.getByText('Weather Summary')).toBeInTheDocument();
      expect(screen.getByText(`${mockWeatherData.current.temp}°`)).toBeInTheDocument();
      
      // Check that TaskList shows the mockTasks
      expect(screen.getByText('Mow the lawn')).toBeInTheDocument();
      expect(screen.getByText('Apply fertilizer')).toBeInTheDocument();
      
      // Check that WateringScheduleCard is rendered
      expect(screen.getByText('Smart Watering Schedule')).toBeInTheDocument();
      
      // Check that QuickActions is rendered
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Smart Watering')).toBeInTheDocument();
      expect(screen.getByText('Take Lawn Photo')).toBeInTheDocument();
    });
  });

  it('shows notification center when notification badge is clicked', async () => {
    const user = userEvent.setup();
    render(<HomeContainer />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Find and click the notification badge
    const notificationButton = screen.getByLabelText('Notifications');
    await user.click(notificationButton);
    
    // Check that notification center is displayed
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });
});