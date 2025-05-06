import React from 'react';
// Temporarily using direct HTML/CSS instead of Chakra UI due to compatibility issues
// import { Box, Flex, Text, Grid, GridItem, Heading } from '@chakra-ui/react';
import colors from '../../../theme/foundations/colors';

interface WeatherCardProps {
  weather: {
    current: {
      temp: number;
      condition: string;
      humidity: number;
      windSpeed: number;
      icon: string;
    };
    forecast: Array<{
      day: string;
      high: number;
      low: number;
      condition: string;
      icon: string;
    }>;
    rainfall: {
      last7Days: number;
      projected7Days: number;
    };
  };
}

/**
 * Weather summary card showing current conditions and forecast
 * for the user's lawn location
 */
const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  const { current, forecast, rainfall } = weather;
  
  // Get appropriate weather icon component
  const getWeatherIcon = (iconName: string) => {
    // Simple mapping of icon names to SVG paths
    const iconMap: Record<string, string> = {
      'sun': 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z',
      'cloud': 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z',
      'cloud-sun': 'M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98.03-.08.06-.15.06-.24 0-.68-.55-1.24-1.24-1.24-.08 0-.16.02-.24.06-.32-.04-.64-.07-.98-.07-.34 0-.66.03-.98.07-.08-.04-.16-.06-.24-.06-.68 0-1.24.55-1.24 1.24 0 .08.02.16.06.24-.04.32-.07.64-.07.98 0 .34.03.66.07.98-.03.08-.06.16-.06.24 0 .68.55 1.24 1.24 1.24.08 0 .16-.02.24-.06.32.04.64.07.98.07.34 0 .66-.03.98-.07.08.04.16.06.24.06.68 0 1.24-.55 1.24-1.24 0-.08-.02-.16-.06-.24zM12 9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0-7C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
      'cloud-rain': 'M17.92 7.02C17.45 4.18 14.97 2 12 2 9.82 2 7.83 3.18 6.78 5.06 4.09 5.41 2 7.74 2 10.5 2 13.53 4.47 16 7.5 16h10c2.48 0 4.5-2.02 4.5-4.5 0-2.34-1.79-4.27-4.08-4.48zM14.8 17l-2.9 3.32 2 1.03L15.3 19h.7l1.4 2.36 2-1.04L17.2 17h-2.4zm-6.51 0l-2.9 3.32 2 1.03L8.8 19h.7l1.4 2.36 2-1.04L10.7 17H8.29z',
      'flower': 'M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zm0-18c-4.97 0-9 4.03-9 9 4.97 0 9-4.03 9-9zm0 9c0 4.97 4.03 9 9 9-4.97 0-9-4.03-9-9zm0 0c0-4.97-4.03-9-9-9 4.97 0 9 4.03 9 9z',
      'droplet': 'M12 2.69l5.66 5.66c3.12 3.12 3.12 8.19 0 11.31-1.56 1.56-3.61 2.34-5.66 2.34s-4.1-.78-5.66-2.34c-3.12-3.12-3.12-8.19 0-11.31L12 2.69z',
      'cut': 'M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3h-3z',
      'leaf': 'M6.05 8.05c-2.73 2.73-2.73 7.15-.02 9.88 1.47-3.4 4.13-6.06 7.53-7.53-2.72-2.71-7.15-2.7-9.88 0-1.45 1.45-2.12 3.34-2.13 5.24V19h3.87a9.29 9.29 0 0 1 5.24-2.13c-2.31-2.3-2.36-4.95-.01-7.3 2.92-2.93 6.76-3.54 10.02-1.89L12.06 20l1.43 1.4L21.84 12c-.03-4.19-2.74-7.84-6.54-8.91-4.3-1.21-8.08.46-10.42 2.79l-1.17 1.17a7.15 7.15 0 0 1 2.34 1z',
      'tool': 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
    };
    
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
        <path d={iconMap[iconName] || iconMap['sun']} />
      </svg>
    );
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        overflow: "hidden"
      }}
    >
      {/* Card Header */}
      <div
        style={{
          backgroundColor: colors.blue[50],
          padding: "16px",
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${colors.gray[100]}`
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: colors.blue[700],
            display: "flex",
            alignItems: "center",
            margin: 0
          }}
        >
          <span
            style={{
              display: "inline-flex",
              marginRight: "8px",
              color: colors.blue[500],
              width: "20px",
              height: "20px"
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
            </svg>
          </span>
          Weather Summary
        </h3>
      </div>
      
      {/* Current Weather */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div>
          <h4
            style={{
              fontSize: "20px",
              fontWeight: "normal",
              margin: 0
            }}
          >
            {current.condition}
          </h4>
          <div
            style={{
              fontSize: "30px",
              fontWeight: "bold",
              color: colors.gray[800]
            }}
          >
            {current.temp}°
          </div>
          <div
            style={{
              fontSize: "14px",
              color: colors.gray[600]
            }}
          >
            Humidity: {current.humidity}% • Wind: {current.windSpeed} mph
          </div>
        </div>
        
        <div
          style={{
            color: colors.blue[400],
            width: "70px",
            height: "70px"
          }}
        >
          {getWeatherIcon(current.icon)}
        </div>
      </div>
      
      {/* Rainfall info */}
      <div
        style={{
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingBottom: "12px",
          paddingTop: 0,
          borderBottom: `1px solid ${colors.gray[100]}`
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <div
            style={{
              color: colors.blue[400],
              width: "16px",
              height: "16px"
            }}
          >
            {getWeatherIcon('droplet')}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: colors.gray[700]
            }}
          >
            <span style={{ fontWeight: "500" }}>
              {rainfall.last7Days}" rainfall
            </span>
            {' '}in last 7 days •
            <span style={{ fontWeight: "500", marginLeft: "4px" }}>
              {rainfall.projected7Days}"
            </span>
            {' '}projected this week
          </div>
        </div>
      </div>
      
      {/* 5-Day Forecast */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "8px",
          padding: "12px 16px"
        }}
      >
        {forecast.map((day, index) => (
          <div
            key={index}
            style={{ textAlign: "center" }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                marginBottom: "4px",
                color: colors.gray[700]
              }}
            >
              {day.day}
            </div>
            <div
              style={{
                color: colors.blue[400],
                width: "24px",
                height: "24px",
                margin: "0 auto 4px"
              }}
            >
              {getWeatherIcon(day.icon)}
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: colors.gray[800]
              }}
            >
              {day.high}°
            </div>
            <div
              style={{
                fontSize: "12px",
                color: colors.gray[500]
              }}
            >
              {day.low}°
            </div>
          </div>
        ))}
      </div>
      
      {/* Weather recommendation */}
      <div
        style={{
          padding: "12px 16px",
          backgroundColor: colors.blue[50],
          borderTop: `1px solid ${colors.gray[100]}`
        }}
      >
        <div
          style={{
            fontSize: "14px",
            color: colors.blue[700]
          }}
        >
          <span style={{ fontWeight: "500" }}>Lawn Tip:</span> Ideal weather for watering your lawn. Plan to water early tomorrow morning.
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;