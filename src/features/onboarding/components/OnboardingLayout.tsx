import React from 'react'
import colors from '../../../theme/foundations/colors'
import StepIndicator from './StepIndicator'
import OnboardingNavigation from './OnboardingNavigation'

interface OnboardingLayoutProps {
  children: React.ReactNode
  currentStep: number
  steps: string[]
  title: string
  subtitle?: string
  onBack?: () => void
  onNext: () => void
  showBackButton?: boolean
  nextButtonText?: string
  isNextDisabled?: boolean
  showStepIndicator?: boolean
}

/**
 * OnboardingLayout provides a consistent container layout for all onboarding screens
 * with title, step indicator, content area, and navigation controls
 */
const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  steps,
  title,
  subtitle,
  onBack,
  onNext,
  showBackButton = true,
  nextButtonText = 'Next',
  isNextDisabled = false,
  showStepIndicator = true,
}) => {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: colors.gray[50],
      padding: '1rem 0'
    }}>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem'
        }}>
          {/* Header with logo */}
          <div style={{ 
            textAlign: 'center', 
            padding: '1rem 0' 
          }}>
            <h1 style={{ 
              fontSize: '2rem',
              fontWeight: 'bold',
              color: colors.green[500],
              fontFamily: 'Poppins, sans-serif',
              margin: 0
            }}>
              LawnSync
            </h1>
          </div>

          {/* Step indicator */}
          {showStepIndicator && (
            <StepIndicator steps={steps} currentStep={currentStep} />
          )}

          {/* Content card */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            padding: '1.5rem',
            width: '100%'
          }}>
            {/* Screen title */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem',
                fontWeight: 600,
                color: colors.gray[800],
                fontFamily: 'Poppins, sans-serif',
                margin: 0
              }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{ 
                  color: colors.gray[600], 
                  fontSize: '1rem',
                  margin: 0
                }}>
                  {subtitle}
                </p>
              )}
            </div>

            {/* Screen content */}
            <div>
              {children}
            </div>

            {/* Navigation controls */}
            <OnboardingNavigation
              onBack={onBack}
              onNext={onNext}
              showBackButton={showBackButton}
              nextButtonText={nextButtonText}
              isNextDisabled={isNextDisabled}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
            />
          </div>

          {/* Footer */}
          <div style={{ 
            textAlign: 'center', 
            paddingTop: '0.5rem', 
            paddingBottom: '1rem'
          }}>
            <p style={{ 
              fontSize: '0.875rem', 
              color: colors.gray[500],
              margin: 0
            }}>
              © 2025 LawnSync • AI-powered lawn care guidance
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingLayout