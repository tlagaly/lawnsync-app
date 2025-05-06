import React, { useState } from 'react'
import colors from '../../../theme/foundations/colors'

interface GoalOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

interface GoalsScreenProps {
  onGoalsSelected: (goals: string[]) => void
}

/**
 * Goals selection screen for the onboarding flow
 * Implements a multi-select interface for lawn care priorities
 */
const GoalsScreen: React.FC<GoalsScreenProps> = ({ onGoalsSelected }) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  // Lawn care goal options
  const goalOptions: GoalOption[] = [
    {
      id: 'weed-control',
      name: 'Weed Control',
      description: 'Keep unwanted plants out of your lawn',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" style={{ color: colors.status.error }}>
          <path fill="currentColor" d="M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2M9,7V17H11V13H13V17H15V7H13V11H11V7H9Z" />
        </svg>
      )
    },
    {
      id: 'greener-grass',
      name: 'Greener Grass',
      description: 'Achieve a rich, vibrant green color',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" style={{ color: colors.green[600] }}>
          <path fill="currentColor" d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
        </svg>
      )
    },
    {
      id: 'drought-resistance',
      name: 'Drought Resistance',
      description: 'Keep your lawn healthy with less water',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" style={{ color: colors.status.warning }}>
          <path fill="currentColor" d="M12,3.25C12,3.25 6,10 6,14C6,17.32 8.69,20 12,20A6,6 0 0,0 18,14C18,10 12,3.25 12,3.25M14.47,9.97L15.53,11.03L9.53,17.03L8.47,15.97M9.75,10A1.25,1.25 0 0,1 11,11.25A1.25,1.25 0 0,1 9.75,12.5A1.25,1.25 0 0,1 8.5,11.25A1.25,1.25 0 0,1 9.75,10M14.25,14.5A1.25,1.25 0 0,1 15.5,15.75A1.25,1.25 0 0,1 14.25,17A1.25,1.25 0 0,1 13,15.75A1.25,1.25 0 0,1 14.25,14.5Z" />
        </svg>
      )
    },
    {
      id: 'fill-bare-spots',
      name: 'Fill Bare Spots',
      description: 'Repair patchy areas in your lawn',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" style={{ color: colors.brown[400] }}>
          <path fill="currentColor" d="M19.5,3.09L15,7.6V4H13V11H20V9H16.4L20.91,4.5L19.5,3.09M14,16.6V13H12V20H19V18H15.4L19.91,13.5L18.5,12.09L14,16.6M7.6,14H4V12H11V19H9V15.4L4.5,19.91L3.09,18.5L7.6,14M4.09,5.5L3.09,4.5L7.6,0H11V7H9V3.4L4.09,8.31V5.5Z" />
        </svg>
      )
    },
    {
      id: 'pest-control',
      name: 'Pest Control',
      description: 'Keep insects and other pests away',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" style={{ color: colors.blue[700] }}>
          <path fill="currentColor" d="M9.19,6.35C8,6.09 6.85,6 6.85,6C6.85,6 7.17,7.1 7.5,8.5C4.5,9 2.92,12.33 2.92,12.33C2.92,12.33 4.05,12.28 6.5,11.5C3.5,14.5 7.5,20 7.5,20C7.5,20 10,14 15,11.5C17,14 19,15 19,15L19.54,12.33C18.5,10.67 17.5,10 17.5,10C17.5,10 15.8,14.69 13.34,16.67C13.34,16.67 14,6 9.19,6.35Z" />
        </svg>
      )
    },
    {
      id: 'less-mowing',
      name: 'Less Mowing',
      description: 'Reduce the frequency of mowing needed',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" style={{ color: colors.gray[600] }}>
          <path fill="currentColor" d="M12.43,11C12.28,10.84 10.18,7.5 7,7.5V8.5C9.55,8.5 11.29,11.28 11.3,11.29L12.43,11M9,4A4,4 0 0,0 5,8A4,4 0 0,0 9,12A4,4 0 0,0 13,8A4,4 0 0,0 9,4M9,6A2,2 0 0,1 11,8A2,2 0 0,1 9,10A2,2 0 0,1 7,8A2,2 0 0,1 9,6M17,22H19V24H31V22H33V19C33,16.79 31.21,15 29,15C26.79,15 25,16.79 25,19V22M27,19C27,17.9 27.9,17 29,17C30.1,17 31,17.9 31,19V22H27V19M29,12V14H17V22H13V17H7A2,2 0 0,1 5,15V11H7V13H9.33C8.51,12.35 8,11.23 8,10C8,7.79 9.79,6 12,6C14.21,6 16,7.79 16,10C16,11.23 15.49,12.35 14.67,13H17V16H29V12Z" />
        </svg>
      )
    },
    {
      id: 'kid-pet-safe',
      name: 'Kid & Pet Safe',
      description: 'Use family-friendly lawn care methods',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" style={{ color: colors.blue[500] }}>
          <path fill="currentColor" d="M12,5A3.5,3.5 0 0,0 8.5,8.5A3.5,3.5 0 0,0 12,12A3.5,3.5 0 0,0 15.5,8.5A3.5,3.5 0 0,0 12,5M12,7A1.5,1.5 0 0,1 13.5,8.5A1.5,1.5 0 0,1 12,10A1.5,1.5 0 0,1 10.5,8.5A1.5,1.5 0 0,1 12,7M5.5,8A2.5,2.5 0 0,0 3,10.5C3,11.44 3.53,12.25 4.29,12.68C4.65,12.88 5.06,13 5.5,13C5.94,13 6.35,12.88 6.71,12.68C7.08,12.47 7.39,12.17 7.62,11.81C6.89,10.86 6.5,9.7 6.5,8.5C6.5,8.41 6.5,8.31 6.5,8.22C6.2,8.08 5.86,8 5.5,8M18.5,8C18.14,8 17.8,8.08 17.5,8.22C17.5,8.31 17.5,8.41 17.5,8.5C17.5,9.7 17.11,10.86 16.38,11.81C16.5,12 16.63,12.15 16.78,12.3C16.94,12.45 17.1,12.58 17.29,12.68C17.65,12.88 18.06,13 18.5,13C18.94,13 19.35,12.88 19.71,12.68C20.47,12.25 21,11.44 21,10.5A2.5,2.5 0 0,0 18.5,8M12,14C9.66,14 5,15.17 5,17.5V19H19V17.5C19,15.17 14.34,14 12,14M4.71,14.55C2.78,14.78 0,15.76 0,17.5V19H3V17.07C3,16.06 3.69,15.22 4.71,14.55M19.29,14.55C20.31,15.22 21,16.06 21,17.07V19H24V17.5C24,15.76 21.22,14.78 19.29,14.55M12,16C13.53,16 15.24,16.5 16.23,17H7.77C8.76,16.5 10.47,16 12,16Z" />
        </svg>
      )
    },
    {
      id: 'eco-friendly',
      name: 'Eco-Friendly',
      description: 'Maintain your lawn with minimal environmental impact',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" style={{ color: colors.green[500] }}>
          <path fill="currentColor" d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
        </svg>
      )
    }
  ]

  // Toggle goal selection
  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      // If already selected, remove it
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId)
      }
      // Otherwise, add it
      return [...prev, goalId]
    })
  }

  // Update parent component when goals change
  React.useEffect(() => {
    onGoalsSelected(selectedGoals)
  }, [selectedGoals, onGoalsSelected])

  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Goals icon */}
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
                d="M3,17V19H9V17H3M3,5V7H13V5H3M13,21V19H21V17H13V15H11V21H13M7,9V11H3V13H7V15H9V9H7M21,13V11H11V13H21M15,9H17V7H21V5H17V3H15V9Z"
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
          Select your lawn care priorities so we can customize your plan.
          You can select multiple goals.
        </p>

        {/* Goal selection */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginTop: '1rem'
        }}>
          {goalOptions.map((goal) => (
            <div
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              style={{
                border: `2px solid ${selectedGoals.includes(goal.id) ? colors.green[500] : colors.gray[200]}`,
                borderRadius: '0.5rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                backgroundColor: selectedGoals.includes(goal.id) ? colors.green[50] : 'white',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '48px',
                width: '48px',
                borderRadius: '50%',
                backgroundColor: selectedGoals.includes(goal.id) ? colors.green[100] : colors.gray[100],
                flexShrink: 0
              }}>
                {goal.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: colors.gray[800]
                }}>
                  {goal.name}
                </h3>
                <p style={{
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.875rem',
                  color: colors.gray[600]
                }}>
                  {goal.description}
                </p>
              </div>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                border: `2px solid ${selectedGoals.includes(goal.id) ? colors.green[500] : colors.gray[300]}`,
                backgroundColor: selectedGoals.includes(goal.id) ? colors.green[500] : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                {selectedGoals.includes(goal.id) && (
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                  </svg>
                )}
              </div>
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
          Your goals help us prioritize recommendations and create a personalized care plan.
        </p>
      </div>
    </div>
  )
}

export default GoalsScreen