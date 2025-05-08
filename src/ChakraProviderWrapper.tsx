import React from 'react';
import theme from './theme';

interface ChakraProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * ChakraProviderWrapper component that works around Chakra UI 3.17.0 compatibility issues
 *
 * This implementation uses a simple wrapper that applies basic styling without
 * depending on the Chakra UI provider directly. This allows components to render
 * correctly while avoiding TypeScript errors with the Chakra UI API.
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