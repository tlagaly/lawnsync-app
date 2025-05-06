import React from 'react';
// Temporarily using direct HTML/CSS instead of Chakra UI due to compatibility issues with v3.17.0
// import { Box, Flex } from '@chakra-ui/react';
import DashboardHeader from './components/DashboardHeader';
import WeatherCard from './components/WeatherCard';
import TaskList from './components/TaskList';
import ProgressTracker from './components/ProgressTracker';
import QuickActions from './components/QuickActions';
import { mockUserData, mockWeatherData, mockTasks } from './mockData';

/**
 * Dashboard Container - Main dashboard screen after onboarding
 * Displays personalized lawn care plan based on user's profile
 */
const DashboardContainer: React.FC = () => {
  // Load mock data - would be replaced with API calls
  const userData = mockUserData;
  const weatherData = mockWeatherData;
  const tasks = mockTasks;

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
          <WeatherCard weather={weatherData} />
          
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