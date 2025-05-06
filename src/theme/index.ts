/**
 * LawnSync Theme
 * 
 * Main theme file that combines all foundations and component overrides
 * into a cohesive theme for Chakra UI with mobile-first design principles.
 */

// Import foundations
import colors from './foundations/colors';
import typography from './foundations/typography';
import spacing from './foundations/spacing';

// Import component overrides
import Button from './components/button';
import Card from './components/card';

// Combine all theme foundations and component overrides
const theme = {
  // Foundation styles
  colors: colors,
  ...typography,
  ...spacing,
  
  // Global style overrides
  styles: {
    global: {
      // Base HTML element styles
      'html, body': {
        fontSize: { base: '16px' }, // Base font size
        color: 'gray.800',
        lineHeight: 'base',
        minHeight: '100%',
      },
      // Focus outline for accessibility
      '*:focus': {
        outline: 'none',
        boxShadow: 'outline',
      },
      // Remove default focus for mouse users, maintain for keyboard
      '*:focus:not(:focus-visible)': {
        boxShadow: 'none',
      },
      // Enhanced focus visible for keyboard users
      '*:focus-visible': {
        boxShadow: 'outline',
      },
    },
  },

  // Theme config
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
    cssVarPrefix: 'lawnsync',
  },
  
  // Component overrides
  components: {
    Button,
    Card,
  },
};

export default theme;