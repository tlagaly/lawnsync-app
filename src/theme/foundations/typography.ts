/**
 * LawnSync Typography System
 * 
 * Mobile-first typography with:
 * - Readable sizes for outdoor usage
 * - Optimized for small screens first
 * - Accessible font pairing with sans-serif fallbacks
 * - Clear hierarchy with limited number of sizes
 */

// Font families
const fonts = {
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji'",
  heading: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji'",
  mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
};

// Font sizes - mobile-optimized, with responsive scaling
const fontSizes = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  md: '1rem',        // 16px - Base font size
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
};

// Font weights
const fontWeights = {
  hairline: 100,
  thin: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

// Line heights - slightly increased for better readability on mobile
const lineHeights = {
  normal: 'normal',
  none: 1,
  shorter: 1.25,
  short: 1.375,
  base: 1.5,      // Good for body text on mobile
  tall: 1.625,
  taller: 2,
};

// Letter spacings
const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

// Text styles - presets for common text elements
const textStyles = {
  // Headings
  h1: {
    fontSize: ['2xl', '3xl', '4xl'],  // Responsive: mobile, tablet, desktop
    fontWeight: 'bold',
    lineHeight: 'shorter',
    fontFamily: 'heading',
  },
  h2: {
    fontSize: ['xl', '2xl', '3xl'],
    fontWeight: 'semibold',
    lineHeight: 'shorter',
    fontFamily: 'heading',
  },
  h3: {
    fontSize: ['lg', 'xl', '2xl'],
    fontWeight: 'semibold',
    lineHeight: 'base',
    fontFamily: 'heading',
  },
  h4: {
    fontSize: ['md', 'lg', 'xl'],
    fontWeight: 'medium',
    lineHeight: 'base',
    fontFamily: 'heading',
  },
  
  // Body text
  body: {
    fontSize: 'md',
    fontWeight: 'normal',
    lineHeight: 'base',
  },
  bodySmall: {
    fontSize: 'sm',
    fontWeight: 'normal',
    lineHeight: 'base',
  },
  
  // Special text elements
  button: {
    fontSize: 'md',
    fontWeight: 'medium',
    lineHeight: 'base',
  },
  caption: {
    fontSize: 'sm',
    fontWeight: 'normal',
    lineHeight: 'short',
  },
};

const typography = {
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  textStyles,
};

export default typography;