import React, { useState, useEffect } from 'react';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences 
} from '../../../lib/notificationService';
import { requestPushNotificationPermission } from '../../../lib/notificationIntegration';
import type { 
  NotificationPreferences, 
  NotificationType, 
  NotificationPriority,
  NotificationDeliveryMethod 
} from '../../../types/notification';

/**
 * Component for managing notification preferences
 */
const NotificationPreferencesView: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        const prefs = await getNotificationPreferences();
        setPreferences(prefs);
        setError(null);
      } catch (err) {
        console.error('Error loading notification preferences:', err);
        setError('Failed to load notification preferences');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Handle toggling global notification state
  const handleToggleNotifications = async (enabled: boolean) => {
    if (!preferences) return;
    
    try {
      setIsSaving(true);
      const updatedPrefs = await updateNotificationPreferences({
        ...preferences,
        enabled
      });
      setPreferences(updatedPrefs);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setError('Failed to update notification preferences');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggling a specific delivery method
  const handleToggleDeliveryMethod = async (method: NotificationDeliveryMethod) => {
    if (!preferences) return;
    
    // If enabling push notifications, request permission first
    if (method === 'push' && !preferences.deliveryMethods.includes('push')) {
      const granted = await requestPushNotificationPermission();
      if (!granted) {
        setError('Push notification permission denied by browser');
        return;
      }
    }
    
    try {
      setIsSaving(true);
      
      // Toggle the delivery method
      const updatedMethods = preferences.deliveryMethods.includes(method)
        ? preferences.deliveryMethods.filter(m => m !== method)
        : [...preferences.deliveryMethods, method];
      
      const updatedPrefs = await updateNotificationPreferences({
        ...preferences,
        deliveryMethods: updatedMethods
      });
      
      setPreferences(updatedPrefs);
      setIsSuccess(true);
      setError(null);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setError('Failed to update notification preferences');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggling quiet hours
  const handleToggleQuietHours = async (enabled: boolean) => {
    if (!preferences) return;
    
    try {
      setIsSaving(true);
      const updatedPrefs = await updateNotificationPreferences({
        ...preferences,
        quietHours: {
          ...preferences.quietHours,
          enabled
        }
      });
      setPreferences(updatedPrefs);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating quiet hours:', err);
      setError('Failed to update quiet hours');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle changing quiet hours start/end time
  const handleQuietHoursTimeChange = async (type: 'start' | 'end', time: string) => {
    if (!preferences) return;
    
    try {
      setIsSaving(true);
      const updatedPrefs = await updateNotificationPreferences({
        ...preferences,
        quietHours: {
          ...preferences.quietHours,
          [type]: time
        }
      });
      setPreferences(updatedPrefs);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error(`Error updating quiet hours ${type} time:`, err);
      setError(`Failed to update quiet hours ${type} time`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggling a notification type
  const handleToggleNotificationType = async (type: NotificationType, enabled: boolean) => {
    if (!preferences) return;
    
    try {
      setIsSaving(true);
      const updatedPrefs = await updateNotificationPreferences({
        ...preferences,
        typePreferences: {
          ...preferences.typePreferences,
          [type]: {
            ...preferences.typePreferences[type],
            enabled
          }
        }
      });
      setPreferences(updatedPrefs);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error(`Error updating notification type ${type}:`, err);
      setError(`Failed to update ${type} notifications`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle changing priority for a notification type
  const handleNotificationTypePriorityChange = async (
    type: NotificationType,
    priority: NotificationPriority
  ) => {
    if (!preferences) return;
    
    try {
      setIsSaving(true);
      const updatedPrefs = await updateNotificationPreferences({
        ...preferences,
        typePreferences: {
          ...preferences.typePreferences,
          [type]: {
            ...preferences.typePreferences[type],
            priority
          }
        }
      });
      setPreferences(updatedPrefs);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error(`Error updating priority for ${type}:`, err);
      setError(`Failed to update priority for ${type} notifications`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggling watering notification settings
  const handleToggleWateringReminderTiming = async (
    timing: 'day_before' | 'morning_of' | 'hour_before',
    enabled: boolean
  ) => {
    if (!preferences || !preferences.wateringNotificationSettings) return;
    
    try {
      setIsSaving(true);
      const currentTimings = preferences.wateringNotificationSettings.reminderTiming || [];
      const updatedTimings = enabled
        ? [...currentTimings, timing]
        : currentTimings.filter(t => t !== timing);
      
      const updatedPrefs = await updateNotificationPreferences({
        ...preferences,
        wateringNotificationSettings: {
          ...preferences.wateringNotificationSettings,
          reminderTiming: updatedTimings
        }
      });
      setPreferences(updatedPrefs);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating watering reminder timings:', err);
      setError('Failed to update watering reminder settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggling watering notification options
  const handleToggleWateringNotificationOption = async (
    option: 'notifyOnCompletion' | 'notifyOnCancellation' | 'notifyOnAdjustment',
    enabled: boolean
  ) => {
    if (!preferences || !preferences.wateringNotificationSettings) return;
    
    try {
      setIsSaving(true);
      const updatedPrefs = await updateNotificationPreferences({
        ...preferences,
        wateringNotificationSettings: {
          ...preferences.wateringNotificationSettings,
          [option]: enabled
        }
      });
      setPreferences(updatedPrefs);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error(`Error updating ${option}:`, err);
      setError(`Failed to update ${option}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle changing min rainfall threshold
  const handleMinRainfallChange = async (value: number) => {
    if (!preferences || !preferences.wateringNotificationSettings) return;
    
    try {
      setIsSaving(true);
      const updatedPrefs = await updateNotificationPreferences({
        ...preferences,
        wateringNotificationSettings: {
          ...preferences.wateringNotificationSettings,
          minRainfallToNotify: value
        }
      });
      setPreferences(updatedPrefs);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating min rainfall threshold:', err);
      setError('Failed to update minimum rainfall threshold');
    } finally {
      setIsSaving(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Loading notification preferences...</p>
      </div>
    );
  }

  // Render error state
  if (error || !preferences) {
    return (
      <div style={{ padding: '20px' }}>
        <p style={{ color: '#E53E3E' }}>{error || 'Failed to load notification preferences'}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#48BB78',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <h2 style={{ marginTop: 0 }}>Notification Preferences</h2>
      
      {isSuccess && (
        <div style={{ 
          backgroundColor: '#C6F6D5', 
          color: '#22543D', 
          padding: '12px', 
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          Notification preferences successfully updated
        </div>
      )}
      
      {/* Global notification toggle */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div>
          <h3 style={{ margin: 0 }}>Enable Notifications</h3>
          <p style={{ margin: '4px 0 0', color: '#718096' }}>
            Turn on/off all notifications in the app
          </p>
        </div>
        <label className="switch" style={{ position: 'relative' }}>
          <input
            type="checkbox"
            checked={preferences.enabled}
            onChange={() => handleToggleNotifications(!preferences.enabled)}
            disabled={isSaving}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span 
            style={{
              position: 'absolute',
              cursor: isSaving ? 'wait' : 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: preferences.enabled ? '#48BB78' : '#CBD5E0',
              transition: '0.4s',
              borderRadius: '34px',
              width: '48px',
              height: '24px',
              display: 'inline-block'
            }}
          >
            <span 
              style={{
                position: 'absolute',
                content: '""',
                height: '18px',
                width: '18px',
                left: preferences.enabled ? '27px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.4s',
                borderRadius: '50%'
              }}
            ></span>
          </span>
        </label>
      </div>
      
      {/* Only show the rest if notifications are enabled */}
      {preferences.enabled && (
        <>
          {/* Delivery methods section */}
          <div style={{ padding: '16px 0', borderBottom: '1px solid #E2E8F0' }}>
            <h3>Delivery Methods</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: isSaving ? 'wait' : 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={preferences.deliveryMethods.includes('in_app')}
                  onChange={() => handleToggleDeliveryMethod('in_app')}
                  disabled={isSaving}
                  style={{ marginRight: '8px' }}
                />
                In-App Notifications
              </label>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: isSaving ? 'wait' : 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={preferences.deliveryMethods.includes('push')}
                  onChange={() => handleToggleDeliveryMethod('push')}
                  disabled={isSaving}
                  style={{ marginRight: '8px' }}
                />
                Push Notifications
              </label>
              
              <div style={{ 
                backgroundColor: '#EBF8FF', 
                padding: '8px', 
                borderRadius: '4px',
                marginTop: '4px',
                fontSize: '14px',
                color: '#2C5282'
              }}>
                Email and SMS notifications coming soon
              </div>
            </div>
          </div>
          
          {/* Quiet hours section */}
          <div style={{ padding: '16px 0', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div>
                <h3 style={{ margin: 0 }}>Quiet Hours</h3>
                <p style={{ margin: '4px 0 0', color: '#718096' }}>
                  Don't send non-urgent notifications during quiet hours
                </p>
              </div>
              <label className="switch" style={{ position: 'relative' }}>
                <input
                  type="checkbox"
                  checked={preferences.quietHours.enabled}
                  onChange={() => handleToggleQuietHours(!preferences.quietHours.enabled)}
                  disabled={isSaving}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span 
                  style={{
                    position: 'absolute',
                    cursor: isSaving ? 'wait' : 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: preferences.quietHours.enabled ? '#48BB78' : '#CBD5E0',
                    transition: '0.4s',
                    borderRadius: '34px',
                    width: '48px',
                    height: '24px',
                    display: 'inline-block'
                  }}
                >
                  <span 
                    style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: preferences.quietHours.enabled ? '27px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      transition: '0.4s',
                      borderRadius: '50%'
                    }}
                  ></span>
                </span>
              </label>
            </div>
            
            {preferences.quietHours.enabled && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  From
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) => handleQuietHoursTimeChange('start', e.target.value)}
                    disabled={isSaving}
                    style={{ 
                      marginLeft: '8px',
                      padding: '4px 8px',
                      border: '1px solid #CBD5E0',
                      borderRadius: '4px'
                    }}
                  />
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  To
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) => handleQuietHoursTimeChange('end', e.target.value)}
                    disabled={isSaving}
                    style={{ 
                      marginLeft: '8px',
                      padding: '4px 8px',
                      border: '1px solid #CBD5E0',
                      borderRadius: '4px'
                    }}
                  />
                </label>
              </div>
            )}
          </div>
          
          {/* Notification type preferences */}
          <div style={{ padding: '16px 0', borderBottom: '1px solid #E2E8F0' }}>
            <h3>Notification Types</h3>
            
            {/* Table header */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 100px 120px',
              fontWeight: 'bold',
              borderBottom: '1px solid #E2E8F0',
              padding: '8px 0'
            }}>
              <div>Type</div>
              <div>Enabled</div>
              <div>Priority</div>
            </div>
            
            {/* Notification types rows */}
            {Object.entries(preferences.typePreferences).map(([type, settings]) => (
              <div key={type} style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 100px 120px',
                padding: '12px 0',
                borderBottom: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {type === 'scheduled_task' && 'Task Reminders'}
                  {type === 'weather_alert' && 'Weather Alerts'}
                  {type === 'watering_event' && 'Watering Events'}
                  {type === 'watering_reminder' && 'Watering Reminders'}
                  {type === 'watering_completed' && 'Watering Completed'}
                  {type === 'watering_cancelled' && 'Watering Cancelled'}
                  {type === 'seasonal_tip' && 'Seasonal Tips'}
                  {type === 'progress_update' && 'Progress Updates'}
                  {type === 'system_alert' && 'System Alerts'}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label className="switch" style={{ position: 'relative' }}>
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={() => handleToggleNotificationType(type as NotificationType, !settings.enabled)}
                      disabled={isSaving}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span 
                      style={{
                        position: 'absolute',
                        cursor: isSaving ? 'wait' : 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: settings.enabled ? '#48BB78' : '#CBD5E0',
                        transition: '0.4s',
                        borderRadius: '34px',
                        width: '40px',
                        height: '20px',
                        display: 'inline-block'
                      }}
                    >
                      <span 
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '16px',
                          width: '16px',
                          left: settings.enabled ? '21px' : '3px',
                          bottom: '2px',
                          backgroundColor: 'white',
                          transition: '0.4s',
                          borderRadius: '50%'
                        }}
                      ></span>
                    </span>
                  </label>
                </div>
                
                <div>
                  <select
                    value={settings.priority}
                    onChange={(e) => handleNotificationTypePriorityChange(
                      type as NotificationType,
                      e.target.value as NotificationPriority
                    )}
                    disabled={isSaving || !settings.enabled}
                    style={{ 
                      padding: '4px 8px',
                      border: '1px solid #CBD5E0',
                      borderRadius: '4px',
                      backgroundColor: settings.enabled ? 'white' : '#EDF2F7'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          
          {/* Watering notification settings */}
          <div style={{ padding: '16px 0' }}>
            <h3>Watering Notification Settings</h3>
            
            {/* Reminder timing */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>Reminder Timing</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: isSaving ? 'wait' : 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.wateringNotificationSettings?.reminderTiming.includes('day_before')}
                    onChange={() => handleToggleWateringReminderTiming(
                      'day_before',
                      !preferences.wateringNotificationSettings?.reminderTiming.includes('day_before')
                    )}
                    disabled={isSaving}
                    style={{ marginRight: '8px' }}
                  />
                  Day Before
                </label>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: isSaving ? 'wait' : 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.wateringNotificationSettings?.reminderTiming.includes('morning_of')}
                    onChange={() => handleToggleWateringReminderTiming(
                      'morning_of',
                      !preferences.wateringNotificationSettings?.reminderTiming.includes('morning_of')
                    )}
                    disabled={isSaving}
                    style={{ marginRight: '8px' }}
                  />
                  Morning Of
                </label>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: isSaving ? 'wait' : 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.wateringNotificationSettings?.reminderTiming.includes('hour_before')}
                    onChange={() => handleToggleWateringReminderTiming(
                      'hour_before',
                      !preferences.wateringNotificationSettings?.reminderTiming.includes('hour_before')
                    )}
                    disabled={isSaving}
                    style={{ marginRight: '8px' }}
                  />
                  Hour Before
                </label>
              </div>
            </div>
            
            {/* Other watering notification options */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>Notification Options</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: isSaving ? 'wait' : 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.wateringNotificationSettings?.notifyOnAdjustment}
                    onChange={() => handleToggleWateringNotificationOption(
                      'notifyOnAdjustment',
                      !preferences.wateringNotificationSettings?.notifyOnAdjustment
                    )}
                    disabled={isSaving}
                    style={{ marginRight: '8px' }}
                  />
                  Notify When Schedule Adjusted
                </label>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: isSaving ? 'wait' : 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.wateringNotificationSettings?.notifyOnCancellation}
                    onChange={() => handleToggleWateringNotificationOption(
                      'notifyOnCancellation',
                      !preferences.wateringNotificationSettings?.notifyOnCancellation
                    )}
                    disabled={isSaving}
                    style={{ marginRight: '8px' }}
                  />
                  Notify When Watering Cancelled
                </label>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: isSaving ? 'wait' : 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.wateringNotificationSettings?.notifyOnCompletion}
                    onChange={() => handleToggleWateringNotificationOption(
                      'notifyOnCompletion',
                      !preferences.wateringNotificationSettings?.notifyOnCompletion
                    )}
                    disabled={isSaving}
                    style={{ marginRight: '8px' }}
                  />
                  Notify When Watering Completed
                </label>
              </div>
            </div>
            
            {/* Rainfall notification threshold */}
            <div>
              <h4 style={{ marginBottom: '8px' }}>Rainfall Notification Threshold</h4>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  Minimum rainfall to notify:
                  <select
                    value={preferences.wateringNotificationSettings?.minRainfallToNotify || 0.25}
                    onChange={(e) => handleMinRainfallChange(parseFloat(e.target.value))}
                    disabled={isSaving}
                    style={{ 
                      marginLeft: '8px',
                      padding: '4px 8px',
                      border: '1px solid #CBD5E0',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="0.1">0.1 inches</option>
                    <option value="0.25">0.25 inches</option>
                    <option value="0.5">0.5 inches</option>
                    <option value="0.75">0.75 inches</option>
                    <option value="1.0">1.0 inches</option>
                  </select>
                </label>
              </div>
              <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
                Only send rainfall cancellation notifications when rainfall exceeds this amount.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationPreferencesView;