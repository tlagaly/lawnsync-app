import React from 'react';
import colors from '../../../theme/foundations/colors';

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  category: string;
  isCompleted: boolean;
  icon: string;
}

interface TaskListProps {
  tasks: Task[];
}

/**
 * Task List component that displays prioritized lawn care tasks
 * based on the user's lawn profile
 */
const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
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
        <ul style={{ 
          listStyleType: 'none',
          margin: 0,
          padding: 0
        }}>
          {tasks.map((task) => (
            <li 
              key={task.id}
              style={{
                padding: '1rem',
                borderBottom: '1px solid',
                borderBottomColor: colors.gray[100],
                opacity: task.isCompleted ? 0.7 : 1,
                backgroundColor: task.isCompleted ? colors.gray[50] : 'white'
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
                    </div>
                    
                    <input 
                      type="checkbox" 
                      checked={task.isCompleted}
                      readOnly
                      style={{
                        accentColor: colors.green[500]
                      }}
                      // In a real app, this would update task completion status
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
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