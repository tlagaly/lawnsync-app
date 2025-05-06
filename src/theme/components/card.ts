/**
 * LawnSync Card Component Theme
 * 
 * Mobile-first card styles with:
 * - Clean, minimalist design
 * - Consistent elevation patterns
 * - Support for interactive and static cards
 * - Outdoor visibility considerations
 */

const Card = {
  // Base styles applied to all cards
  baseStyle: {
    container: {
      bg: 'white',
      borderRadius: 'lg',
      boxShadow: 'base',
      overflow: 'hidden',
      transition: 'all 0.2s ease-in-out',
    },
    header: {
      px: 4,
      py: 3,
      borderBottom: '1px solid',
      borderColor: 'gray.100',
    },
    body: {
      px: 4,
      py: 3,
    },
    footer: {
      px: 4,
      py: 3,
      borderTop: '1px solid',
      borderColor: 'gray.100',
    },
  },
  
  // Size variations
  sizes: {
    sm: {
      container: {
        borderRadius: 'md',
      },
      header: {
        px: 3,
        py: 2,
      },
      body: {
        px: 3,
        py: 2,
      },
      footer: {
        px: 3,
        py: 2,
      },
    },
    md: {}, // Default, uses baseStyle
    lg: {
      container: {
        borderRadius: 'xl',
      },
      header: {
        px: 5,
        py: 4,
      },
      body: {
        px: 5,
        py: 4,
      },
      footer: {
        px: 5,
        py: 4,
      },
    },
  },
  
  // Card variants
  variants: {
    // Default elevated card
    elevated: {
      container: {
        boxShadow: 'md',
      },
    },
    
    // Flat card without shadow
    flat: {
      container: {
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'gray.200',
      },
    },
    
    // Interactive card with hover effects
    interactive: {
      container: {
        cursor: 'pointer',
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(0)',
          boxShadow: 'md',
        },
      },
    },
    
    // Branded card with primary color accent
    branded: {
      container: {
        borderTop: '4px solid',
        borderColor: 'brand.primary',
      },
    },
    
    // Urgent/highlight card
    highlight: {
      container: {
        borderLeft: '4px solid',
        borderColor: 'status.warning',
      },
    },
    
    // Success card
    success: {
      container: {
        borderLeft: '4px solid',
        borderColor: 'status.success',
      },
    },
  },
  
  // Default values
  defaultProps: {
    size: 'md',
    variant: 'elevated',
  },
};

export default Card;