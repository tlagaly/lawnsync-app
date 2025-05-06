import React from 'react'
import colors from '../../../theme/foundations/colors'

interface WelcomeScreenProps {
  onGetStarted: () => void
}

/**
 * Welcome screen for the onboarding flow
 * Contains app introduction with value proposition and get started button
 */
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        alignItems: 'center'
      }}>
        {/* Placeholder for illustration/logo */}
        <div 
          style={{
            height: '180px',
            width: '180px',
            borderRadius: '50%',
            backgroundColor: colors.green[50],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem'
          }}
        >
          <svg 
            height="100px" 
            width="100px" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ color: colors.green[500] }}
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <path d="M8 9.8s1.5 1.2 4 1.2 4-1.2 4-1.2" />
          </svg>
        </div>

        {/* Value propositions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <p style={{
            fontWeight: 500,
            fontSize: '1.125rem',
            color: colors.gray[700],
            margin: 0
          }}>
            Get a lush, healthy lawn without the guesswork
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <p style={{
              fontSize: '1rem',
              color: colors.gray[600],
              margin: 0
            }}>
              • Personalized lawn care plan based on your specific conditions
            </p>
            <p style={{
              fontSize: '1rem',
              color: colors.gray[600],
              margin: 0
            }}>
              • Climate-aware recommendations that adapt with the seasons
            </p>
            <p style={{
              fontSize: '1rem',
              color: colors.gray[600],
              margin: 0
            }}>
              • Visual progress tracking to celebrate your lawn's improvement
            </p>
          </div>
        </div>

        {/* Get started button */}
        <button 
          onClick={onGetStarted}
          style={{
            backgroundColor: colors.green[400],
            color: 'white',
            width: '100%',
            marginTop: '1rem',
            fontWeight: 600,
            padding: '1.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Get Started
        </button>
        
        <p style={{
          fontSize: '0.875rem',
          color: colors.gray[500],
          textAlign: 'center',
          marginTop: '0.5rem',
          margin: 0
        }}>
          No account needed until you're ready for your lawn plan
        </p>
      </div>
    </div>
  )
}

export default WelcomeScreen