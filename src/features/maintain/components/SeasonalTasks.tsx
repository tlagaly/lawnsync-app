import React, { useState, useEffect } from 'react';
import colors from '../../../theme/foundations/colors';
import { getScheduledTasks, createScheduledTask } from '../../../lib/taskSchedulerService';
import { getWeatherForLocation } from '../../../lib/weatherService';
import type { ScheduledTask } from '../../../types/scheduler';
import { mockUserData } from '../../dashboard/mockData';

/**
 * SeasonalTasks component for displaying and scheduling season-specific lawn care tasks
 */
const SeasonalTasks: React.FC = () => {
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>('spring');
  const [loading, setLoading] = useState<boolean>(true);
  const [weather, setWeather] = useState<any>(null);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Seasonal tasks categorized by season
  const seasonalTasks = {
    spring: [
      { 
        id: 'spring-1', 
        title: 'Apply pre-emergent herbicide',
        description: 'Prevents crabgrass and other weeds before they germinate',
        category: 'weed-control',
        durationMinutes: 45,
        bestMonths: 'March-April',
        icon: '🌱'
      },
      { 
        id: 'spring-2', 
        title: 'Soil test and pH balancing',
        description: 'Test soil and apply amendments based on results',
        category: 'soil-health',
        durationMinutes: 60,
        bestMonths: 'March-May',
        icon: '🧪'
      },
      { 
        id: 'spring-3', 
        title: 'First nitrogen fertilizer application',
        description: 'Promotes vigorous growth and green-up',
        category: 'fertilizing',
        durationMinutes: 40,
        bestMonths: 'April-May',
        icon: '🌿'
      },
      { 
        id: 'spring-4', 
        title: 'Adjust mower height',
        description: 'Set to proper height for spring growth',
        category: 'mowing',
        durationMinutes: 15,
        bestMonths: 'March',
        icon: '✂️'
      }
    ],
    summer: [
      { 
        id: 'summer-1', 
        title: 'Raise mowing height',
        description: 'Higher cut helps shade soil and retain moisture',
        category: 'mowing',
        durationMinutes: 15,
        bestMonths: 'June-August',
        icon: '✂️'
      },
      { 
        id: 'summer-2', 
        title: 'Apply post-emergent weed control',
        description: 'Spot treat for broadleaf weeds',
        category: 'weed-control',
        durationMinutes: 45,
        bestMonths: 'June-July',
        icon: '🌿'
      },
      { 
        id: 'summer-3', 
        title: 'Summer fertilization (if needed)',
        description: 'Light application of slow-release nitrogen',
        category: 'fertilizing',
        durationMinutes: 40,
        bestMonths: 'June',
        icon: '🌱'
      },
      { 
        id: 'summer-4', 
        title: 'Check for insect damage',
        description: 'Look for signs of grubs, chinch bugs, etc.',
        category: 'pest-control',
        durationMinutes: 30,
        bestMonths: 'July',
        icon: '🐛'
      }
    ],
    fall: [
      { 
        id: 'fall-1', 
        title: 'Core aeration',
        description: 'Alleviates soil compaction and improves air circulation',
        category: 'soil-health',
        durationMinutes: 90,
        bestMonths: 'September-October',
        icon: '🕳️'
      },
      { 
        id: 'fall-2', 
        title: 'Overseed lawn',
        description: 'Fill in bare spots and improve density',
        category: 'planting',
        durationMinutes: 120,
        bestMonths: 'September',
        icon: '🌱'
      },
      { 
        id: 'fall-3', 
        title: 'Fall fertilization',
        description: 'Important for root development and winter hardiness',
        category: 'fertilizing',
        durationMinutes: 45,
        bestMonths: 'October-November',
        icon: '🌿'
      },
      { 
        id: 'fall-4', 
        title: 'Lower mower height',
        description: 'Gradually lower for final mowing of the season',
        category: 'mowing',
        durationMinutes: 15,
        bestMonths: 'October-November',
        icon: '✂️'
      }
    ],
    winter: [
      { 
        id: 'winter-1', 
        title: 'Clean and sharpen mower blades',
        description: 'Prepare equipment for next season',
        category: 'maintenance',
        durationMinutes: 60,
        bestMonths: 'December-January',
        icon: '🔧'
      },
      { 
        id: 'winter-2', 
        title: 'Apply winter fertilizer (cool climates)',
        description: 'Helps with spring green-up',
        category: 'fertilizing',
        durationMinutes: 45,
        bestMonths: 'Late November',
        icon: '❄️'
      },
      { 
        id: 'winter-3', 
        title: 'Protect sensitive areas',
        description: 'Cover delicate plants or grass if severe cold expected',
        category: 'protection',
        durationMinutes: 60,
        bestMonths: 'December-February',
        icon: '🧣'
      },
      { 
        id: 'winter-4', 
        title: 'Plan for spring',
        description: 'Order seeds, plan new landscaping projects',
        category: 'planning',
        durationMinutes: 120,
        bestMonths: 'January-February',
        icon: '📝'
      }
    ]
  };

  // Determine current season based on month
  useEffect(() => {
    const determineCurrentSeason = () => {
      const month = new Date().getMonth();
      // 0-2: winter, 3-5: spring, 6-8: summer, 9-11: fall
      if (month >= 2 && month <= 4) return 'spring';
      if (month >= 5 && month <= 7) return 'summer';
      if (month >= 8 && month <= 10) return 'fall';
      return 'winter';
    };

    setCurrentSeason(determineCurrentSeason());
  }, []);

  // Fetch weather and scheduled tasks on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get weather data for the user's location
        const weatherData = await getWeatherForLocation(mockUserData.location);
        setWeather(weatherData);

        // Get scheduled tasks to check what's already scheduled
        const tasks = await getScheduledTasks();
        setScheduledTasks(tasks);
      } catch (error) {
        console.error('Error fetching data for seasonal tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle adding a seasonal task to the scheduler
  const handleAddTask = async (task: any) => {
    try {
      // Calculate a date in the near future (7 days from now)
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 7);
      
      // Format the date as YYYY-MM-DD
      const formattedDate = scheduledDate.toISOString().split('T')[0];
      
      // Create a new scheduled task
      const newTask: Omit<ScheduledTask, 'id'> = {
        title: task.title,
        description: task.description,
        category: task.category,
        priority: 'medium',
        dueDate: formattedDate,
        scheduledDate: formattedDate,
        isCompleted: false,
        isWeatherAppropriate: true,
        weatherCondition: weather?.current?.condition || 'Unknown',
        rescheduledCount: 0,
        icon: task.icon // Add the required icon property
      };
      
      // Add the task to the scheduler
      await createScheduledTask(newTask);
      
      // Show success message
      setSuccessMessage(`${task.title} added to your schedule for ${formattedDate}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error adding seasonal task to schedule:', error);
    }
  };

  // Check if a task is already scheduled
  const isTaskScheduled = (taskTitle: string): boolean => {
    return scheduledTasks.some(task => 
      task.title === taskTitle && 
      !task.isCompleted &&
      new Date(task.scheduledDate) >= new Date()
    );
  };

  // Get season-specific tips based on the current weather
  const getSeasonalTip = (): string => {
    if (!weather) return "Loading weather data...";
    
    const { current } = weather;
    const temperature = current.temp;
    const condition = current.condition.toLowerCase();
    
    switch (currentSeason) {
      case 'spring':
        if (condition.includes('rain')) {
          return "Wait until soil is dry enough before aerating or seeding. Wet soil can compact more easily.";
        } else if (temperature > 75) {
          return "Apply pre-emergent herbicides earlier when soil temperatures consistently reach 55°F.";
        } else {
          return "Spring is ideal for core aeration and overseeding in most cool-season grass regions.";
        }
      
      case 'summer':
        if (temperature > 85) {
          return "Raise mowing height during hot periods to reduce stress on your lawn and help retain moisture.";
        } else if (condition.includes('rain')) {
          return "Avoid fertilizing right before heavy rain to prevent runoff.";
        } else {
          return "Early morning watering (4-10am) is best to reduce evaporation and fungal disease.";
        }
      
      case 'fall':
        if (condition.includes('frost')) {
          return "Apply winter fertilizer before the first hard freeze for best results.";
        } else if (temperature < 50) {
          return "Fall is the best time for core aeration and overseeding cool-season grasses.";
        } else {
          return "Gradually lower mowing height in late fall to prevent snow mold.";
        }
      
      case 'winter':
        if (condition.includes('snow')) {
          return "Avoid walking on frozen grass to prevent damage to dormant grass blades.";
        } else if (temperature < 32) {
          return "Protect irrigation systems by ensuring they're properly winterized.";
        } else {
          return "Winter is a great time to service your lawn equipment for the upcoming season.";
        }
      
      default:
        return "Follow seasonal lawn care practices for best results.";
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex',
        backgroundColor: colors.green[50],
        padding: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderBottomColor: colors.gray[100]
      }}>
        <h3 style={{ 
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.green[700],
          display: 'flex',
          alignItems: 'center',
          margin: 0
        }}>
          <span style={{ 
            display: 'inline-flex', 
            marginRight: '0.5rem', 
            color: colors.green[500], 
            width: '20px', 
            height: '20px' 
          }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.9999 2C6.47774 2 2.00488 6.47712 2.00488 12C2.00488 17.5229 6.47774 22 11.9999 22C17.5221 22 21.9949 17.5229 21.9949 12C21.9949 6.47712 17.5221 2 11.9999 2Z M15.9059 12C15.9059 14.4853 13.8932 16.5 11.409 16.5C8.92473 16.5 6.91203 14.4853 6.91203 12C6.91203 9.51472 8.92473 7.5 11.409 7.5C13.8932 7.5 15.9059 9.51472 15.9059 12Z" />
            </svg>
          </span>
          Seasonal Lawn Care Tasks
        </h3>
        
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          {['spring', 'summer', 'fall', 'winter'].map(season => (
            <button
              key={season}
              onClick={() => setCurrentSeason(season as any)}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: currentSeason === season ? colors.green[500] : 'white',
                color: currentSeason === season ? 'white' : colors.gray[700],
                border: '1px solid',
                borderColor: currentSeason === season ? colors.green[600] : colors.gray[300],
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: currentSeason === season ? 600 : 400,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {season}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: colors.gray[500] }}>
          Loading seasonal tasks...
        </div>
      ) : (
        <>
          {/* Weather-based seasonal tip */}
          <div style={{
            backgroundColor: colors.green[50],
            padding: '0.75rem 1rem',
            borderBottom: '1px solid',
            borderBottomColor: colors.gray[100],
            fontSize: '0.875rem'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: colors.green[700] }}>
              Seasonal Tip:
            </div>
            <div style={{ color: colors.gray[700] }}>
              {getSeasonalTip()}
            </div>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div style={{
              backgroundColor: colors.green[100],
              color: colors.green[800],
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              borderBottom: '1px solid',
              borderBottomColor: colors.green[200],
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {successMessage}
            </div>
          )}
          
          {/* Tasks List */}
          <div style={{ padding: '1rem' }}>
            <h4 style={{ 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              color: colors.gray[700],
              marginTop: 0,
              marginBottom: '1rem',
              textTransform: 'capitalize'
            }}>
              {currentSeason} Lawn Care Tasks
            </h4>
            
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {seasonalTasks[currentSeason].map(task => (
                <div
                  key={task.id}
                  style={{
                    border: '1px solid',
                    borderColor: colors.gray[200],
                    borderRadius: '0.375rem',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderBottom: '1px solid',
                    borderBottomColor: colors.gray[100],
                    backgroundColor: colors.gray[50]
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      backgroundColor: colors.green[100],
                      borderRadius: '0.25rem',
                      fontSize: '1.25rem'
                    }}>
                      {task.icon}
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {task.title}
                    </div>
                  </div>
                  
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.875rem', color: colors.gray[700], marginBottom: '0.75rem' }}>
                      {task.description}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '0.5rem',
                      marginBottom: '1rem',
                      fontSize: '0.75rem'
                    }}>
                      <span style={{
                        backgroundColor: colors.gray[100],
                        color: colors.gray[700],
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75Z M7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z M18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59Z" />
                        </svg>
                        Best: {task.bestMonths}
                      </span>
                      <span style={{
                        backgroundColor: colors.gray[100],
                        color: colors.gray[700],
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Z M12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" />
                        </svg>
                        {task.durationMinutes} min
                      </span>
                      <span style={{
                        backgroundColor: colors.blue[100],
                        color: colors.blue[700],
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px',
                        textTransform: 'capitalize'
                      }}>
                        {task.category}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleAddTask(task)}
                      disabled={isTaskScheduled(task.title)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: isTaskScheduled(task.title) ? colors.gray[300] : colors.green[500],
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: isTaskScheduled(task.title) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {isTaskScheduled(task.title) ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          Already Scheduled
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          Add to My Schedule
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SeasonalTasks;