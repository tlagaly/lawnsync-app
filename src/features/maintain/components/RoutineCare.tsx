import React, { useState, useEffect } from 'react';
import colors from '../../../theme/foundations/colors';
import { getScheduledTasks } from '../../../lib/taskSchedulerService';
import type { ScheduledTask } from '../../../types/scheduler';
import { mockUserData } from '../../dashboard/mockData';

/**
 * RoutineCare component provides a summary dashboard of all lawn maintenance activities
 * with status indicators and quick actions
 */
const RoutineCare: React.FC = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Categories for maintenance tasks
  const categories = [
    { id: 'mowing', name: 'Mowing', icon: '✂️', color: colors.green[500], description: 'Regular grass cutting' },
    { id: 'watering', name: 'Watering', icon: '💧', color: colors.blue[500], description: 'Lawn hydration' },
    { id: 'fertilizing', name: 'Fertilizing', icon: '🌱', color: colors.brown[400], description: 'Nutrient application' },
    { id: 'weed-control', name: 'Weed Control', icon: '🌿', color: colors.status.error, description: 'Weed prevention and removal' },
    { id: 'soil-health', name: 'Soil Health', icon: '🧪', color: colors.brown[500], description: 'Soil testing and treatment' },
    { id: 'pest-control', name: 'Pest Control', icon: '🐛', color: colors.blue[700], description: 'Managing harmful insects' },
  ];
  
  // Maintenance metrics (mock data)
  const metrics = [
    { label: 'Tasks Completed', value: 14, icon: '✓', change: '+3', duration: 'this month' },
    { label: 'Hours Saved', value: 8.5, icon: '⏱️', change: '+2.5', duration: 'this month' },
    { label: 'Water Saved', value: 220, icon: '💧', change: '+45', unit: 'gallons', duration: 'this month' },
    { label: 'Lawn Health', value: 85, icon: '🌿', change: '+12', unit: '%', duration: 'YTD' },
  ];

  // Fetch scheduled tasks when component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const scheduledTasks = await getScheduledTasks();
        setTasks(scheduledTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  // Get tasks for a specific category
  const getTasksForCategory = (categoryId: string): ScheduledTask[] => {
    return tasks.filter(task => task.category === categoryId && !task.isCompleted);
  };
  
  // Get upcoming tasks (next 7 days)
  const getUpcomingTasks = (): ScheduledTask[] => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduledDate);
      return !task.isCompleted && 
        taskDate >= today && 
        taskDate <= nextWeek;
    });
  };
  
  // Get status for a category
  const getCategoryStatus = (categoryId: string): 'good' | 'warning' | 'alert' | 'none' => {
    const categoryTasks = getTasksForCategory(categoryId);
    
    if (categoryTasks.length === 0) {
      return 'none';
    }
    
    const hasOverdue = categoryTasks.some(task => {
      const taskDate = new Date(task.scheduledDate);
      return taskDate < new Date();
    });
    
    if (hasOverdue) {
      return 'alert';
    }
    
    const hasWeatherIssue = categoryTasks.some(task => !task.isWeatherAppropriate);
    
    if (hasWeatherIssue) {
      return 'warning';
    }
    
    return 'good';
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
              <path d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
          </span>
          Routine Care Dashboard
        </h3>
      </div>
      
      {/* Metrics Grid */}
      <div style={{ padding: '1rem', borderBottom: '1px solid', borderBottomColor: colors.gray[100] }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {metrics.map(metric => (
            <div 
              key={metric.label}
              style={{
                padding: '1rem',
                backgroundColor: colors.gray[50],
                borderRadius: '0.375rem',
                border: '1px solid',
                borderColor: colors.gray[200]
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: colors.gray[600] }}>
                  {metric.label}
                </div>
                <div style={{ fontSize: '1.25rem' }}>
                  {metric.icon}
                </div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                {metric.value}{metric.unit}
              </div>
              <div style={{ fontSize: '0.75rem', color: colors.green[600] }}>
                {metric.change} {metric.duration}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Categories Status */}
      <div style={{ padding: '1rem', borderBottom: '1px solid', borderBottomColor: colors.gray[100] }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.gray[700], margin: 0 }}>
            Maintenance Categories
          </h4>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {categories.map(category => {
            const status = getCategoryStatus(category.id);
            const statusColors = {
              good: colors.green[500],
              warning: colors.status.warning,
              alert: colors.status.error,
              none: colors.gray[400]
            };
            
            const categoryTasks = getTasksForCategory(category.id);
            
            return (
              <div 
                key={category.id}
                style={{
                  display: 'flex',
                  padding: '0.75rem',
                  backgroundColor: colors.gray[50],
                  borderRadius: '0.375rem',
                  border: '1px solid',
                  borderColor: colors.gray[200],
                  gap: '0.75rem',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    backgroundColor: statusColors[status]
                  }}
                />
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  backgroundColor: `${category.color}20`, // 20% opacity
                  color: category.color,
                  borderRadius: '0.25rem',
                  fontSize: '1.25rem'
                }}>
                  {category.icon}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {category.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: colors.gray[600] }}>
                    {categoryTasks.length > 0 ? (
                      `${categoryTasks.length} task${categoryTasks.length > 1 ? 's' : ''} scheduled`
                    ) : (
                      'No tasks scheduled'
                    )}
                  </div>
                </div>
                
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: `${statusColors[status]}20`, // 20% opacity
                  color: statusColors[status],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem'
                }}>
                  {status === 'good' && '✓'}
                  {status === 'warning' && '!'}
                  {status === 'alert' && '⚠'}
                  {status === 'none' && '—'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Upcoming Tasks */}
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.gray[700], margin: 0 }}>
            Upcoming Maintenance Tasks
          </h4>
          <button
            style={{
              backgroundColor: colors.green[500],
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              cursor: 'pointer'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Task
          </button>
        </div>
        
        <div>
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: colors.gray[500] }}>
              Loading tasks...
            </div>
          ) : getUpcomingTasks().length === 0 ? (
            <div style={{ 
              padding: '2rem',
              textAlign: 'center',
              color: colors.gray[500],
              border: '1px dashed',
              borderColor: colors.gray[300],
              borderRadius: '0.375rem'
            }}>
              No upcoming maintenance tasks for the next 7 days
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {getUpcomingTasks().map(task => {
                const taskDate = new Date(task.scheduledDate);
                const taskCategory = categories.find(c => c.id === task.category);
                
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      padding: '0.75rem',
                      backgroundColor: colors.gray[50],
                      borderRadius: '0.375rem',
                      border: '1px solid',
                      borderColor: colors.gray[200],
                      gap: '0.75rem',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      backgroundColor: taskCategory ? `${taskCategory.color}20` : colors.gray[200], // 20% opacity
                      color: taskCategory ? taskCategory.color : colors.gray[500],
                      borderRadius: '0.25rem',
                      fontSize: '1rem'
                    }}>
                      {task.icon || taskCategory?.icon || '📋'}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: colors.gray[600], display: 'flex', gap: '0.75rem' }}>
                        <span>
                          {taskDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        {!task.isWeatherAppropriate && (
                          <span style={{ color: colors.status.warning, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            ⚠️ Weather warning
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.green[100],
                        color: colors.green[700],
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </button>
                      <button style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.gray[100],
                        color: colors.gray[700],
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 6v12m6-6H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineCare;