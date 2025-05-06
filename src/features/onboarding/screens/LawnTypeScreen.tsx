import React, { useState } from 'react'
import colors from '../../../theme/foundations/colors'

interface LawnTypeOption {
  id: string
  name: string
  description: string
  imageComponent: React.ReactNode
}

interface LawnTypeScreenProps {
  onLawnTypeSelected: (lawnType: string) => void
}

/**
 * Lawn type selection screen for the onboarding flow
 * Allows users to select their grass type from common options
 * with visual representations
 */
const LawnTypeScreen: React.FC<LawnTypeScreenProps> = ({ onLawnTypeSelected }) => {
  const [selectedType, setSelectedType] = useState<string>('')

  // Common lawn grass types with descriptions and visual components
  const lawnTypes: LawnTypeOption[] = [
    {
      id: 'bermuda',
      name: 'Bermuda',
      description: 'Heat-tolerant, drought-resistant grass ideal for sunny areas',
      imageComponent: (
        <svg viewBox="0 0 24 24" width="40" height="40" style={{ color: colors.green[500] }}>
          <path fill="currentColor" d="M12,3.77L11.25,4.61C11.25,4.61 9.97,6.06 8.68,7.94C7.39,9.82 6,12.07 6,14.23A6,6 0 0,0 12,20.23A6,6 0 0,0 18,14.23C18,12.07 16.61,9.82 15.32,7.94C14.03,6.06 12.75,4.61 12.75,4.61L12,3.77M12,6.9C12.44,7.42 12.84,7.85 13.68,9.07C14.89,10.83 16,13.07 16,14.23C16,16.45 14.22,18.23 12,18.23C9.78,18.23 8,16.45 8,14.23C8,13.07 9.11,10.83 10.32,9.07C11.16,7.85 11.56,7.42 12,6.9Z" />
        </svg>
      )
    },
    {
      id: 'kentucky-bluegrass',
      name: 'Kentucky Bluegrass',
      description: 'Lush, dark green grass with excellent cold tolerance',
      imageComponent: (
        <svg viewBox="0 0 24 24" width="40" height="40" style={{ color: colors.blue[500] }}>
          <path fill="currentColor" d="M12.08,17.15C12.08,17.15 16.86,15.47 18.07,9.06C18.07,9.06 14.83,10.19 13.8,10.19C12.77,10.19 11.8,9.5 11.8,9.5C11.8,9.5 10.43,11.41 8.5,11.41C6.57,11.41 4.93,10.16 4.93,10.16C4.93,10.16 6.7,16.95 12.08,17.15M8.84,16.54C9.37,16.54 9.81,15.96 9.81,15.26C9.81,14.56 9.37,14 8.84,14C8.31,14 7.87,14.56 7.87,15.26C7.87,15.96 8.31,16.54 8.84,16.54M15.29,16.47C15.83,16.47 16.26,15.89 16.26,15.19C16.26,14.5 15.83,13.91 15.29,13.91C14.76,13.91 14.32,14.5 14.32,15.19C14.32,15.89 14.76,16.47 15.29,16.47M4,21A1,1 0 0,0 5,22H10V19H12V22H17A1,1 0 0,0 18,21V17.33C16.8,18.8 14.83,19.77 12.08,19.77C9.28,19.77 7.22,18.8 6,17.33V21Z" />
        </svg>
      )
    },
    {
      id: 'fescue',
      name: 'Fescue',
      description: 'Shade-tolerant, hardy grass that stays green year-round',
      imageComponent: (
        <svg viewBox="0 0 24 24" width="40" height="40" style={{ color: colors.green[600] }}>
          <path fill="currentColor" d="M3,13A9,9 0 0,0 12,22A9,9 0 0,0 21,13H3M12,22A9,9 0 0,0 21,13C21,13 20.86,13 20.76,13L12,21.76V22H12Z" />
        </svg>
      )
    },
    {
      id: 'zoysia',
      name: 'Zoysia',
      description: 'Dense, drought-resistant grass with excellent wear tolerance',
      imageComponent: (
        <svg viewBox="0 0 24 24" width="40" height="40" style={{ color: colors.green[400] }}>
          <path fill="currentColor" d="M12.4,5H7A5,5 0 0,0 2,10A5,5 0 0,0 7,15H12.4V18H7A8,8 0 0,1 7,2H12.4V5Z" />
        </svg>
      )
    },
    {
      id: 'st-augustine',
      name: 'St. Augustine',
      description: 'Broad-leaf, tropical grass with high heat tolerance',
      imageComponent: (
        <svg viewBox="0 0 24 24" width="40" height="40" style={{ color: colors.green[500] }}>
          <path fill="currentColor" d="M12.28,2C10.86,2 9.5,2.24 8.34,2.72C6.77,3.41 5.65,4.66 5.65,6.14C5.65,7.95 7.29,9.56 9.36,9.91C9.61,9.16 10.23,8.56 11.05,8.34C12.3,8 13.24,8.23 13.93,8.97C15.26,8 16.16,6.19 16.16,4.25C16.16,3.22 15.5,2 12.28,2M14.5,6.5C14.5,7.33 13.83,8 13,8C12.17,8 11.5,7.33 11.5,6.5C11.5,5.67 12.17,5 13,5C13.83,5 14.5,5.67 14.5,6.5M5.28,18.17L4.64,15.77C5.21,15.98 6.06,16.2 7.37,16.2C9.8,16.2 11.13,15.47 12.41,14.71C13.14,14.26 13.85,13.82 14.75,13.57C15.34,13.4 16.07,13.36 17,13.64C17.89,13.91 18.6,14.5 19.05,15.31L16.95,16.3C16.72,15.84 16.41,15.5 16.07,15.37C15.77,15.25 15.47,15.25 15.27,15.3C14.67,15.47 14.12,15.81 13.58,16.15C12.3,16.87 10.8,17.69 7.34,17.69C6.5,17.69 5.89,17.57 5.43,17.46L5.28,18.17M13.88,21.89C14.21,20.56 14.2,19.42 13.88,18.43L16.31,17.5C16.67,18.43 16.84,19.66 16.66,21C16.37,23.1 15.38,24.07 14.7,24.77L13.5,22C13.8,21.68 13.74,21.22 13.88,21.89M7.77,21.12C7.55,20.85 7.08,20.17 6.95,19.68C6.81,19.14 7.03,18.84 7.25,18.61L9.47,19.91C9.22,20.18 9.04,20.46 9.03,20.7C9,21.03 9.34,21.19 9.67,21.33C10.15,21.56 10.37,20.94 10.36,20.7C10.35,20.58 10.18,20.16 10.03,19.87L13,18.07C13.14,18.03 13.29,18 13.45,18C13.44,20.42 11.81,22.43 9.83,22.96C8.68,22.54 8.05,21.94 7.77,21.12Z" />
        </svg>
      )
    },
    {
      id: 'ryegrass',
      name: 'Ryegrass',
      description: 'Fast-growing, cool-season grass with fine texture',
      imageComponent: (
        <svg viewBox="0 0 24 24" width="40" height="40" style={{ color: colors.green[300] }}>
          <path fill="currentColor" d="M15,11H16V13H13V10H14V11H22V9H9V11H15M2,15V9H7V15H2M9,15V13H22V15H9M9,7H22V9H9V7Z" />
        </svg>
      )
    },
    {
      id: 'unknown',
      name: 'Not Sure',
      description: "We'll help you identify your grass type later",
      imageComponent: (
        <svg viewBox="0 0 24 24" width="40" height="40" style={{ color: colors.gray[500] }}>
          <path fill="currentColor" d="M10,19H13V22H10V19M12,2C17.35,2.22 19.68,7.62 16.5,11.67C15.67,12.67 14.33,13.33 13.67,14.17C13,15 13,16 13,17H10C10,15.33 10,13.92 10.67,12.92C11.33,11.92 12.67,11.33 13.5,10.67C15.92,8.43 15.32,5.26 12,5A3,3 0 0,0 9,8H6A6,6 0 0,1 12,2Z" />
        </svg>
      )
    }
  ]

  const handleSelect = (lawnTypeId: string) => {
    setSelectedType(lawnTypeId)
    onLawnTypeSelected(lawnTypeId)
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Grass type icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            height: '60px',
            width: '60px',
            borderRadius: '50%',
            backgroundColor: colors.green[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg 
              viewBox="0 0 24 24" 
              width="30px" 
              height="30px" 
              style={{ color: colors.green[600] }}
            >
              <path
                fill="currentColor"
                d="M12,20H2V18H7.35C9.12,16.43 9.38,14.9 9.45,14H3V12H10V14C10,14.4 9.97,14.81 9.89,15.22C11.17,14.45 12,13 12,11.35C12,10.68 11.88,10.04 11.69,9.46L8.97,10.43L6.93,6.34L9,5.65V3C10.3,3 11.63,3.5 12.63,4.5C13.63,5.5 14.13,6.8 14.13,8.1C14.13,9.4 13.63,10.7 12.63,11.7C11.63,12.7 10.33,13.2 9.03,13.2V15.1C9.03,15.65 9.03,15.65 9.03,15.65C9,15.87 8.93,17.28 10.22,19H12V20M20,20H14V18H20V20M13,11.35C13,11.97 13.27,12.57 13.68,13C14.13,12.57 14.4,11.97 14.4,11.35C14.4,11.04 14.31,10.72 14.14,10.45L12.61,8.86L12.36,8.14L13.05,8L14.41,9.47L14.97,8.97L15.33,9.35L13.85,11L13.82,11.57L14,11.89C14.13,11.73 14.2,11.54 14.2,11.35C14.2,11.06 14.08,10.78 13.88,10.55L13.76,10.36L13.96,10.19L14.31,10.57C14.58,10.88 14.7,11.34 14.56,11.84L14.43,12.32L14.24,12L14,11.68C13.81,11.95 13.7,12.24 13.7,12.54C13.7,13.03 13.97,13.5 14.4,13.83L15,14.39L14.58,14.97L14.06,14.5C13.65,14.17 13.3,13.82 13.1,13.36C12.9,13.07 12.8,12.75 12.8,12.4L12.67,12.19L12.39,12.39C12.39,12.39 12.39,12.39 12.39,12.39C12.34,12.8 12.5,13.21 12.82,13.59L13.5,14.4L12.76,15L12.12,14.1C11.66,13.5 11.46,12.8 11.46,12.12L11.59,11.27L11.59,11.27L11.31,10.75L11.13,11.08C11.06,11.26 11,11.47 11,11.7C11,12.15 11.27,12.61 11.71,12.94L12.76,13.78L12.17,14.25L11.19,13.5C10.58,13.06 10.3,12.42 10.29,11.76C10.28,12.42 10.56,13.06 11.17,13.5L12.41,14.38L12.06,14.81L10.56,13.75C9.81,13.22 9.41,12.38 9.47,11.5L9.5,11.21L9.38,11.25C9.38,11.25 9.38,12.67 10.56,13.75L11.94,14.69L11.7,15L10.03,13.86C9.84,13.74 9.67,13.6 9.53,13.45L9.33,13.76C9.49,13.94 9.68,14.1 9.88,14.23L11.47,15.29L11.2,15.67L9.6,14.61C9.39,14.47 9.18,14.31 9,14.12L8.78,14.5C8.92,14.64 9.08,14.77 9.25,14.88L11.02,16L10.8,16.34L9.31,15.34C9.56,15.87 9.84,16.35 10.21,16.78L10.45,16.83L10.33,16.95C9.95,16.5 9.65,16 9.43,15.46L9,15.19L9.27,15L9.73,15.28L10.39,15.75L10.47,15.5L9.5,14.83C9.32,14.71 9.17,14.58 9.04,14.44L9.14,14.17C9.2,14.25 9.27,14.31 9.35,14.37L10.14,14.92L10.05,14.67L9.42,14.23C9.15,14.05 8.9,13.83 8.72,13.54L8.5,13.29V13.03C8.76,13.46 9.14,13.79 9.58,14L10.38,14.47L10.47,14.16L9.5,13.58C9.2,13.39 8.94,13.16 8.75,12.87L8.5,12.57V12C8.54,12.12 8.59,12.23 8.65,12.34C8.8,12.56 9,12.75 9.21,12.89L10.03,13.42L10.19,13.02L9.41,12.51C9,12.25 8.77,11.73 8.77,11.17C8.77,10.97 8.81,10.77 8.89,10.59L9.27,9.73L9.46,10.06C9.37,10.29 9.33,10.53 9.33,10.78C9.33,11.44 9.74,12.06 10.34,12.42L10.39,12.32L9.63,11.84C9.32,11.64 9.13,11.3 9.13,10.95C9.13,10.76 9.18,10.57 9.27,10.4L9.55,9.96L9.73,10.23C9.68,10.32 9.66,10.41 9.66,10.5C9.66,10.8 9.82,11.09 10.09,11.26L10.7,11.65L10.85,11.37L10.3,11.02C9.93,10.79 9.74,10.37 9.74,9.94C9.74,9.5 9.93,9.09 10.3,8.86L11.34,8.18L11.83,7.29L12.05,7.64L11.5,8.58L10.5,9.25L11.5,9.75L12.68,9.06L13.77,8.41L13.94,8.81L12.85,9.47L11.67,10.14L11.5,10.62L12.7,10.05L13.5,9.72L13.63,10.19L12.83,10.55L11.5,11.25L11.76,11.75L12.83,11.31L13.35,11.18L13.42,11.65L12.91,11.79L11.64,12.32L12.13,12.88L12.61,12.74L12.76,13.19L12.06,13.4L11.5,13.57L12.18,14.17L12.59,14.13L12.68,14.58L12.05,14.65L11.37,14.69L11.89,15.28L12.13,15.32L12.16,15.77L11.74,15.71L11.16,15.64L11.56,16.11L11.74,16.19L11.74,16.64L11.35,16.5L10.64,16L10.79,16.46L10.91,16.58L10.68,16.94L10.45,16.69L10.23,16.11L10.07,16.71L10.13,16.85L9.85,17.06L9.7,16.84L9.5,16L9.18,16.56L9.14,16.87L8.76,16.85L8.82,16.56L9.03,16.13V15.5L8.88,16.16L8.09,16.47L8.76,15.54L9.24,14.63L9.43,14.19L9.5,14L9.28,14.06L8.86,14.89L8.3,15.97L8.05,16.5H7.79L8.3,15.39L8.82,14.56L9.14,14L8.89,14L8.05,15.28L7.05,17.14H6.75L8.05,14.42L8.73,13.26L9.08,12.71L8.81,12.61L7.65,14.44L6.44,16.28L6.05,17H5.71L6.88,14.86Z"
              />
            </svg>
          </div>
        </div>

        {/* Explanation text */}
        <p style={{
          textAlign: 'center',
          color: colors.gray[600],
          fontSize: '1rem',
          marginBottom: '0.5rem',
          margin: 0
        }}>
          Select your lawn type so we can recommend the right care plan.
          Don't worry if you're not sure - you can change this later.
        </p>

        {/* Lawn type selection */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {lawnTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleSelect(type.id)}
              style={{
                border: `2px solid ${selectedType === type.id ? colors.green[500] : colors.gray[200]}`,
                borderRadius: '0.5rem',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                backgroundColor: selectedType === type.id ? colors.green[50] : 'white',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '60px',
                width: '60px',
                borderRadius: '50%',
                backgroundColor: selectedType === type.id ? colors.green[100] : colors.gray[100],
                marginBottom: '0.5rem'
              }}>
                {type.imageComponent}
              </div>
              <h3 style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                color: colors.gray[800],
                textAlign: 'center'
              }}>
                {type.name}
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.75rem',
                color: colors.gray[600],
                textAlign: 'center'
              }}>
                {type.description}
              </p>
              {selectedType === type.id && (
                <div style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  height: '24px',
                  width: '24px',
                  borderRadius: '50%',
                  backgroundColor: colors.green[500],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info note */}
        <p style={{
          fontSize: '0.875rem',
          color: colors.gray[500],
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          Your lawn type helps us determine the optimal mowing height, watering schedule, and seasonal care routines.
        </p>
      </div>
    </div>
  )
}

export default LawnTypeScreen