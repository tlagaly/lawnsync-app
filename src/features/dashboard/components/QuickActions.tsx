import React from 'react';
import colors from '../../../theme/foundations/colors';
import { takePhoto, uploadPhoto, getPhotoWeatherData } from '../../../lib/galleryService';

/**
 * Quick Action buttons component
 * Displays common task buttons for fast access to frequent actions
 */
interface QuickActionsProps {
  onNavigateView?: (view: 'list' | 'calendar' | 'gallery' | 'compare' | 'recommendations' | 'identify-plant' | 'watering-config') => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onNavigateView }) => {
  // Array of quick actions
  const actions = [
    {
      id: 'manage-watering',
      label: 'Smart Watering',
      description: 'Manage automatic watering schedule',
      icon: 'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2zm-4.17-6c.37 0 .67.26.74.62.41 2.22 2.28 2.98 3.64 2.87.43-.02.79.32.79.75 0 .4-.32.73-.72.75-2.13.13-4.62-1.09-5.19-4.12-.08-.45.28-.87.74-.87z',
      color: colors.blue[500],
      bgColor: colors.blue[50],
    },
    {
      id: 'log-activity',
      label: 'Log Activity',
      description: 'Record a completed lawn care task',
      icon: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z',
      color: colors.green[500],
      bgColor: colors.green[50],
    },
    {
      id: 'view-plan',
      label: 'View Full Plan',
      description: 'See your complete lawn care calendar',
      icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z',
      color: colors.blue[500],
      bgColor: colors.blue[50],
    },
    {
      id: 'identify-plant',
      label: 'Identify Plant',
      description: 'Identify weeds, diseases, or grass types',
      icon: 'M12 22q-2.05 0-3.9-.788-1.85-.787-3.175-2.137-1.325-1.35-2.1-3.175Q2 14.075 2 12t.825-3.9q.825-1.85 2.125-3.175Q6.25 3.575 8.1 2.787 9.95 2 12 2t3.9.787q1.85.788 3.175 2.138 1.325 1.35 2.1 3.175Q22 9.925 22 12t-.825 3.9q-.825 1.85-2.125 3.175Q17.75 20.425 15.9 21.213 14.05 22 12 22zm0-8q.425 0 .713-.288Q13 13.425 13 13t-.287-.713Q12.425 12 12 12t-.712.287Q11 12.575 11 13t.288.712Q11.575 14 12 14z',
      color: colors.green[600],
      bgColor: colors.green[50],
    },
    {
      id: 'take-photo',
      label: 'Take Lawn Photo',
      description: 'Add a photo to track progress',
      icon: 'M12 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-1h-1.7c-.3 0-.6-.2-.7-.5l-.7-1.9c-.1-.3-.4-.5-.7-.5H9.8c-.3 0-.6.2-.7.5l-.7 1.9c-.1.3-.4.5-.7.5H6c-.6 0-1 .4-1 1v8c0 .6.4 1 1 1h12c.6 0 1-.4 1-1v-8c0-.6-.4-1-1-1zm-6 9c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm7.5-10h-2v-2h-9v2h-2V6c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v4z',
      color: colors.brown[500],
      bgColor: colors.brown[50],
    },
    {
      id: 'ask-advice',
      label: 'Ask for Advice',
      description: 'Get AI recommendations for your lawn',
      icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm10.69-7.46l1.42-1.42c.2-.2.2-.51 0-.71l-1.42-1.42c-.2-.2-.51-.2-.71 0l-1.42 1.42c-1.55-1.09-3.45-1.09-5 0l-1.42-1.42c-.2-.2-.51-.2-.71 0l-1.42 1.42c-.2.2-.2.51 0 .71l1.42 1.42c-1.09 1.55-1.09 3.45 0 5l-1.42 1.42c-.2.2-.2.51 0 .71l1.42 1.42c.2.2.51.2.71 0l1.42-1.42c1.55 1.09 3.45 1.09 5 0l1.42 1.42c.2.2.51.2.71 0l1.42-1.42c.2-.2.2-.51 0-.71l-1.42-1.42c1.09-1.55 1.09-3.45 0-5z',
      color: colors.status.info,
      bgColor: colors.blue[50],
    },
  ];

  // Handle action button click
  const handleActionClick = async (actionId: string) => {
    switch (actionId) {
      case 'manage-watering':
        if (onNavigateView) {
          onNavigateView('watering-config');
        }
        break;
      case 'log-activity':
        console.log('Log activity clicked');
        break;
      case 'view-plan':
        if (onNavigateView) {
          onNavigateView('calendar');
        }
        break;
      case 'identify-plant':
        if (onNavigateView) {
          onNavigateView('identify-plant');
        }
        break;
      case 'take-photo':
        if (onNavigateView) {
          onNavigateView('gallery');
        }
        // You can also trigger the photo capture action directly here
        // Uncomment this if you want the button to immediately open camera
        /*
        try {
          const file = await takePhoto();
          if (file) {
            // Get current date/time
            const now = new Date();
            const dateTaken = now.toISOString();
            
            // Get weather data
            const weatherData = await getPhotoWeatherData();
            
            // Create basic tags (season, time of day)
            const month = now.getMonth();
            let season: string;
            if (month >= 2 && month <= 4) season = 'spring';
            else if (month >= 5 && month <= 7) season = 'summer';
            else if (month >= 8 && month <= 10) season = 'fall';
            else season = 'winter';
            
            const hour = now.getHours();
            let timeOfDay: string;
            if (hour >= 5 && hour < 12) timeOfDay = 'morning';
            else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
            else timeOfDay = 'evening';
            
            // Upload photo
            await uploadPhoto(file, {
              dateTaken,
              title: `Lawn Photo - ${now.toLocaleDateString()}`,
              tags: [season, timeOfDay],
              weather: weatherData || undefined
            });
          }
        } catch (error) {
          console.error('Error taking photo:', error);
        }
        */
        break;
      case 'ask-advice':
        if (onNavigateView) {
          onNavigateView('recommendations');
        }
        break;
      default:
        break;
    }
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
        padding: '1rem',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderBottomColor: colors.gray[100]
      }}>
        <h3 style={{ 
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.gray[800],
          display: 'flex',
          alignItems: 'center',
          margin: 0
        }}>
          <span style={{ 
            display: 'inline-flex', 
            marginRight: '0.5rem', 
            color: colors.gray[500], 
            width: '20px', 
            height: '20px' 
          }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </span>
          Quick Actions
        </h3>
      </div>
      
      {/* Action Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        padding: '1rem'
      }}>
        {actions.map((action) => (
          <div
            key={action.id}
            onClick={() => handleActionClick(action.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: action.bgColor,
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              // Hover styles would be applied with actual CSS classes
              // since inline styles don't support pseudo-selectors like :hover
            }}
          >
            {/* Icon */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                color: action.color,
                width: '24px',
                height: '24px'
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d={action.icon} />
                </svg>
              </div>
            </div>
            
            {/* Label */}
            <h4 style={{
              margin: 0,
              fontSize: '0.875rem',
              fontWeight: 600,
              textAlign: 'center',
              color: colors.gray[800],
              marginBottom: '0.25rem'
            }}>
              {action.label}
            </h4>
            
            {/* Description */}
            <p style={{
              margin: 0,
              fontSize: '0.75rem',
              color: colors.gray[600],
              textAlign: 'center'
            }}>
              {action.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;