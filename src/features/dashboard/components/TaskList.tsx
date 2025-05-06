import React, { useState, useEffect } from 'react';
import colors from '../../../theme/foundations/colors';
import { 
  getScheduledTasks, 
  getWeatherCompatibleTasks,
  updateScheduledTask
} from '../../../lib/taskSchedulerService';
import type { ScheduledTask } from '../../../types/scheduler';
import { mockUserData } from '../mockData';

interface TaskListProps {
  tasks?: ScheduledTask[];
  showWeatherIndicators?: boolean;
}

/**
 * Task List component that displays prioritized lawn care tasks
 * based on the user's lawn profile with weather adaptability
 */
const TaskList: React.FC<TaskListProps> = ({ 
  tasks: propTasks, 
  showWeatherIndicators = true 
}) => {
  const [tasks, setTasks] = useState<ScheduledTask[]>(propTasks || []);
  const [loading, setLoading] = useState<boolean>(!propTasks);
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);
  
  // Load tasks from TaskSchedulerService if not provided as props
  useEffect(() => {
    if (propTasks) {
      setTasks(propTasks);
      return;
    }
    
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const fetchedTasks = await getWeatherCompatibleTasks(mockUserData.location);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [propTasks]);
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Get task priority color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high':
        return {
          bg: colors.status.error,
          text: 'white'
        };
      case 'medium':
        return {
          bg: colors.status.warning,
          text: 'gray.800'
        };
      case 'low':
        return {
          bg: colors.blue[400],
          text: 'white'
        };
      default:
        return {
          bg: colors.gray[400],
          text: 'white'
        };
    }
  };

  // Get icon SVG path based on icon name
  const getIconPath = (iconName: string) => {
    const iconMap: Record<string, string> = {
      'leaf': 'M6.05 8.05c-2.73 2.73-2.73 7.15-.02 9.88 1.47-3.4 4.13-6.06 7.53-7.53-2.72-2.71-7.15-2.7-9.88 0-1.45 1.45-2.12 3.34-2.13 5.24V19h3.87a9.29 9.29 0 0 1 5.24-2.13c-2.31-2.3-2.36-4.95-.01-7.3 2.92-2.93 6.76-3.54 10.02-1.89L12.06 20l1.43 1.4L21.84 12c-.03-4.19-2.74-7.84-6.54-8.91-4.3-1.21-8.08.46-10.42 2.79l-1.17 1.17a7.15 7.15 0 0 1 2.34 1z',
      'flower': 'M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zm0-18c-4.97 0-9 4.03-9 9 4.97 0 9-4.03 9-9zm0 9c0 4.97 4.03 9 9 9-4.97 0-9-4.03-9-9zm0 0c0-4.97-4.03-9-9-9 4.97 0 9 4.03 9 9z',
      'cut': 'M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3h-3z',
      'droplet': 'M12 2.69l5.66 5.66c3.12 3.12 3.12 8.19 0 11.31-1.56 1.56-3.61 2.34-5.66 2.34s-4.1-.78-5.66-2.34c-3.12-3.12-3.12-8.19 0-11.31L12 2.69z',
      'tool': 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
    };
    
    return iconMap[iconName] || iconMap['leaf'];
  };

  // Helper to get category display name
  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'fertilizing': 'Fertilizing',
      'weed-control': 'Weed Control',
      'mowing': 'Mowing',
      'watering': 'Watering',
      'soil-health': 'Soil Health',
    };
    
    return categoryMap[category] || category;
  };
  
  // Handle task completion
  const handleCompleteTask = async (task: ScheduledTask) => {
    try {
      const updatedTask = { ...task, isCompleted: true };
      await updateScheduledTask(updatedTask);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(t => (t.id === task.id ? updatedTask : t))
      );
      
      // Close detail view if this task was selected
      if (selectedTask && selectedTask.id === task.id) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };
  
  // Weather icon component
  const WeatherIcon = ({ condition }: { condition: string }) => {
    const getWeatherIconPath = (condition: string) => {
      // Simple mapping of conditions to SVG paths
      if (condition.toLowerCase().includes('sun') || condition.toLowerCase().includes('clear')) {
        return 'M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z';
      } else if (condition.toLowerCase().includes('cloud') && !condition.toLowerCase().includes('rain')) {
        return 'M2.25 15a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v4.5a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V15Z';
      } else if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('drizzle')) {
        return 'M15.75 12.75 18 10.5l-5.25-6-5.25 6 2.25 2.25m1.5 4.5 1.5-1.5m3-3 1.5-1.5m-9 3 1.5-1.5m-3-3 1.5-1.5M4.5 19.5h15M6.75 10.5l2.25-4.5';
      } else {
        return 'M2.25 15a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v4.5a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V15Z';
      }
    };
    
    return (
      <div style={{ 
        width: '16px', 
        height: '16px', 
        color: condition.toLowerCase().includes('rain') ? colors.blue[500] : colors.status.warning 
      }}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d={getWeatherIconPath(condition)} />
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
      {/* Card Header */}
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
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          </span>
          Lawn Care Tasks
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
          {tasks.filter(task => !task.isCompleted).length} Active
        </span>
      </div>
      
      {/* Task List */}
      <div style={{ padding: 0 }}>
        {loading ? (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: colors.gray[500]
          }}>
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: colors.gray[500]
          }}>
            No tasks available.
          </div>
        ) : (
          <ul style={{ 
            listStyleType: 'none',
            margin: 0,
            padding: 0
          }}>
            {tasks.map((task) => (
              <li 
                key={task.id}
                onClick={() => setSelectedTask(task)}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid',
                  borderBottomColor: colors.gray[100],
                  opacity: task.isCompleted ? 0.7 : 1,
                  backgroundColor: task.isCompleted ? colors.gray[50] : 'white',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {/* Task Icon */}
                  <div style={{
                    minWidth: '40px',
                    height: '40px',
                    borderRadius: '0.375rem',
                    backgroundColor: colors.green[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.green[600]
                  }}>
                    <div style={{ width: '24px', height: '24px' }}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d={getIconPath(task.icon)} />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Task Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem'
                    }}>
                      <h4 style={{ 
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: task.isCompleted ? colors.gray[500] : colors.gray[800],
                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                        margin: 0
                      }}>
                        {task.title}
                        
                        {/* Weather Indicator (if enabled and applicable) */}
                        {showWeatherIndicators && task.weatherCondition && (
                          <span style={{ 
                            marginLeft: '0.5rem',
                            position: 'relative',
                            top: '2px'
                          }}>
                            <WeatherIcon condition={task.weatherCondition} />
                          </span>
                        )}
                      </h4>
                      
                      <span style={{
                        marginLeft: '0.5rem',
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                        paddingTop: '0.25rem',
                        paddingBottom: '0.25rem',
                        borderRadius: '9999px',
                        backgroundColor: getPriorityColor(task.priority).bg,
                        color: getPriorityColor(task.priority).text,
                        fontSize: '0.75rem',
                        textTransform: 'capitalize'
                      }}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <p style={{ 
                      fontSize: '0.875rem',
                      color: task.isCompleted ? colors.gray[500] : colors.gray[600],
                      marginBottom: '0.5rem',
                      textDecoration: task.isCompleted ? 'line-through' : 'none',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {task.description}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          backgroundColor: colors.gray[100],
                          color: colors.gray[700],
                          paddingLeft: '0.5rem',
                          paddingRight: '0.5rem',
                          paddingTop: '0.125rem',
                          paddingBottom: '0.125rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem'
                        }}>
                          {getCategoryName(task.category)}
                        </span>
                        
                        <span style={{
                          fontSize: '0.75rem',
                          color: colors.gray[500]
                        }}>
                          Due: {formatDate(task.dueDate)}
                        </span>
                        
                        {/* Weather appropriateness indicator */}
                        {showWeatherIndicators && task.isWeatherAppropriate !== undefined && (
                          <span style={{
                            fontSize: '0.75rem',
                            color: task.isWeatherAppropriate ? colors.green[600] : colors.status.warning,
                          }}>
                            {task.isWeatherAppropriate 
                              ? "✓ Weather appropriate" 
                              : "⚠ Check weather"
                            }
                          </span>
                        )}
                      </div>
                      
                      <input 
                        type="checkbox" 
                        checked={task.isCompleted}
                        onChange={() => handleCompleteTask(task)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          accentColor: colors.green[500]
                        }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Task Detail Modal */}
      {selectedTask && (
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}>
              {/* Task Icon */}
              <div style={{
                minWidth: '48px',
                height: '48px',
                borderRadius: '0.375rem',
                backgroundColor: colors.green[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.green[600]
              }}>
                <div style={{ width: '28px', height: '28px' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d={getIconPath(selectedTask.icon)} />
                  </svg>
                </div>
              </div>
              
              <div>
                <h3 style={{ 
                  margin: '0 0 0.25rem 0',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: colors.gray[800],
                }}>
                  {selectedTask.title}
                </h3>
                
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}>
                  <span style={{
                    backgroundColor: colors.gray[100],
                    color: colors.gray[700],
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    paddingTop: '0.125rem',
                    paddingBottom: '0.125rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem'
                  }}>
                    {getCategoryName(selectedTask.category)}
                  </span>
                  
                  <span style={{
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    paddingTop: '0.125rem',
                    paddingBottom: '0.125rem',
                    borderRadius: '9999px',
                    backgroundColor: getPriorityColor(selectedTask.priority).bg,
                    color: getPriorityColor(selectedTask.priority).text,
                    fontSize: '0.75rem',
                    textTransform: 'capitalize'
                  }}>
                    {selectedTask.priority} Priority
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ 
                margin: '0 0 0.5rem 0',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: colors.gray[700],
              }}>
                Description
              </h4>
              
              <p style={{ 
                margin: 0,
                fontSize: '1rem',
                color: colors.gray[700],
              }}>
                {selectedTask.description}
              </p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ 
                margin: '0 0 0.5rem 0',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: colors.gray[700],
              }}>
                Dates
              </h4>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.875rem',
                color: colors.gray[700],
              }}>
                <div>
                  <div style={{ fontWeight: 500 }}>Due Date:</div>
                  <div>{formatDate(selectedTask.dueDate)}</div>
                </div>
                
                <div>
                  <div style={{ fontWeight: 500 }}>Scheduled Date:</div>
                  <div>{formatDate(selectedTask.scheduledDate)}</div>
                </div>
                
                {selectedTask.suggestedDate && (
                  <div>
                    <div style={{ fontWeight: 500 }}>Suggested Date:</div>
                    <div>{formatDate(selectedTask.suggestedDate)}</div>
                  </div>
                )}
              </div>
            </div>
            
            {showWeatherIndicators && selectedTask.weatherCondition && (
              <div style={{ 
                marginBottom: '1rem',
                padding: '0.75rem',
                borderRadius: '0.25rem',
                backgroundColor: selectedTask.isWeatherAppropriate 
                  ? `${colors.green[500]}10` // 10% opacity
                  : `${colors.status.warning}10`, // 10% opacity
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <WeatherIcon condition={selectedTask.weatherCondition} />
                <div>
                  <div style={{ 
                    fontWeight: 500,
                    color: selectedTask.isWeatherAppropriate 
                      ? colors.green[700]
                      : colors.status.warning,
                  }}>
                    Weather: {selectedTask.weatherCondition}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem',
                    color: colors.gray[700],
                  }}>
                    {selectedTask.isWeatherAppropriate
                      ? "Current weather conditions are appropriate for this task."
                      : "Consider rescheduling due to current weather conditions."
                    }
                  </div>
                </div>
              </div>
            )}
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.5rem',
            }}>
              <button
                onClick={() => setSelectedTask(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.25rem',
                  border: `1px solid ${colors.gray[300]}`,
                  backgroundColor: 'white',
                  color: colors.gray[700],
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
              
              {!selectedTask.isCompleted && (
                <button
                  onClick={() => {
                    handleCompleteTask(selectedTask);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.25rem',
                    border: 'none',
                    backgroundColor: colors.green[500],
                    color: 'white',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Mark Complete
                </button>
              )}
              
              {!selectedTask.isCompleted && (
                <button
                  onClick={() => {
                    // Close this modal and let the user navigate to the scheduler
                    setSelectedTask(null);
                    // In a real implementation, this would navigate to the scheduler with this task pre-selected
                    console.log('Navigating to scheduler for task:', selectedTask.id);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.25rem',
                    border: 'none',
                    backgroundColor: colors.blue[500],
                    color: 'white',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Reschedule
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* View All Link */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid',
        borderTopColor: colors.gray[100]
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: colors.green[600],
            cursor: 'pointer'
          }}>
            View All Tasks →
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskList;