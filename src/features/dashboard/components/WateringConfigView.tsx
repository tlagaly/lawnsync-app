import React, { useState, useEffect } from 'react';
import colors from '../../../theme/foundations/colors';
import { getWateringConfig, getWateringZones, getWaterConservation } from '../../../lib/wateringService';
import type { 
  WateringConfig, 
  WateringZone, 
  WateringSchedulerOptions, 
  SoilType, 
  SunExposure, 
  Slope 
} from '../../../types/watering';
import { mockUserData } from '../mockData';

/**
 * WateringConfigView component for adjusting watering preferences
 * Allows users to configure watering schedule, lawn zones, and other settings
 */
interface WateringConfigViewProps {
  onSave?: () => void;
  onCancel?: () => void;
}

const WateringConfigView: React.FC<WateringConfigViewProps> = ({ onSave, onCancel }) => {
  const [config, setConfig] = useState<WateringConfig | null>(null);
  const [zones, setZones] = useState<WateringZone[]>([]);
  const [schedulerOptions, setSchedulerOptions] = useState<WateringSchedulerOptions>({
    useWeatherForecast: true,
    autoAdjustForRain: true,
    preferredStartTime: '06:00',
    allowedDays: ['monday', 'wednesday', 'friday'],
    notifyBeforeWatering: true,
    notifyOnAdjustments: true
  });
  const [activeTab, setActiveTab] = useState<'schedule' | 'zones' | 'settings'>('schedule');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedZone, setSelectedZone] = useState<WateringZone | null>(null);
  const [editingZone, setEditingZone] = useState<Partial<WateringZone> | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const wateringConfig = await getWateringConfig(mockUserData.lawnType as any);
        const wateringZones = await getWateringZones();
        
        setConfig(wateringConfig);
        setZones(wateringZones);
        
        // If there are zones, select the first one by default
        if (wateringZones.length > 0) {
          setSelectedZone(wateringZones[0]);
        }
      } catch (error) {
        console.error('Error fetching watering configuration:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle toggle changes
  const handleToggleChange = (setting: keyof WateringSchedulerOptions) => {
    setSchedulerOptions(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Handle day selection
  const handleDayToggle = (day: string) => {
    setSchedulerOptions(prev => {
      const currentDays = prev.allowedDays;
      const newDays = currentDays.includes(day as any)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day as any];
        
      // Ensure at least one day is selected
      if (newDays.length === 0) {
        return prev;
      }
      
      return {
        ...prev,
        allowedDays: newDays
      };
    });
  };

  // Handle time change
  const handleTimeChange = (time: string) => {
    setSchedulerOptions(prev => ({
      ...prev,
      preferredStartTime: time
    }));
  };

  // Handle zone selection
  const handleZoneSelect = (zone: WateringZone) => {
    setSelectedZone(zone);
    setEditingZone(null); // Clear any editing state
  };

  // Start editing a zone
  const handleEditZone = () => {
    if (selectedZone) {
      setEditingZone({...selectedZone});
    }
  };

  // Cancel zone editing
  const handleCancelEdit = () => {
    setEditingZone(null);
  };

  // Handle zone toggle (enable/disable)
  const handleZoneToggle = (zoneId: number) => {
    setZones(prevZones => 
      prevZones.map(zone => 
        zone.id === zoneId 
          ? {...zone, enabled: !zone.enabled} 
          : zone
      )
    );
    
    // Update selected zone if it's the one being toggled
    if (selectedZone && selectedZone.id === zoneId) {
      setSelectedZone(prev => prev ? {...prev, enabled: !prev.enabled} : null);
    }
  };

  // Update editing zone field
  const handleUpdateZoneField = (field: keyof WateringZone, value: any) => {
    if (editingZone) {
      setEditingZone(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Save zone changes
  const handleSaveZoneChanges = () => {
    if (editingZone && editingZone.id) {
      setZones(prevZones => 
        prevZones.map(zone => 
          zone.id === editingZone.id 
            ? {...editingZone as WateringZone} 
            : zone
        )
      );
      
      // Update selected zone
      setSelectedZone({...editingZone as WateringZone});
      setEditingZone(null);
    }
  };

  // Format soil type for display
  const formatSoilType = (soil: SoilType): string => {
    return soil.charAt(0).toUpperCase() + soil.slice(1);
  };

  // Format sun exposure for display
  const formatSunExposure = (exposure: SunExposure): string => {
    switch (exposure) {
      case 'full': return 'Full Sun';
      case 'partial': return 'Partial Sun';
      case 'shade': return 'Shade';
      default: return exposure;
    }
  };

  // Format slope for display
  const formatSlope = (slope: Slope): string => {
    return slope.charAt(0).toUpperCase() + slope.slice(1);
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
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </span>
          Watering Configuration
        </h3>
      </div>
      
      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid',
        borderBottomColor: colors.gray[100]
      }}>
        <button
          onClick={() => setActiveTab('schedule')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            backgroundColor: activeTab === 'schedule' ? colors.blue[500] : 'white',
            color: activeTab === 'schedule' ? 'white' : colors.gray[700],
            border: 'none',
            borderBottom: '2px solid',
            borderBottomColor: activeTab === 'schedule' ? colors.blue[700] : 'transparent',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'schedule' ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          Schedule
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            backgroundColor: activeTab === 'zones' ? colors.blue[500] : 'white',
            color: activeTab === 'zones' ? 'white' : colors.gray[700],
            border: 'none',
            borderBottom: '2px solid',
            borderBottomColor: activeTab === 'zones' ? colors.blue[700] : 'transparent',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'zones' ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          Lawn Zones
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            backgroundColor: activeTab === 'settings' ? colors.blue[500] : 'white',
            color: activeTab === 'settings' ? 'white' : colors.gray[700],
            border: 'none',
            borderBottom: '2px solid',
            borderBottomColor: activeTab === 'settings' ? colors.blue[700] : 'transparent',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'settings' ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          Settings
        </button>
      </div>
      
      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: colors.gray[500] }}>
          Loading watering configuration...
        </div>
      ) : (
        <>
          {/* Tab Content */}
          <div style={{ padding: '1rem' }}>
            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div>
                <h4 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: colors.gray[700],
                  marginTop: 0,
                  marginBottom: '1rem'
                }}>
                  Watering Schedule Preferences
                </h4>
                
                {/* Watering Days */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: 500, 
                    color: colors.gray[700],
                    marginBottom: '0.5rem'
                  }}>
                    Watering Days
                  </label>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <button
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: schedulerOptions.allowedDays.includes(day as any) 
                            ? colors.blue[500] 
                            : 'white',
                          color: schedulerOptions.allowedDays.includes(day as any) 
                            ? 'white' 
                            : colors.gray[700],
                          border: '1px solid',
                          borderColor: schedulerOptions.allowedDays.includes(day as any) 
                            ? colors.blue[600] 
                            : colors.gray[300],
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                  
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: colors.gray[500],
                    margin: 0
                  }}>
                    Select which days of the week you prefer for watering
                  </p>
                </div>
                
                {/* Preferred Start Time */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: 500, 
                    color: colors.gray[700],
                    marginBottom: '0.5rem'
                  }}>
                    Preferred Start Time
                  </label>
                  
                  <select
                    value={schedulerOptions.preferredStartTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid',
                      borderColor: colors.gray[300],
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      color: colors.gray[800],
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="04:00">4:00 AM</option>
                    <option value="05:00">5:00 AM</option>
                    <option value="06:00">6:00 AM</option>
                    <option value="07:00">7:00 AM</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="20:00">8:00 PM</option>
                  </select>
                  
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: colors.gray[500],
                    margin: '0.25rem 0 0 0'
                  }}>
                    Early morning (4-8am) or evening (6-8pm) are optimal to reduce evaporation
                  </p>
                </div>
                
                {/* Smart Features */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: 500, 
                    color: colors.gray[700],
                    marginBottom: '0.5rem'
                  }}>
                    Smart Features
                  </label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      backgroundColor: colors.gray[50],
                      borderRadius: '0.375rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                          Weather-Adaptive Schedule
                        </div>
                        <div style={{ fontSize: '0.75rem', color: colors.gray[600] }}>
                          Automatically adjust watering based on forecast
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleChange('useWeatherForecast')}
                        style={{
                          width: '48px',
                          height: '24px',
                          backgroundColor: schedulerOptions.useWeatherForecast 
                            ? colors.green[500] 
                            : colors.gray[300],
                          borderRadius: '9999px',
                          border: 'none',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: '2px',
                            left: schedulerOptions.useWeatherForecast ? '26px' : '2px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            transition: 'left 0.2s'
                          }}
                        />
                      </button>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      backgroundColor: colors.gray[50],
                      borderRadius: '0.375rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                          Rain Skip
                        </div>
                        <div style={{ fontSize: '0.75rem', color: colors.gray[600] }}>
                          Skip or reduce watering when rain is forecasted
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleChange('autoAdjustForRain')}
                        style={{
                          width: '48px',
                          height: '24px',
                          backgroundColor: schedulerOptions.autoAdjustForRain 
                            ? colors.green[500] 
                            : colors.gray[300],
                          borderRadius: '9999px',
                          border: 'none',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: '2px',
                            left: schedulerOptions.autoAdjustForRain ? '26px' : '2px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            transition: 'left 0.2s'
                          }}
                        />
                      </button>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      backgroundColor: colors.gray[50],
                      borderRadius: '0.375rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                          Watering Notifications
                        </div>
                        <div style={{ fontSize: '0.75rem', color: colors.gray[600] }}>
                          Get notified before watering starts
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleChange('notifyBeforeWatering')}
                        style={{
                          width: '48px',
                          height: '24px',
                          backgroundColor: schedulerOptions.notifyBeforeWatering 
                            ? colors.green[500] 
                            : colors.gray[300],
                          borderRadius: '9999px',
                          border: 'none',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: '2px',
                            left: schedulerOptions.notifyBeforeWatering ? '26px' : '2px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            transition: 'left 0.2s'
                          }}
                        />
                      </button>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      backgroundColor: colors.gray[50],
                      borderRadius: '0.375rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                          Adjustment Alerts
                        </div>
                        <div style={{ fontSize: '0.75rem', color: colors.gray[600] }}>
                          Get notified when schedule is adjusted
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleChange('notifyOnAdjustments')}
                        style={{
                          width: '48px',
                          height: '24px',
                          backgroundColor: schedulerOptions.notifyOnAdjustments 
                            ? colors.green[500] 
                            : colors.gray[300],
                          borderRadius: '9999px',
                          border: 'none',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: '2px',
                            left: schedulerOptions.notifyOnAdjustments ? '26px' : '2px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            transition: 'left 0.2s'
                          }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Zones Tab */}
            {activeTab === 'zones' && (
              <div>
                <h4 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: colors.gray[700],
                  marginTop: 0,
                  marginBottom: '1rem'
                }}>
                  Lawn Watering Zones
                </h4>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {/* Zone List */}
                  <div style={{ flex: 1, maxWidth: '200px' }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      {zones.map(zone => (
                        <div 
                          key={zone.id}
                          onClick={() => handleZoneSelect(zone)}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            backgroundColor: selectedZone?.id === zone.id 
                              ? colors.blue[100] 
                              : colors.gray[50],
                            border: '1px solid',
                            borderColor: selectedZone?.id === zone.id 
                              ? colors.blue[300] 
                              : colors.gray[200],
                            cursor: 'pointer',
                            opacity: zone.enabled ? 1 : 0.6
                          }}
                        >
                          <div style={{ 
                            fontWeight: selectedZone?.id === zone.id ? 600 : 500,
                            color: colors.gray[800],
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            {zone.name}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleZoneToggle(zone.id);
                              }}
                              style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: zone.enabled ? colors.green[500] : colors.gray[300],
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '10px'
                              }}
                            >
                              {zone.enabled ? '✓' : ''}
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: colors.gray[600],
                            marginTop: '0.25rem'
                          }}>
                            {zone.area} sq ft
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Zone Details */}
                  <div style={{ flex: 2 }}>
                    {selectedZone ? (
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem'
                        }}>
                          <h5 style={{ 
                            fontSize: '1rem', 
                            fontWeight: 600, 
                            margin: 0,
                            color: colors.gray[800]
                          }}>
                            {selectedZone.name}
                            {!selectedZone.enabled && (
                              <span style={{ 
                                fontSize: '0.75rem',
                                marginLeft: '0.5rem',
                                color: colors.gray[500],
                                fontWeight: 'normal'
                              }}>
                                (Disabled)
                              </span>
                            )}
                          </h5>
                          
                          {!editingZone && (
                            <button
                              onClick={handleEditZone}
                              style={{
                                backgroundColor: colors.blue[500],
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                              </svg>
                              Edit Zone
                            </button>
                          )}
                        </div>
                        
                        {editingZone ? (
                          <div style={{
                            backgroundColor: colors.gray[50],
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '1rem'
                          }}>
                            <h6 style={{ 
                              fontSize: '0.875rem', 
                              fontWeight: 600, 
                              marginTop: 0,
                              marginBottom: '1rem',
                              color: colors.gray[700]
                            }}>
                              Edit Zone Settings
                            </h6>
                            
                            <div style={{ marginBottom: '1rem' }}>
                              <label style={{ 
                                display: 'block', 
                                fontSize: '0.875rem', 
                                fontWeight: 500, 
                                color: colors.gray[700],
                                marginBottom: '0.25rem'
                              }}>
                                Zone Name
                              </label>
                              <input
                                type="text"
                                value={editingZone.name || ''}
                                onChange={(e) => handleUpdateZoneField('name', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid',
                                  borderColor: colors.gray[300],
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem'
                                }}
                              />
                            </div>
                            
                            <div style={{ marginBottom: '1rem' }}>
                              <label style={{ 
                                display: 'block', 
                                fontSize: '0.875rem', 
                                fontWeight: 500, 
                                color: colors.gray[700],
                                marginBottom: '0.25rem'
                              }}>
                                Area (sq ft)
                              </label>
                              <input
                                type="number"
                                value={editingZone.area || 0}
                                onChange={(e) => handleUpdateZoneField('area', parseInt(e.target.value))}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid',
                                  borderColor: colors.gray[300],
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem'
                                }}
                              />
                            </div>
                            
                            <div style={{ marginBottom: '1rem' }}>
                              <label style={{ 
                                display: 'block', 
                                fontSize: '0.875rem', 
                                fontWeight: 500, 
                                color: colors.gray[700],
                                marginBottom: '0.25rem'
                              }}>
                                Soil Type
                              </label>
                              <select
                                value={editingZone.soilType || 'loam'}
                                onChange={(e) => handleUpdateZoneField('soilType', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid',
                                  borderColor: colors.gray[300],
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem'
                                }}
                              >
                                <option value="sand">Sand</option>
                                <option value="loam">Loam</option>
                                <option value="clay">Clay</option>
                                <option value="silt">Silt</option>
                                <option value="peaty">Peaty</option>
                                <option value="chalky">Chalky</option>
                              </select>
                            </div>
                            
                            <div style={{ marginBottom: '1rem' }}>
                              <label style={{ 
                                display: 'block', 
                                fontSize: '0.875rem', 
                                fontWeight: 500, 
                                color: colors.gray[700],
                                marginBottom: '0.25rem'
                              }}>
                                Sun Exposure
                              </label>
                              <select
                                value={editingZone.sunExposure || 'full'}
                                onChange={(e) => handleUpdateZoneField('sunExposure', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid',
                                  borderColor: colors.gray[300],
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem'
                                }}
                              >
                                <option value="full">Full Sun</option>
                                <option value="partial">Partial Sun</option>
                                <option value="shade">Shade</option>
                              </select>
                            </div>
                            
                            <div style={{ marginBottom: '1rem' }}>
                              <label style={{ 
                                display: 'block', 
                                fontSize: '0.875rem', 
                                fontWeight: 500, 
                                color: colors.gray[700],
                                marginBottom: '0.25rem'
                              }}>
                                Slope
                              </label>
                              <select
                                value={editingZone.slope || 'flat'}
                                onChange={(e) => handleUpdateZoneField('slope', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid',
                                  borderColor: colors.gray[300],
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem'
                                }}
                              >
                                <option value="flat">Flat</option>
                                <option value="slight">Slight</option>
                                <option value="moderate">Moderate</option>
                                <option value="steep">Steep</option>
                              </select>
                            </div>
                            
                            <div style={{ marginBottom: '1rem' }}>
                              <label style={{ 
                                display: 'block', 
                                fontSize: '0.875rem', 
                                fontWeight: 500, 
                                color: colors.gray[700],
                                marginBottom: '0.25rem'
                              }}>
                                Watering Depth (inches)
                              </label>
                              <select
                                value={editingZone.wateringDepth || 1.0}
                                onChange={(e) => handleUpdateZoneField('wateringDepth', parseFloat(e.target.value))}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid',
                                  borderColor: colors.gray[300],
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem'
                                }}
                              >
                                <option value="0.5">Light (0.5 inches)</option>
                                <option value="0.75">Medium-Light (0.75 inches)</option>
                                <option value="1">Medium (1 inch)</option>
                                <option value="1.25">Medium-Heavy (1.25 inches)</option>
                                <option value="1.5">Heavy (1.5 inches)</option>
                              </select>
                            </div>
                            
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'flex-end',
                              gap: '0.5rem',
                              marginTop: '1.5rem'
                            }}>
                              <button
                                onClick={handleCancelEdit}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: 'white',
                                  color: colors.gray[700],
                                  border: '1px solid',
                                  borderColor: colors.gray[300],
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  fontWeight: 500,
                                  cursor: 'pointer'
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveZoneChanges}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: colors.blue[500],
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  fontWeight: 500,
                                  cursor: 'pointer'
                                }}
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            backgroundColor: colors.gray[50],
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '1rem'
                          }}>
                            <h6 style={{ 
                              fontSize: '0.875rem', 
                              fontWeight: 600, 
                              marginTop: 0,
                              marginBottom: '1rem',
                              color: colors.gray[700]
                            }}>
                              Zone Details
                            </h6>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: colors.gray[600], marginBottom: '0.25rem' }}>
                                  Area
                                </div>
                                <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                                  {selectedZone.area} sq ft
                                </div>
                              </div>
                              
                              <div>
                                <div style={{ fontSize: '0.75rem', color: colors.gray[600], marginBottom: '0.25rem' }}>
                                  Soil Type
                                </div>
                                <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                                  {formatSoilType(selectedZone.soilType)}
                                </div>
                              </div>
                              
                              <div>
                                <div style={{ fontSize: '0.75rem', color: colors.gray[600], marginBottom: '0.25rem' }}>
                                  Sun Exposure
                                </div>
                                <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                                  {formatSunExposure(selectedZone.sunExposure)}
                                </div>
                              </div>
                              
                              <div>
                                <div style={{ fontSize: '0.75rem', color: colors.gray[600], marginBottom: '0.25rem' }}>
                                  Slope
                                </div>
                                <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                                  {formatSlope(selectedZone.slope)}
                                </div>
                              </div>
                              
                              <div>
                                <div style={{ fontSize: '0.75rem', color: colors.gray[600], marginBottom: '0.25rem' }}>
                                  Watering Depth
                                </div>
                                <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                                  {selectedZone.wateringDepth} inches
                                </div>
                              </div>
                              
                              <div>
                                <div style={{ fontSize: '0.75rem', color: colors.gray[600], marginBottom: '0.25rem' }}>
                                  Status
                                </div>
                                <div style={{ 
                                  fontWeight: 500, 
                                  color: selectedZone.enabled ? colors.green[600] : colors.gray[600]
                                }}>
                                  {selectedZone.enabled ? 'Enabled' : 'Disabled'}
                                </div>
                              </div>
                            </div>
                            
                            <div style={{ 
                              marginTop: '1rem',
                              padding: '0.5rem',
                              backgroundColor: colors.blue[50],
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              color: colors.blue[700]
                            }}>
                              <strong>Water Usage Estimate:</strong> Approximately {Math.round(selectedZone.area * selectedZone.wateringDepth * 0.623)} gallons per watering session
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        backgroundColor: colors.gray[50],
                        borderRadius: '0.5rem',
                        color: colors.gray[600]
                      }}>
                        <p>Select a zone to view details</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h4 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: colors.gray[700],
                  marginTop: 0,
                  marginBottom: '1rem'
                }}>
                  Watering System Settings
                </h4>
                
                {config && (
                  <div style={{ 
                    backgroundColor: colors.blue[50],
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h5 style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 600, 
                      color: colors.blue[700],
                      margin: '0 0 0.75rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                      </svg>
                      Current Setup - {config.grassType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Grass
                    </h5>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: colors.blue[700], marginBottom: '0.25rem' }}>
                          Rain Skip Threshold
                        </div>
                        <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                          {config.rainSkipThreshold} inches
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '0.75rem', color: colors.blue[700], marginBottom: '0.25rem' }}>
                          Rain Adjustment Factor
                        </div>
                        <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                          {config.rainAdjustmentFactor * 100}%
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '0.75rem', color: colors.blue[700], marginBottom: '0.25rem' }}>
                          Minimum Watering Time
                        </div>
                        <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                          {config.minWateringTime} minutes
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '0.75rem', color: colors.blue[700], marginBottom: '0.25rem' }}>
                          Maximum Watering Time
                        </div>
                        <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                          {config.maxWateringTime} minutes
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: colors.gray[600],
                      marginTop: '0.75rem',
                      padding: '0.5rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                    }}>
                      These settings are optimized for your grass type and local conditions.
                    </div>
                  </div>
                )}
                
                <div style={{ 
                  border: '1px solid',
                  borderColor: colors.gray[200],
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ 
                    padding: '0.75rem', 
                    backgroundColor: colors.gray[50],
                    borderBottom: '1px solid',
                    borderBottomColor: colors.gray[200],
                    fontWeight: 600,
                    color: colors.gray[700],
                    fontSize: '0.875rem'
                  }}>
                    Advanced Water Conservation
                  </div>
                  
                  <div style={{ padding: '1rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                          Seasonal Adjustments
                        </div>
                        <div style={{ fontSize: '0.75rem', color: colors.gray[600] }}>
                          Automatically adjust watering based on season
                        </div>
                      </div>
                      
                      <div style={{
                        width: '48px',
                        height: '24px',
                        backgroundColor: colors.green[500],
                        borderRadius: '9999px',
                        position: 'relative'
                      }}>
                        <span
                          style={{
                            position: 'absolute',
                            top: '2px',
                            left: '26px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                          Soil Moisture Sensing
                        </div>
                        <div style={{ fontSize: '0.75rem', color: colors.gray[600] }}>
                          Requires compatible smart sensors
                        </div>
                      </div>
                      
                      <div style={{
                        width: '48px',
                        height: '24px',
                        backgroundColor: colors.gray[300],
                        borderRadius: '9999px',
                        position: 'relative'
                      }}>
                        <span
                          style={{
                            position: 'absolute',
                            top: '2px',
                            left: '2px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 500, color: colors.gray[800] }}>
                          Water Window Limits
                        </div>
                        <div style={{ fontSize: '0.75rem', color: colors.gray[600] }}>
                          Comply with local water restrictions
                        </div>
                      </div>
                      
                      <div style={{
                        width: '48px',
                        height: '24px',
                        backgroundColor: colors.green[500],
                        borderRadius: '9999px',
                        position: 'relative'
                      }}>
                        <span
                          style={{
                            position: 'absolute',
                            top: '2px',
                            left: '26px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div style={{ 
            padding: '1rem',
            borderTop: '1px solid',
            borderTopColor: colors.gray[100],
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}>
            <button
              onClick={onCancel}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                color: colors.gray[700],
                border: '1px solid',
                borderColor: colors.gray[300],
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: colors.blue[600],
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
              Save Configuration
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WateringConfigView;