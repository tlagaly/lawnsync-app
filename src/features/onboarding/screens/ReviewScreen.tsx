import React from 'react'
import colors from '../../../theme/foundations/colors'

interface ReviewScreenProps {
  location: string
  lawnType: string
  goals: string[]
}

/**
 * Review screen for the onboarding flow
 * Shows a summary of all selections made during onboarding
 */
const ReviewScreen: React.FC<ReviewScreenProps> = ({ location, lawnType, goals }) => {
  // Get readable lawn type name from ID
  const getLawnTypeName = (id: string): string => {
    const lawnTypes: Record<string, string> = {
      'bermuda': 'Bermuda',
      'kentucky-bluegrass': 'Kentucky Bluegrass',
      'fescue': 'Fescue',
      'zoysia': 'Zoysia',
      'st-augustine': 'St. Augustine',
      'ryegrass': 'Ryegrass',
      'unknown': 'Not Sure Yet'
    }
    return lawnTypes[id] || id
  }

  // Get readable goal name from ID
  const getGoalName = (id: string): string => {
    const goalTypes: Record<string, string> = {
      'weed-control': 'Weed Control',
      'greener-grass': 'Greener Grass',
      'drought-resistance': 'Drought Resistance',
      'fill-bare-spots': 'Fill Bare Spots',
      'pest-control': 'Pest Control',
      'less-mowing': 'Less Mowing',
      'kid-pet-safe': 'Kid & Pet Safe',
      'eco-friendly': 'Eco-Friendly'
    }
    return goalTypes[id] || id
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Summary icon */}
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
                d="M9,10V12H7V10H9M13,10V12H11V10H13M17,10V12H15V10H17M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H6V1H8V3H16V1H18V3H19M19,19V8H5V19H19M9,14V16H7V14H9M13,14V16H11V14H13M17,14V16H15V14H17Z"
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
          Here's a summary of your lawn profile. We'll use this information to create your personalized lawn care plan.
        </p>

        {/* Summary cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginTop: '0.5rem'
        }}>
          {/* Location summary */}
          <div style={{
            backgroundColor: colors.gray[50],
            borderRadius: '0.5rem',
            padding: '1rem',
            border: `1px solid ${colors.gray[200]}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                height: '36px',
                width: '36px',
                borderRadius: '50%',
                backgroundColor: colors.blue[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg 
                  viewBox="0 0 24 24" 
                  width="20px" 
                  height="20px" 
                  style={{ color: colors.blue[500] }}
                >
                  <path
                    fill="currentColor"
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  />
                </svg>
              </div>
              <h3 style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                color: colors.gray[800]
              }}>
                Location
              </h3>
            </div>
            <p style={{
              margin: '0 0 0 3rem',
              fontSize: '0.95rem',
              color: colors.gray[700]
            }}>
              {location || 'Not provided'}
            </p>
          </div>

          {/* Lawn type summary */}
          <div style={{
            backgroundColor: colors.gray[50],
            borderRadius: '0.5rem',
            padding: '1rem',
            border: `1px solid ${colors.gray[200]}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                height: '36px',
                width: '36px',
                borderRadius: '50%',
                backgroundColor: colors.green[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg 
                  viewBox="0 0 24 24" 
                  width="20px" 
                  height="20px" 
                  style={{ color: colors.green[600] }}
                >
                  <path
                    fill="currentColor"
                    d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
                  />
                </svg>
              </div>
              <h3 style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                color: colors.gray[800]
              }}>
                Lawn Type
              </h3>
            </div>
            <p style={{
              margin: '0 0 0 3rem',
              fontSize: '0.95rem',
              color: colors.gray[700]
            }}>
              {getLawnTypeName(lawnType) || 'Not provided'}
            </p>
          </div>

          {/* Goals summary */}
          <div style={{
            backgroundColor: colors.gray[50],
            borderRadius: '0.5rem',
            padding: '1rem',
            border: `1px solid ${colors.gray[200]}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                height: '36px',
                width: '36px',
                borderRadius: '50%',
                backgroundColor: colors.blue[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg 
                  viewBox="0 0 24 24" 
                  width="20px" 
                  height="20px" 
                  style={{ color: colors.blue[500] }}
                >
                  <path
                    fill="currentColor"
                    d="M3,17V19H9V17H3M3,5V7H13V5H3M13,21V19H21V17H13V15H11V21H13M7,9V11H3V13H7V15H9V9H7M21,13V11H11V13H21M15,9H17V7H21V5H17V3H15V9Z"
                  />
                </svg>
              </div>
              <h3 style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                color: colors.gray[800]
              }}>
                Lawn Care Goals
              </h3>
            </div>
            <div style={{
              margin: '0 0 0 3rem',
              fontSize: '0.95rem',
              color: colors.gray[700]
            }}>
              {goals.length > 0 ? (
                <ul style={{ 
                  margin: '0.5rem 0 0 0',
                  paddingLeft: '1.25rem'
                }}>
                  {goals.map(goal => (
                    <li key={goal} style={{ marginBottom: '0.25rem' }}>
                      {getGoalName(goal)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0 }}>No goals selected</p>
              )}
            </div>
          </div>
        </div>

        {/* Info note */}
        <p style={{
          fontSize: '0.875rem',
          color: colors.gray[500],
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          Click "Create My Plan" to generate your personalized lawn care recommendations.
        </p>
      </div>
    </div>
  )
}

export default ReviewScreen