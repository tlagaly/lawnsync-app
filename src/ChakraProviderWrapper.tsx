import React from 'react';
import theme from './theme';

interface ChakraProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * ChakraProviderWrapper component that applies basic styling for the app
 *
 * This simplified wrapper avoids Chakra UI compatibility issues by using
 * basic HTML and CSS instead of the Chakra Provider.
 */
const ChakraProviderWrapper: React.FC<ChakraProviderWrapperProps> = ({ children }) => {
  // Apply basic theme variables as CSS variables
  const globalStyles = {
    fontFamily: theme.fonts?.body || 'system-ui, -apple-system, sans-serif',
    color: theme.colors?.gray?.[800] || '#1A202C',
    backgroundColor: '#ffffff',
    lineHeight: '1.5',
    fontSize: '16px'
  };

  return (
    <div style={globalStyles}>
      {children}
    </div>
  );
};

export default ChakraProviderWrapper;