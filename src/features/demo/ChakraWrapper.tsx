import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';

interface ChakraWrapperProps {
  children: React.ReactNode;
}

/**
 * This component provides a proper ChakraProvider context for the demo components
 * Unlike the simplified ChakraProviderWrapper, this one actually creates the context
 * needed by Chakra UI components
 */
const ChakraWrapper: React.FC<ChakraWrapperProps> = ({ children }) => {
  return (
    <ChakraProvider>
      {children}
    </ChakraProvider>
  );
};

export default ChakraWrapper;