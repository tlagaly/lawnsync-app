import React from 'react'
import colors from '../../../theme/foundations/colors'

interface OnboardingNavigationProps {
  onBack?: () => void
  onNext: () => void
  showBackButton?: boolean
  nextButtonText?: string
  isNextDisabled?: boolean
  isFirstStep?: boolean
  isLastStep?: boolean
}

/**
 * OnboardingNavigation handles the back/next navigation controls
 * for moving between onboarding steps
 */
const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  onBack,
  onNext,
  showBackButton = true,
  nextButtonText = 'Next',
  isNextDisabled = false,
  isFirstStep = false,
  isLastStep = false,
}) => {
  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    border: 'none',
  }

  const backButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: colors.gray[600],
    border: `1px solid ${colors.gray[300]}`,
  }

  const nextButtonStyle = {
    ...buttonStyle,
    backgroundColor: isLastStep ? colors.green[500] : colors.green[400],
    color: 'white',
    opacity: isNextDisabled ? 0.7 : 1,
  }

  return (
    <div style={{ 
      width: '100%', 
      display: 'flex', 
      justifyContent: 'space-between', 
      marginTop: '1.5rem' 
    }}>
      {/* Back button - only shown if not the first step and showBackButton is true */}
      {!isFirstStep && showBackButton ? (
        <button
          onClick={onBack}
          style={backButtonStyle}
        >
          Back
        </button>
      ) : (
        <div></div> // Empty div to maintain spacing with flex justify-between
      )}

      {/* Next/Continue button */}
      <button
        onClick={onNext}
        style={nextButtonStyle}
        disabled={isNextDisabled}
      >
        {isLastStep ? 'Get Started' : nextButtonText}
      </button>
    </div>
  )
}

export default OnboardingNavigation