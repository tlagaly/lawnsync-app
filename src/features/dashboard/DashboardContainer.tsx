import React, { useState, useEffect } from 'react';
// Temporarily using direct HTML/CSS instead of Chakra UI due to compatibility issues with v3.17.0
// import { Box, Flex } from '@chakra-ui/react';
import DashboardHeader from './components/DashboardHeader';
import WeatherCard from './components/WeatherCard';
import TaskList from './components/TaskList';
import TaskScheduler from './components/TaskScheduler';
import ProgressTracker from './components/ProgressTracker';
import QuickActions from './components/QuickActions';
import { mockUserData, mockTasks } from './mockData';
import { getWeatherForLocation } from '../../lib/weatherService';
import { getScheduledTasks, getWeatherCompatibleTasks } from '../../lib/taskSchedulerService';
import type { WeatherData } from '../../lib/weatherService';
import type { ScheduledTask } from '../../types/scheduler';
import colors from '../../theme/foundations/colors';

/**
 * Dashboard Container - Main dashboard screen after onboarding
 * Displays personalized lawn care plan based on user's profile
 */
const DashboardContainer: React.FC = () => {
  // Load mock data - would be replaced with API calls
  const userData = mockUserData;
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');

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
  
  useEffect(() => {
    // Fetch weather-compatible tasks
    const fetchTasks = async () => {
      try {
        setIsLoadingTasks(true);
        const weatherTasks = await getWeatherCompatibleTasks(userData.location);
        setTasks(weatherTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoadingTasks(false);
      }
    };
    
    fetchTasks();
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
          
          {/* Task View Toggle */}
          <div
            style={{
              display: "flex",
              borderRadius: "0.5rem",
              overflow: "hidden",
              border: `1px solid ${colors.gray[200]}`,
              backgroundColor: "white",
            }}
          >
            <button
              onClick={() => setActiveView('list')}
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "none",
                backgroundColor: activeView === 'list' ? colors.green[500] : "white",
                color: activeView === 'list' ? "white" : colors.gray[700],
                fontWeight: activeView === 'list' ? 600 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}
            >
              <span style={{ 
                display: 'inline-flex',
                color: 'currentColor',
                width: '20px', 
                height: '20px' 
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
              </span>
              Task List
            </button>
            
            <button
              onClick={() => setActiveView('calendar')}
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "none",
                backgroundColor: activeView === 'calendar' ? colors.green[500] : "white",
                color: activeView === 'calendar' ? "white" : colors.gray[700],
                fontWeight: activeView === 'calendar' ? 600 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}
            >
              <span style={{ 
                display: 'inline-flex',
                color: 'currentColor', 
                width: '20px', 
                height: '20px' 
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.75 2.5a.75.75 0 0 0-1.5 0v1.25a.75.75 0 0 0 1.5 0V2.5Zm10 0a.75.75 0 0 0-1.5 0v1.25a.75.75 0 0 0 1.5 0V2.5ZM3.75 5h16.5a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V5.75a.75.75 0 0 1 .75-.75Zm1.5 1.5v10h13.5v-10H5.25Z" />
                </svg>
              </span>
              Scheduler
            </button>
          </div>
          
          {/* Task Views */}
          {isLoadingTasks ? (
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
            }}>
              Loading tasks...
            </div>
          ) : (
            <>
              {/* Conditionally render TaskList or TaskScheduler based on active view */}
              {activeView === 'list' ? (
                <TaskList tasks={tasks} showWeatherIndicators={true} />
              ) : (
                <TaskScheduler />
              )}
            </>
          )}
          
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