import React, { useState, useEffect } from 'react';
import colors from '../../../theme/foundations/colors';
import { getWateringSchedules, getWaterConservation } from '../../../lib/wateringService';
import type { WateringSchedule, WaterConservation } from '../../../types/watering';
import { mockUserData } from '../mockData';

/**
 * WateringScheduleCard component displays upcoming watering events
 * and water conservation statistics
 */
interface WateringScheduleCardProps {
  onConfigureClick?: () => void;
}

const WateringScheduleCard: React.FC<WateringScheduleCardProps> = ({ onConfigureClick }) => {
  const [schedules, setSchedules] = useState<WateringSchedule[]>([]);
  const [conservation, setConservation] = useState<WaterConservation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch watering schedules
        const wateringSchedules = await getWateringSchedules();
        
        // Fetch water conservation statistics
        const waterConservation = await getWaterConservation();
        
        // Sort schedules by date
        const sortedSchedules = [...wateringSchedules].sort((a, b) => 
          new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
        );
        
        // Filter out past schedules
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingSchedules = sortedSchedules.filter(schedule => {
          const scheduleDate = new Date(schedule.scheduledDate);
          scheduleDate.setHours(0, 0, 0, 0);
          return scheduleDate >= today && !schedule.isCompleted;
        });
        
        setSchedules(upcomingSchedules);
        setConservation(waterConservation);
      } catch (error) {
        console.error('Error fetching watering data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Format a date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  // Format time for display (convert from 24hr to 12hr)
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get a descriptive label for watering frequency
  const getWateringFrequencyLabel = (): string => {
    const scheduleCount = schedules.length;
    if (scheduleCount === 0) return 'No upcoming waterings';
    
    const uniqueDates = new Set(schedules.map(s => s.scheduledDate.substring(0, 10)));
    const daysCount = uniqueDates.size;
    
    if (daysCount <= 7) {
      return `${daysCount} watering day${daysCount !== 1 ? 's' : ''} this week`;
    } else {
      return `${daysCount} watering days scheduled`;
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)',
      overflow: 'hidden'
    }}>
      {/* Card Header */}
      <div style={{ 
        display: 'flex',
        backgroundColor: colors.blue[50],
        padding: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderBottomColor: colors.gray[100]
      }}>
        <h3 style={{ 
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.blue[700],
          display: 'flex',
          alignItems: 'center',
          margin: 0
        }}>
          <span style={{ 
            display: 'inline-flex', 
            marginRight: '0.5rem', 
            color: colors.blue[500], 
            width: '20px', 
            height: '20px' 
          }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h.71C7.37 7.69 9.5 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3z" />
              <path d="M15 13v2h3v3h2v-3h3v-2h-3v-3h-2v3h-3z" />
            </svg>
          </span>
          Smart Watering Schedule
        </h3>
        
        <span style={{
          backgroundColor: colors.blue[100],
          color: colors.blue[800],
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem',
          borderRadius: '9999px',
          fontSize: '0.875rem'
        }}>
          {getWateringFrequencyLabel()}
        </span>
      </div>
      
      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: colors.gray[500] }}>
          Loading watering schedule...
        </div>
      ) : (
        <>
          {/* Watering Conservation Stats */}
          {conservation && (
            <div style={{
              padding: '1rem',
              backgroundColor: colors.blue[50],
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              borderBottom: '1px solid',
              borderBottomColor: colors.gray[100]
            }}>
              <div style={{
                flex: '1 1 50%',
                minWidth: '140px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: colors.blue[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.blue[700]
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: colors.gray[600] }}>
                    Water Saved
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.blue[700] }}>
                    {conservation.gallonsSaved.toLocaleString()} gallons
                  </div>
                </div>
              </div>
              
              <div style={{
                flex: '1 1 50%',
                minWidth: '140px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: colors.green[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.green[700]
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: colors.gray[600] }}>
                    Efficiency
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.green[700] }}>
                    {conservation.savingsPercentage}% reduction
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Upcoming Schedules */}
          <div style={{ padding: '1rem' }}>
            <h4 style={{ 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              color: colors.gray[700],
              marginTop: 0,
              marginBottom: '0.75rem'
            }}>
              Upcoming Watering
            </h4>
            
            {schedules.length === 0 ? (
              <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: colors.gray[50],
                borderRadius: '0.375rem',
                color: colors.gray[600]
              }}>
                <p style={{ margin: 0 }}>No upcoming watering schedules</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: colors.gray[500] }}>
                  Your lawn doesn't need watering at this time.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {schedules.slice(0, 3).map((schedule) => (
                  <div key={schedule.id} style={{
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    backgroundColor: schedule.isAdjusted ? colors.brown[50] : colors.gray[50],
                    border: '1px solid',
                    borderColor: schedule.isAdjusted ? colors.brown[200] : colors.gray[200],
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: 600, 
                        color: colors.gray[800],
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        {formatDate(schedule.scheduledDate)}
                        {schedule.isAdjusted && (
                          <span style={{
                            fontSize: '0.75rem',
                            backgroundColor: colors.brown[200],
                            color: colors.brown[700],
                            padding: '0.125rem 0.375rem',
                            borderRadius: '9999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67 0 1.38-1.12 2.5-2.5 2.5zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5 0-.16-.08-.28-.14-.35-.41-.46-.63-1.05-.63-1.65 0-1.38 1.12-2.5 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z" />
                              <circle cx="6.5" cy="11.5" r="1.5" />
                              <circle cx="9.5" cy="7.5" r="1.5" />
                              <circle cx="14.5" cy="7.5" r="1.5" />
                              <circle cx="17.5" cy="11.5" r="1.5" />
                            </svg>
                            Adjusted
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: colors.gray[600] }}>
                        {formatTime(schedule.startTime)} • {schedule.duration} minutes
                      </div>
                      {schedule.isAdjusted && schedule.waterSaved && (
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: colors.green[700],
                          marginTop: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                          </svg>
                          Saved {schedule.waterSaved} gallons of water
                        </div>
                      )}
                    </div>
                    <div style={{
                      minWidth: '40px',
                      height: '40px',
                      backgroundColor: colors.blue[100],
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.blue[700]
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2zm-4.17-6c.37 0 .67.26.74.62.41 2.22 2.28 2.98 3.64 2.87.43-.02.79.32.79.75 0 .4-.32.73-.72.75-2.13.13-4.62-1.09-5.19-4.12-.08-.45.28-.87.74-.87z" />
                      </svg>
                    </div>
                  </div>
                ))}
                
                {schedules.length > 3 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    color: colors.blue[600],
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}>
                    View all {schedules.length} scheduled waterings
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Configure Button */}
          <div style={{ 
            padding: '1rem',
            borderTop: '1px solid',
            borderTopColor: colors.gray[100]
          }}>
            <button
              onClick={onConfigureClick}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: colors.blue[600],
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
              Configure Watering Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WateringScheduleCard;