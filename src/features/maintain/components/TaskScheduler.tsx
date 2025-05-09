import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import colors from '../../../theme/foundations/colors';
import { 
  getScheduledTasks, 
  getWeatherCompatibleTasks,
  suggestOptimalTiming, 
  rescheduleTask, 
  updateScheduledTask
} from '../../../lib/taskSchedulerService';
import type { ScheduledTask, CalendarDay } from '../../../types/scheduler';
import { mockUserData } from '../../dashboard/mockData';

/**
 * TaskScheduler component provides a calendar view of scheduled tasks with
 * weather-adaptive scheduling features and mobile-first design
 */
const TaskScheduler: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [taskBeingEdited, setTaskBeingEdited] = useState<ScheduledTask | null>(null);
  const navigate = useNavigate();
  
  // Fetch tasks when component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const tasks = await getWeatherCompatibleTasks(mockUserData.location);
        setScheduledTasks(tasks);
        
        // Generate calendar days after tasks are loaded
        generateCalendarDays(currentMonth, tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [currentMonth]);
  
  /**
   * Generate calendar days for the current month view
   */
  const generateCalendarDays = (date: Date, tasks: ScheduledTask[]) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Calculate days from previous month to fill first week
    const daysFromPrevMonth = firstDay.getDay();
    // Calculate total days needed (previous month days + current month days)
    const totalDays = daysFromPrevMonth + lastDay.getDate();
    // Calculate how many rows needed (each row has 7 days)
    const totalRows = Math.ceil(totalDays / 7);
    // Calculate total cells needed
    const totalCells = totalRows * 7;
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < daysFromPrevMonth; i++) {
      const date = new Date(year, month - 1, prevMonthLastDay - daysFromPrevMonth + i + 1);
      days.push({
        date,
        dayOfMonth: date.getDate(),
        dayOfWeek: date.getDay(),
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        tasks: getTasksForDate(tasks, date),
        weather: getWeatherForDate(date),
        isWeatherAppropriate: getTasksForDate(tasks, date).every(task => task.isWeatherAppropriate)
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        dayOfMonth: i,
        dayOfWeek: date.getDay(),
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        tasks: getTasksForDate(tasks, date),
        weather: getWeatherForDate(date),
        isWeatherAppropriate: getTasksForDate(tasks, date).every(task => task.isWeatherAppropriate)
      });
    }
    
    // Add days from next month to fill the last row
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        dayOfMonth: i,
        dayOfWeek: date.getDay(),
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        tasks: getTasksForDate(tasks, date),
        weather: getWeatherForDate(date),
        isWeatherAppropriate: getTasksForDate(tasks, date).every(task => task.isWeatherAppropriate)
      });
    }
    
    setCalendarDays(days);
  };
  
  /**
   * Helper function to check if two dates represent the same day
   */
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  
  /**
   * Get tasks scheduled for a specific date
   */
  const getTasksForDate = (tasks: ScheduledTask[], date: Date): ScheduledTask[] => {
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduledDate);
      return isSameDay(taskDate, date);
    });
  };
  
  /**
   * Get weather forecast for a specific date (mocked for now)
   */
  const getWeatherForDate = (date: Date) => {
    // Mock weather data - in a real implementation, this would use the weather service
    const today = new Date();
    const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Only provide weather for dates within a 5-day forecast
    if (diffDays >= 0 && diffDays < 5) {
      const weatherOptions = [
        { condition: 'Sunny', high: 78, low: 62, icon: 'sun' },
        { condition: 'Partly Cloudy', high: 82, low: 65, icon: 'cloud-sun' },
        { condition: 'Cloudy', high: 80, low: 63, icon: 'cloud' },
        { condition: '30% Rain', high: 75, low: 60, icon: 'cloud-rain' },
        { condition: 'Sunny', high: 73, low: 58, icon: 'sun' }
      ];
      
      return weatherOptions[diffDays];
    }
    
    return undefined;
  };
  
  /**
   * Navigate to previous month
   */
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  /**
   * Navigate to next month
   */
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  /**
   * Handle day selection
   */
  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
  };
  
  /**
   * Handle task completion
   */
  const handleTaskComplete = async (task: ScheduledTask) => {
    try {
      const updatedTask = { ...task, isCompleted: true };
      await updateScheduledTask(updatedTask);
      
      // Update local state
      setScheduledTasks(prevTasks => 
        prevTasks.map(t => (t.id === task.id ? updatedTask : t))
      );
      
      // If this task was in the selected day, update selected day
      if (selectedDay) {
        setSelectedDay({
          ...selectedDay,
          tasks: selectedDay.tasks.map(t => (t.id === task.id ? updatedTask : t))
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };
  
  /**
   * Handle task rescheduling
   */
  const handleReschedule = async (task: ScheduledTask, newDate: string) => {
    try {
      const updatedTask = await rescheduleTask(task.id, newDate, 'Manually rescheduled');
      
      if (updatedTask) {
        // Update local state
        setScheduledTasks(prevTasks => 
          prevTasks.map(t => (t.id === task.id ? updatedTask : t))
        );
        
        // Close task detail view
        setTaskBeingEdited(null);
        
        // Regenerate calendar days with updated tasks
        generateCalendarDays(currentMonth, scheduledTasks.map(t => 
          t.id === task.id ? updatedTask : t
        ));
      }
    } catch (error) {
      console.error('Error rescheduling task:', error);
    }
  };
  
  /**
   * Generate day classes based on day properties
   */
  const getDayClasses = (day: CalendarDay): string => {
    let classes = '';
    
    if (!day.isCurrentMonth) {
      classes += 'text-gray-400 ';
    }
    
    if (day.isToday) {
      classes += 'bg-green-100 font-bold ';
    }
    
    if (day.tasks.length > 0) {
      if (day.isWeatherAppropriate) {
        classes += 'border-green-500 border-2 ';
      } else {
        classes += 'border-amber-500 border-2 ';
      }
    }
    
    return classes;
  };
  
  /**
   * Render weather icon for a day
   */
  const renderWeatherIcon = (day: CalendarDay) => {
    if (!day.weather) {
      return null;
    }
    
    const iconMap: Record<string, string> = {
      'sun': 'M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z',
      'cloud-sun': 'M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.714 1.295 2.573 0 3.287L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z',
      'cloud': 'M2.25 15a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v4.5a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V15Z',
      'cloud-rain': 'M15.75 12.75 18 10.5l-5.25-6-5.25 6 2.25 2.25m1.5 4.5 1.5-1.5m3-3 1.5-1.5m-9 3 1.5-1.5m-3-3 1.5-1.5M4.5 19.5h15M6.75 10.5l2.25-4.5',
    };
    
    const path = iconMap[day.weather.icon] || iconMap['sun'];
    
    return (
      <div style={{ position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px' }}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d={path} />
        </svg>
      </div>
    );
  };
  
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)',
      overflow: 'hidden'
    }}>
      {/* Calendar Header */}
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
              <path d="M6.75 2.5a.75.75 0 0 0-1.5 0v1.25a.75.75 0 0 0 1.5 0V2.5Zm10 0a.75.75 0 0 0-1.5 0v1.25a.75.75 0 0 0 1.5 0V2.5ZM3.75 5h16.5a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V5.75a.75.75 0 0 1 .75-.75Zm1.5 1.5v10h13.5v-10H5.25Z" />
            </svg>
          </span>
          Task Scheduler
        </h3>
        
        <span style={{
          backgroundColor: colors.green[100],
          color: colors.green[800],
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem',
          borderRadius: '9999px',
          fontSize: '0.875rem'
        }}>
          {scheduledTasks.filter(task => !task.isCompleted).length} Scheduled
        </span>
      </div>
      
      {/* Month Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid',
        borderBottomColor: colors.gray[100],
      }}>
        <button 
          onClick={goToPreviousMonth}
          style={{
            background: 'none',
            border: 'none',
            color: colors.gray[700],
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        
        <div style={{ fontWeight: 600, fontSize: '1rem' }}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        
        <button 
          onClick={goToNextMonth}
          style={{
            background: 'none',
            border: 'none',
            color: colors.gray[700],
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
      
      {/* Day names (Sun, Mon, etc.) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        borderBottom: '1px solid',
        borderBottomColor: colors.gray[100],
        fontWeight: 600,
        fontSize: '0.75rem',
        textAlign: 'center',
        padding: '0.5rem 0',
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>
      
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: colors.gray[500] }}>
          Loading calendar...
        </div>
      ) : (
        <>
          {/* Calendar Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            backgroundColor: colors.gray[100],
          }}>
            {calendarDays.map((day, index) => (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                style={{
                  position: 'relative',
                  padding: '0.5rem',
                  backgroundColor: 'white',
                  minHeight: '5rem',
                  cursor: 'pointer',
                }}
                className={getDayClasses(day)}
              >
                <div style={{
                  fontSize: '0.875rem',
                  marginBottom: '0.25rem',
                  color: day.isCurrentMonth ? 'inherit' : colors.gray[400],
                  fontWeight: day.isToday ? 700 : 400,
                }}>
                  {day.dayOfMonth}
                </div>
                
                {/* Weather icon */}
                {renderWeatherIcon(day)}
                
                {/* Task indicators */}
                {day.tasks.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    marginTop: '0.25rem',
                  }}>
                    {day.tasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.25rem',
                          borderRadius: '0.25rem',
                          backgroundColor: task.isWeatherAppropriate
                            ? colors.green[100]
                            : `${colors.status.warning}20`, // 20% opacity
                          color: task.isWeatherAppropriate
                            ? colors.green[800]
                            : colors.status.warning,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textDecoration: task.isCompleted ? 'line-through' : 'none',
                          opacity: task.isCompleted ? 0.7 : 1,
                        }}
                      >
                        {task.title}
                      </div>
                    ))}
                    
                    {day.tasks.length > 2 && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: colors.gray[600],
                        textAlign: 'center',
                      }}>
                        +{day.tasks.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Selected Day Tasks */}
          {selectedDay && (
            <div style={{
              padding: '1rem',
              borderTop: '1px solid',
              borderTopColor: colors.gray[100],
            }}>
              <h4 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1rem',
                fontWeight: 600,
              }}>
                {selectedDay.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
                
                {selectedDay.weather && (
                  <span style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 'normal',
                    color: colors.gray[600],
                  }}>
                    {selectedDay.weather.condition}, {selectedDay.weather.high}°F
                  </span>
                )}
              </h4>
              
              {selectedDay.tasks.length === 0 ? (
                <p style={{ color: colors.gray[500], fontSize: '0.875rem' }}>
                  No tasks scheduled for this day.
                </p>
              ) : (
                <ul style={{
                  listStyleType: 'none',
                  margin: 0,
                  padding: 0,
                }}>
                  {selectedDay.tasks.map((task) => (
                    <li
                      key={task.id}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '0.25rem',
                        marginBottom: '0.5rem',
                        backgroundColor: task.isWeatherAppropriate
                          ? colors.green[50]
                          : `${colors.status.warning}10`, // 10% opacity
                        position: 'relative',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <div>
                          <div style={{
                            fontWeight: 500,
                            textDecoration: task.isCompleted ? 'line-through' : 'none',
                            opacity: task.isCompleted ? 0.7 : 1,
                          }}>
                            {task.title}
                          </div>
                          
                          <div style={{
                            fontSize: '0.75rem',
                            color: colors.gray[600],
                            marginTop: '0.25rem',
                          }}>
                            {task.description}
                          </div>
                          
                          {!task.isWeatherAppropriate && task.weatherCondition && (
                            <div style={{
                              fontSize: '0.75rem',
                              color: colors.status.warning,
                              marginTop: '0.25rem',
                            }}>
                              ⚠️ Not ideal for {task.weatherCondition} conditions
                            </div>
                          )}
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                        }}>
                          {!task.isCompleted && (
                            <>
                              <button
                                onClick={() => handleTaskComplete(task)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: colors.green[600],
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '0.25rem',
                                }}
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => setTaskBeingEdited(task)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: colors.blue[600],
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '0.25rem',
                                }}
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M6 12L3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {/* Task Editing Modal */}
          {taskBeingEdited && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>
                  Reschedule: {taskBeingEdited.title}
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Current Date:</div>
                  <div style={{ color: colors.gray[600] }}>
                    {new Date(taskBeingEdited.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Select New Date:</div>
                  <input
                    type="date"
                    defaultValue={taskBeingEdited.scheduledDate}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: '0.25rem',
                      fontSize: '1rem',
                    }}
                    id="new-date-input"
                  />
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  marginTop: '1rem',
                }}>
                  <button
                    onClick={() => setTaskBeingEdited(null)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: '0.25rem',
                      backgroundColor: 'white',
                      color: colors.gray[700],
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={() => {
                      const input = document.getElementById('new-date-input') as HTMLInputElement;
                      if (input && input.value) {
                        handleReschedule(taskBeingEdited, input.value);
                      }
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '0.25rem',
                      backgroundColor: colors.green[500],
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskScheduler;