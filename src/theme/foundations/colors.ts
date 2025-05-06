/**
 * LawnSync Color System
 * 
 * Primary palette: Lawn greens - representing healthy grass and plants
 * Secondary palette: Earth tones - representing soil and natural elements
 * Accent palette: Sky blues - representing weather and water
 * 
 * Mobile-first design with high contrast for outdoor visibility
 */

const colors = {
  // Primary: Lawn Greens
  green: {
    50: '#e7f4e4',
    100: '#c7e5c0',
    200: '#a6d69b',
    300: '#85c775',
    400: '#64b850', // Primary brand color
    500: '#4a9937',
    600: '#3a7a2c',
    700: '#295a20',
    800: '#193b15',
    900: '#091d09',
  },
  
  // Secondary: Earth Tones
  brown: {
    50: '#f7f2ed',
    100: '#e9dfd3',
    200: '#d6c3a8',
    300: '#c4a87d',
    400: '#b18d53', // Secondary brand color
    500: '#96753d',
    600: '#7a5d31',
    700: '#5e4624',
    800: '#422f18',
    900: '#26180c',
  },
  
  // Accent: Sky Blues
  blue: {
    50: '#e5f3ff',
    100: '#cce7ff',
    200: '#99ceff',
    300: '#66b5ff',
    400: '#339cff', // Accent brand color
    500: '#0084ff',
    600: '#006acc',
    700: '#005099',
    800: '#003566',
    900: '#001b33',
  },
  
  // Utility/UI Colors
  gray: {
    50: '#f7f7f7',
    100: '#eeeeee',
    200: '#e2e2e2',
    300: '#d0d0d0',
    400: '#ababab',
    500: '#8a8a8a',
    600: '#636363',
    700: '#505050',
    800: '#323232',
    900: '#121212',
  },
  
  // Semantic Colors
  status: {
    success: '#4a9937', // Same as green.500
    warning: '#F5A623',
    error: '#E53E3E',
    info: '#0084ff', // Same as blue.500
  },
  
  // Brand Specific
  brand: {
    primary: '#64b850', // green.400
    secondary: '#b18d53', // brown.400
    accent: '#339cff', // blue.400
  },
};

export default colors;