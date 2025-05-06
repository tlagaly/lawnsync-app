import React, { useState, useEffect } from 'react';
// Temporarily using direct HTML/CSS instead of Chakra UI due to compatibility issues with v3.17.0
// import { Box, Flex } from '@chakra-ui/react';
import DashboardHeader from './components/DashboardHeader.js';
import WeatherCard from './components/WeatherCard.js';
import TaskList from './components/TaskList.js';
import ProgressTracker from './components/ProgressTracker.js';
import QuickActions from './components/QuickActions.js';
import { mockUserData, mockTasks } from './mockData.js';
import { getWeatherForLocation } from '../../lib/weatherService.js';
import type { WeatherData } from '../../lib/weatherService.js';

/**
 * Dashboard Container - Main dashboard screen after onboarding
 * Displays personalized lawn care plan based on user's profile
 */
const DashboardContainer: React.FC = () => {
  // Load mock data - would be replaced with API calls
  const userData = mockUserData;
  const tasks = mockTasks;
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

  useEffect(() => {
    // Fetch weather data for user location
    const fetchWeatherData = async () => {
      try {
        setIsLoadingWeather(true);
        const weather = await getWeatherForLocation(userData.location);
        setWeatherData(weather);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setIsLoadingWeather(false);
      }
    };

    fetchWeatherData();
  }, [userData.location]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7FAFC",
        paddingBottom: "24px"
      }}
    >
      {/* Dashboard Header with location + lawn type */}
      <DashboardHeader
        location={userData.location}
        lawnType={userData.lawnType}
      />
      
      {/* Main Content Area */}
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "16px"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          {/* Weather Summary Card */}
          {isLoadingWeather ? (
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
            }}>
              Loading weather data...
            </div>
          ) : weatherData && (
            <WeatherCard weather={weatherData} />
          )}
          
          {/* Task List Component */}
          <TaskList tasks={tasks} />
          
          {/* Progress Tracking Section */}
          <ProgressTracker lawnHealth={userData.lawnHealth} />
          
          {/* Quick Action Buttons */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default DashboardContainer;