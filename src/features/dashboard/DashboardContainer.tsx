import React, { useState, useEffect } from 'react';
// Temporarily using direct HTML/CSS instead of Chakra UI due to compatibility issues with v3.17.0
// import { Box, Flex } from '@chakra-ui/react';
import DashboardHeader from './components/DashboardHeader';
import WeatherCard from './components/WeatherCard';
import TaskList from './components/TaskList';
import TaskScheduler from './components/TaskScheduler';
import ProgressTracker from './components/ProgressTracker';
import QuickActions from './components/QuickActions';
import PhotoGallery from './components/PhotoGallery';
import PhotoCompare from './components/PhotoCompare';
import RecommendationList from './components/RecommendationList';
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
  const [activeView, setActiveView] = useState<'list' | 'calendar' | 'gallery' | 'compare' | 'recommendations'>('list');

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
          
          {/* Weather Card (Weather card is shown only in task and calendar views) */}
          {(activeView === 'list' || activeView === 'calendar') && (
            isLoadingWeather ? (
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
            )
          )}
          
          {/* Add Photo Gallery Tab */}
          <div
            style={{
              display: 'flex',
              borderRadius: "0.5rem",
              overflow: "hidden",
              border: `1px solid ${colors.gray[200]}`,
              backgroundColor: "white",
              marginTop: "8px"
            }}
          >
            <button
              onClick={() => setActiveView('list')}
              style={{
                flex: 1,
                padding: "0.75rem 0.5rem",
                border: "none",
                backgroundColor: activeView === 'list' ? colors.green[500] : "white",
                color: activeView === 'list' ? "white" : colors.gray[700],
                fontWeight: activeView === 'list' ? 600 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
                fontSize: "0.8rem"
              }}
            >
              <span style={{
                display: 'inline-flex',
                color: 'currentColor',
                width: '16px',
                height: '16px'
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
              </span>
              Tasks
            </button>
            
            <button
              onClick={() => setActiveView('calendar')}
              style={{
                flex: 1,
                padding: "0.75rem 0.5rem",
                border: "none",
                backgroundColor: activeView === 'calendar' ? colors.green[500] : "white",
                color: activeView === 'calendar' ? "white" : colors.gray[700],
                fontWeight: activeView === 'calendar' ? 600 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
                fontSize: "0.8rem"
              }}
            >
              <span style={{
                display: 'inline-flex',
                color: 'currentColor',
                width: '16px',
                height: '16px'
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.75 2.5a.75.75 0 0 0-1.5 0v1.25a.75.75 0 0 0 1.5 0V2.5Zm10 0a.75.75 0 0 0-1.5 0v1.25a.75.75 0 0 0 1.5 0V2.5ZM3.75 5h16.5a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V5.75a.75.75 0 0 1 .75-.75Zm1.5 1.5v10h13.5v-10H5.25Z" />
                </svg>
              </span>
              Calendar
            </button>
            
            <button
              onClick={() => setActiveView('gallery')}
              style={{
                flex: 1,
                padding: "0.75rem 0.5rem",
                border: "none",
                backgroundColor: activeView === 'gallery' ? colors.green[500] : "white",
                color: activeView === 'gallery' ? "white" : colors.gray[700],
                fontWeight: activeView === 'gallery' ? 600 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
                fontSize: "0.8rem"
              }}
            >
              <span style={{
                display: 'inline-flex',
                color: 'currentColor',
                width: '16px',
                height: '16px'
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h16v16H4V4zm1 15h14V5H5v14zm8-13h5v9h-5V6zm-1 10v-2H6V6h5v2h3v8h-2z" />
                </svg>
              </span>
              Gallery
            </button>
            
            <button
              onClick={() => setActiveView('compare')}
              style={{
                flex: 1,
                padding: "0.75rem 0.5rem",
                border: "none",
                backgroundColor: activeView === 'compare' ? colors.green[500] : "white",
                color: activeView === 'compare' ? "white" : colors.gray[700],
                fontWeight: activeView === 'compare' ? 600 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
                fontSize: "0.8rem"
              }}
            >
              <span style={{
                display: 'inline-flex',
                color: 'currentColor',
                width: '16px',
                height: '16px'
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" />
                </svg>
              </span>
              Compare
            </button>
          </div>
          
          {/* Add Recommendation Tab */}
          <button
            onClick={() => setActiveView('recommendations')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem 1rem',
              marginTop: '0.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              backgroundColor: activeView === 'recommendations' ? colors.blue[500] : colors.blue[50],
              color: activeView === 'recommendations' ? 'white' : colors.blue[700],
              fontWeight: 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
            }}
          >
            <span style={{
              display: 'inline-flex',
              color: 'currentColor',
              width: '20px',
              height: '20px',
              marginRight: '0.5rem'
            }}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
              </svg>
            </span>
            AI Recommendations
          </button>
          
          {/* Content Views */}
          {isLoadingTasks && activeView !== 'gallery' && activeView !== 'compare' && activeView !== 'recommendations' ? (
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
              {/* Conditionally render components based on active view */}
              {activeView === 'list' && <TaskList tasks={tasks} showWeatherIndicators={true} />}
              {activeView === 'calendar' && <TaskScheduler />}
              {activeView === 'gallery' && <PhotoGallery />}
              {activeView === 'compare' && <PhotoCompare />}
              {activeView === 'recommendations' && <RecommendationList />}
            </>
          )}
          
          {/* Progress Tracking Section */}
          <ProgressTracker lawnHealth={userData.lawnHealth} />
          
          {/* Quick Action Buttons */}
          <QuickActions onNavigateView={setActiveView} />
        </div>
      </div>
    </div>
  );
};

export default DashboardContainer;