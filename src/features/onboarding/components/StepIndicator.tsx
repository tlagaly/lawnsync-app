import React from 'react'
import colors from '../../../theme/foundations/colors'

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

/**
 * StepIndicator component displays the progress through a multi-step flow
 * with the current step highlighted and labels for each step
 */
const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  const progressWidth = `${(currentStep / (steps.length - 1)) * 100}%`

  return (
    <div style={{ marginBottom: '1.5rem', width: '100%' }}>
      {/* Step labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              fontSize: '0.875rem',
              fontWeight: i <= currentStep ? 500 : 400,
              color: i <= currentStep ? colors.green[500] : colors.gray[500],
              textAlign: 'center',
              width: `${100 / steps.length}%`,
            }}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Progress track */}
      <div
        style={{
          height: '4px',
          backgroundColor: colors.gray[200],
          borderRadius: '9999px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Progress fill */}
        <div
          style={{
            position: 'absolute',
            height: '100%',
            backgroundColor: colors.green[400],
            borderRadius: '9999px',
            transition: 'width 0.3s ease-in-out',
            width: progressWidth,
          }}
        />
      </div>

      {/* Step dots */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '-8px',
          position: 'relative',
        }}
      >
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              height: '16px',
              width: '16px',
              borderRadius: '9999px',
              backgroundColor: i <= currentStep ? colors.green[400] : colors.gray[200],
              border: '2px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default StepIndicator