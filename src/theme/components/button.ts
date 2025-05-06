/**
 * LawnSync Button Component Theme
 * 
 * Mobile-first button styles with:
 * - Touch-friendly sizing
 * - Clear visual hierarchy
 * - Consistent branding with app color scheme
 * - Accessibility considerations for outdoor usage
 */

const Button = {
  // Base styles applied to all buttons
  baseStyle: {
    fontWeight: 'medium',
    borderRadius: 'md',
    _focus: {
      boxShadow: 'outline',
    },
    _hover: {
      transform: 'translateY(-1px)',
      boxShadow: 'md',
    },
    _active: {
      transform: 'translateY(0)',
      boxShadow: 'sm',
    },
  },
  
  // Sizes - Mobile-optimized, touch-friendly
  sizes: {
    xs: {
      fontSize: 'xs',
      px: 3,
      py: 1,
      h: 8,  // 32px - Minimum touch target size
      minW: 8,
    },
    sm: {
      fontSize: 'sm',
      px: 4,
      py: 1.5,
      h: 10, // 40px
      minW: 10,
    },
    md: {
      fontSize: 'md',
      px: 5,
      py: 2,
      h: 12, // 48px - Default, good for mobile touch targets
      minW: 12,
    },
    lg: {
      fontSize: 'lg',
      px: 6,
      py: 2.5,
      h: 14, // 56px - Large touch target
      minW: 14,
    },
  },
  
  // Variants
  variants: {
    // Primary action buttons
    primary: {
      bg: 'brand.primary',
      color: 'white',
      _hover: {
        bg: 'green.500',
        _disabled: {
          bg: 'green.300',
        },
      },
      _active: {
        bg: 'green.600',
      },
      _disabled: {
        bg: 'green.300',
        opacity: 0.8,
        cursor: 'not-allowed',
        _hover: {
          bg: 'green.300',
        },
      },
    },
    
    // Secondary action buttons
    secondary: {
      bg: 'brand.secondary',
      color: 'white',
      _hover: {
        bg: 'brown.600',
        _disabled: {
          bg: 'brown.300',
        },
      },
      _active: {
        bg: 'brown.700',
      },
      _disabled: {
        bg: 'brown.300',
        opacity: 0.8,
        cursor: 'not-allowed',
        _hover: {
          bg: 'brown.300',
        },
      },
    },
    
    // Accent buttons
    accent: {
      bg: 'brand.accent',
      color: 'white',
      _hover: {
        bg: 'blue.600',
        _disabled: {
          bg: 'blue.300',
        },
      },
      _active: {
        bg: 'blue.700',
      },
      _disabled: {
        bg: 'blue.300',
        opacity: 0.8,
        cursor: 'not-allowed',
        _hover: {
          bg: 'blue.300',
        },
      },
    },
    
    // Outlined buttons
    outline: {
      bg: 'transparent',
      border: '1px solid',
      borderColor: 'brand.primary',
      color: 'brand.primary',
      _hover: {
        bg: 'green.50',
        _disabled: {
          bg: 'transparent',
        },
      },
      _active: {
        bg: 'green.100',
      },
      _disabled: {
        borderColor: 'green.200',
        color: 'green.200',
        opacity: 0.8,
        cursor: 'not-allowed',
        _hover: {
          bg: 'transparent',
        },
      },
    },
    
    // Ghost buttons (minimal)
    ghost: {
      bg: 'transparent',
      color: 'gray.700',
      _hover: {
        bg: 'gray.100',
      },
      _active: {
        bg: 'gray.200',
      },
      _disabled: {
        color: 'gray.300',
        opacity: 0.8,
        cursor: 'not-allowed',
        _hover: {
          bg: 'transparent',
        },
      },
    },
    
    // Link buttons
    link: {
      padding: 0,
      height: 'auto',
      lineHeight: 'normal',
      color: 'brand.accent',
      _hover: {
        textDecoration: 'underline',
        color: 'blue.600',
      },
      _active: {
        color: 'blue.700',
      },
      _disabled: {
        color: 'blue.300',
        opacity: 0.8,
        cursor: 'not-allowed',
        _hover: {
          textDecoration: 'none',
        },
      },
    },
  },
  
  // Default values
  defaultProps: {
    size: 'md',
    variant: 'primary',
  },
};

export default Button;