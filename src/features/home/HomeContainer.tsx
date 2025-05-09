import React, { useState, useEffect } from 'react';
import './HomeContainer.css';
import WeatherCard from '../dashboard/components/WeatherCard';
import NotificationBadge from '../dashboard/components/NotificationBadge';
import NotificationCenter from '../dashboard/components/NotificationCenter';
import QuickActions from '../dashboard/components/QuickActions';
import TaskList from '../dashboard/components/TaskList';
import WateringScheduleCard from '../dashboard/components/WateringScheduleCard';
import { getWeatherForLocation } from '../../lib/weatherService';
import { getScheduledTasks, getWeatherCompatibleTasks } from '../../lib/taskSchedulerService';
import type { WeatherData } from '../../lib/weatherService';
import type { ScheduledTask } from '../../types/scheduler';
import { mockUserData } from '../dashboard/mockData';

/**
 * HomeContainer Component
 *
 * Main dashboard/home view that provides an overview of the user's lawn care activities
 * Migrated core functionality from previous DashboardContainer with a more user-centric organization
 */
const HomeContainer: React.FC = () => {
  // State for weather data
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  
  // State for tasks
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  
  // State for notification center visibility
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Load user data from mock data (would be replaced with API calls in production)
  const userData = mockUserData;

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

  // Handle notification badge click
  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  // Handle closing the notification center
  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  // Render only first 3 active tasks for the task summary
  const getTaskSummary = () => {
    return tasks.filter(task => !task.isCompleted).slice(0, 3);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="header-main">
          <div>
            <h1>Welcome to Your Lawn</h1>
            <p className="subtitle">
              Location: {userData.location} • Lawn Type: {userData.lawnType}
            </p>
          </div>
          <div className="notification-wrapper">
            <NotificationBadge onClick={handleNotificationClick} />
          </div>
        </div>
      </div>
      
      <div className="home-content">
        {/* Weather Card Section */}
        <section className="home-section weather-section">
          <h2>Current Conditions</h2>
          {isLoadingWeather ? (
            <div className="loading-card">
              Loading weather data...
            </div>
          ) : weatherData && (
            <WeatherCard weather={weatherData} />
          )}
        </section>
        
        {/* Task Summary Section */}
        <section className="home-section tasks-section">
          <h2>Upcoming Tasks</h2>
          {isLoadingTasks ? (
            <div className="loading-card">
              Loading tasks...
            </div>
          ) : (
            <TaskList
              tasks={getTaskSummary()}
              showWeatherIndicators={true}
            />
          )}
        </section>
        
        {/* Watering Schedule Section */}
        <section className="home-section watering-section">
          <h2>Smart Watering</h2>
          <WateringScheduleCard />
        </section>
        
        {/* Quick Actions Section */}
        <section className="home-section actions-section">
          <h2>Quick Actions</h2>
          <QuickActions />
        </section>
      </div>
      
      {/* Notification Center (appears when triggered) */}
      {showNotifications && (
        <NotificationCenter onClose={handleCloseNotifications} />
      )}
    </div>
  );
};

export default HomeContainer;