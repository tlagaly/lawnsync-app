import React from 'react';
// Temporarily using direct HTML/CSS instead of Chakra UI due to compatibility issues
// import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import colors from '../../../theme/foundations/colors';

interface DashboardHeaderProps {
  location: string;
  lawnType: string;
}

/**
 * Header component that displays at the top of the dashboard
 * Shows user's location and lawn type
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({ location, lawnType }) => {
  return (
    <header
      style={{
        backgroundColor: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        padding: "16px"
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          {/* Logo and App Name */}
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: colors.green[500],
              fontFamily: "Poppins, sans-serif",
              margin: 0
            }}
          >
            LawnSync
          </h1>
          
          {/* Location & Lawn Type Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            {/* Location Icon and Text */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  color: colors.gray[500],
                  marginRight: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16px"
                  height="16px"
                  style={{ color: 'currentColor' }}
                >
                  <path
                    fill="currentColor"
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: "14px",
                  color: colors.gray[700],
                  fontWeight: "500"
                }}
              >
                {location}
              </span>
            </div>
            
            <span style={{ color: colors.gray[400], margin: "0 4px" }}>•</span>
            
            {/* Lawn Type */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  color: colors.green[500],
                  marginRight: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16px"
                  height="16px"
                  style={{ color: 'currentColor' }}
                >
                  <path
                    fill="currentColor"
                    d="M12 22a9 9 0 0 0 9-9A9 9 0 0 0 3 13a9 9 0 0 0 9 9zm0-18c-4.97 0-9 4.03-9 9a7.94 7.94 0 0 1 2.25-5.51C5.24 6.34 6.13 6 7 6h10c.87 0 1.76.34 2.75 1.49A7.94 7.94 0 0 1 22 13c0-4.97-4.03-9-9-9z"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: "14px",
                  color: colors.gray[700],
                  fontWeight: "500"
                }}
              >
                {lawnType}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;