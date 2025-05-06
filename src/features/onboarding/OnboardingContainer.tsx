import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from './components/OnboardingLayout'
import WelcomeScreen from './screens/WelcomeScreen'
import LocationScreen from './screens/LocationScreen'
import LawnTypeScreen from './screens/LawnTypeScreen'
import GoalsScreen from './screens/GoalsScreen'
import ReviewScreen from './screens/ReviewScreen'

/**
 * OnboardingContainer manages the onboarding flow state and navigation
 */
const OnboardingContainer: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [location, setLocation] = useState('')
  const [lawnType, setLawnType] = useState('')
  const [goals, setGoals] = useState<string[]>([])

  // List of steps in the onboarding process
  const steps = ['Welcome', 'Location', 'Lawn Type', 'Goals', 'Review']

  // Handle navigation to next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Navigate to dashboard when onboarding is complete
      navigate('/dashboard')
    }
  }

  // Handle navigation to previous step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Save location data
  const handleLocationSelected = (selectedLocation: string) => {
    setLocation(selectedLocation)
  }

  // Save lawn type data
  const handleLawnTypeSelected = (selectedLawnType: string) => {
    setLawnType(selectedLawnType)
  }

  // Save goals data
  const handleGoalsSelected = (selectedGoals: string[]) => {
    setGoals(selectedGoals)
  }

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen onGetStarted={handleNext} />
      case 1:
        return (
          <LocationScreen
            onLocationSelected={handleLocationSelected}
          />
        )
      case 2:
        return (
          <LawnTypeScreen
            onLawnTypeSelected={handleLawnTypeSelected}
          />
        )
      case 3:
        return (
          <GoalsScreen
            onGoalsSelected={handleGoalsSelected}
          />
        )
      case 4:
        return (
          <ReviewScreen
            location={location}
            lawnType={lawnType}
            goals={goals}
          />
        )
      default:
        return (
          <div>
            <p style={{ color: '#4A5568' }}>Future step under development</p>
          </div>
        )
    }
  }

  // Determine screen-specific props
  const getScreenProps = () => {
    switch (currentStep) {
      case 0:
        return {
          title: 'Welcome to LawnSync',
          subtitle: 'Your personal lawn care assistant',
          showBackButton: false,
          nextButtonText: 'Get Started',
          showStepIndicator: false,
        }
      case 1:
        return {
          title: 'Where is your lawn located?',
          subtitle: 'This helps us provide recommendations specific to your climate',
          nextButtonText: 'Continue',
          isNextDisabled: !location,
        }
      case 2:
        return {
          title: 'What type of grass do you have?',
          subtitle: 'This helps us tailor your lawn care plan to your specific grass type',
          nextButtonText: 'Continue',
          isNextDisabled: !lawnType,
        }
      case 3:
        return {
          title: 'What are your lawn care goals?',
          subtitle: 'Select the priorities that matter most to you',
          nextButtonText: 'Continue',
          isNextDisabled: goals.length === 0,
        }
      case 4:
        return {
          title: 'Review Your Selections',
          subtitle: 'Your personalized lawn care plan is ready',
          nextButtonText: 'Create My Plan',
        }
      default:
        return {
          title: 'Under Development',
          subtitle: 'This step is coming soon',
          nextButtonText: 'Continue',
        }
    }
  }

  const screenProps = getScreenProps()

  return (
    <OnboardingLayout
      currentStep={currentStep}
      steps={steps}
      onBack={handleBack}
      onNext={handleNext}
      {...screenProps}
    >
      {renderStepContent()}
    </OnboardingLayout>
  )
}

export default OnboardingContainer