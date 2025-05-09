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
import { mockUserData } from '../../dashboard/mockData';

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
  const [waterSaved, setWaterSaved] = useState<{ gallons: number; percent: number } | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const wateringConfig = await getWateringConfig(mockUserData.lawnType as any);
        const wateringZones = await getWateringZones();
        const conservation = await getWaterConservation();
        
        setConfig(wateringConfig);
        setZones(wateringZones);
        // Convert from WaterConservation to our simplified display format
        setWaterSaved({
          gallons: conservation.gallonsSaved,
          percent: conservation.savingsPercentage
        });
        
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
          Smart Watering Configuration
        </h3>
        
        {waterSaved && (
          <div style={{
            backgroundColor: colors.blue[100],
            color: colors.blue[800],
            paddingLeft: '0.5rem',
            paddingRight: '0.5rem',
            paddingTop: '0.25rem',
            paddingBottom: '0.25rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ 
              display: 'inline-flex', 
              marginRight: '0.25rem', 
              color: colors.blue[500], 
              width: '16px', 
              height: '16px' 
            }}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" />
              </svg>
            </span>
            {waterSaved.gallons} gal saved ({waterSaved.percent}%)
          </div>
        )}
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
                  Lawn Zone Management
                </h4>
                
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  {/* Zone List */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      border: '1px solid',
                      borderColor: colors.gray[200],
                      borderRadius: '0.375rem',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        padding: '0.5rem',
                        backgroundColor: colors.gray[50],
                        borderBottom: '1px solid',
                        borderBottomColor: colors.gray[200],
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}>
                        Your Zones
                      </div>
                      
                      {zones.map(zone => (
                        <div
                          key={zone.id}
                          onClick={() => handleZoneSelect(zone)}
                          style={{
                            padding: '0.75rem',
                            borderBottom: '1px solid',
                            borderBottomColor: colors.gray[200],
                            cursor: 'pointer',
                            backgroundColor: selectedZone?.id === zone.id ? colors.blue[50] : 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{
                              fontWeight: 500,
                              color: zone.enabled ? colors.gray[800] : colors.gray[400],
                              textDecoration: zone.enabled ? 'none' : 'line-through',
                            }}>
                              {zone.name}
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: zone.enabled ? colors.gray[600] : colors.gray[400],
                            }}>
                              {zone.area} sq ft
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleZoneToggle(zone.id);
                            }}
                            style={{
                              width: '40px',
                              height: '20px',
                              backgroundColor: zone.enabled 
                                ? colors.green[500] 
                                : colors.gray[300],
                              borderRadius: '9999px',
                              border: 'none',
                              position: 'relative',
                              cursor: 'pointer',
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                top: '2px',
                                left: zone.enabled ? '22px' : '2px',
                                width: '16px',
                                height: '16px',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                transition: 'left 0.2s'
                              }}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Zone Details */}
                  <div style={{ flex: 2 }}>
                    {selectedZone ? (
                      <div style={{
                        border: '1px solid',
                        borderColor: colors.gray[200],
                        borderRadius: '0.375rem',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          padding: '0.75rem',
                          backgroundColor: colors.gray[50],
                          borderBottom: '1px solid',
                          borderBottomColor: colors.gray[200],
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ fontWeight: 600 }}>
                            {selectedZone.name} Details
                          </div>
                          
                          {!editingZone && (
                            <button
                              onClick={handleEditZone}
                              style={{
                                backgroundColor: colors.blue[500],
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Edit Zone
                            </button>
                          )}
                        </div>
                        
                        <div style={{ padding: '1rem' }}>
                          {editingZone ? (
                            <div>
                              {/* Edit Mode */}
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
                                    borderRadius: '0.25rem',
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
                                  Area (square feet)
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
                                    borderRadius: '0.25rem',
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
                                  Grass Type
                                </label>
                                <select
                                  value={editingZone.name || ''}
                                  onChange={(e) => handleUpdateZoneField('name', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid',
                                    borderColor: colors.gray[300],
                                    borderRadius: '0.25rem',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  <option value="bermuda">Bermuda</option>
                                  <option value="fescue">Fescue</option>
                                  <option value="kentucky-bluegrass">Kentucky Bluegrass</option>
                                  <option value="zoysia">Zoysia</option>
                                  <option value="st-augustine">St. Augustine</option>
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
                                  Soil Type
                                </label>
                                <select
                                  value={editingZone.soilType || ''}
                                  onChange={(e) => handleUpdateZoneField('soilType', e.target.value as SoilType)}
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid',
                                    borderColor: colors.gray[300],
                                    borderRadius: '0.25rem',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  <option value="clay">Clay</option>
                                  <option value="loam">Loam</option>
                                  <option value="sand">Sand</option>
                                  <option value="silt">Silt</option>
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
                                  value={editingZone.sunExposure || ''}
                                  onChange={(e) => handleUpdateZoneField('sunExposure', e.target.value as SunExposure)}
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid',
                                    borderColor: colors.gray[300],
                                    borderRadius: '0.25rem',
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
                                  value={editingZone.slope || ''}
                                  onChange={(e) => handleUpdateZoneField('slope', e.target.value as Slope)}
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid',
                                    borderColor: colors.gray[300],
                                    borderRadius: '0.25rem',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  <option value="flat">Flat</option>
                                  <option value="gentle">Gentle</option>
                                  <option value="moderate">Moderate</option>
                                  <option value="steep">Steep</option>
                                </select>
                              </div>
                              
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                                <button
                                  onClick={handleCancelEdit}
                                  style={{
                                    backgroundColor: 'white',
                                    color: colors.gray[700],
                                    border: `1px solid ${colors.gray[300]}`,
                                    borderRadius: '0.25rem',
                                    padding: '0.5rem 1rem',
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
                                    backgroundColor: colors.blue[500],
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.25rem',
                                    padding: '0.5rem 1rem',
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
                            <div>
                              {/* View Mode */}
                              <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.875rem', color: colors.gray[500], marginBottom: '0.25rem' }}>
                                  Area:
                                </div>
                                <div style={{ fontWeight: 500 }}>
                                  {selectedZone.area} square feet
                                </div>
                              </div>
                              
                              <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.875rem', color: colors.gray[500], marginBottom: '0.25rem' }}>
                                  Grass Type:
                                </div>
                                <div style={{ fontWeight: 500 }}>
                                  {selectedZone.name.split('-')[0]}
                                </div>
                              </div>
                              
                              <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.875rem', color: colors.gray[500], marginBottom: '0.25rem' }}>
                                  Soil Type:
                                </div>
                                <div style={{ fontWeight: 500 }}>
                                  {formatSoilType(selectedZone.soilType)}
                                </div>
                              </div>
                              
                              <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.875rem', color: colors.gray[500], marginBottom: '0.25rem' }}>
                                  Sun Exposure:
                                </div>
                                <div style={{ fontWeight: 500 }}>
                                  {formatSunExposure(selectedZone.sunExposure)}
                                </div>
                              </div>
                              
                              <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.875rem', color: colors.gray[500], marginBottom: '0.25rem' }}>
                                  Slope:
                                </div>
                                <div style={{ fontWeight: 500 }}>
                                  {formatSlope(selectedZone.slope)}
                                </div>
                              </div>
                              
                              <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.875rem', color: colors.gray[500], marginBottom: '0.25rem' }}>
                                  Watering Recommendation:
                                </div>
                                <div style={{ 
                                  fontWeight: 500,
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: colors.blue[50],
                                  color: colors.blue[700],
                                  display: 'inline-block',
                                  borderRadius: '0.25rem'
                                }}>
                                  {Math.round(selectedZone.wateringDepth * 20)} minutes, {selectedZone.enabled ? '2' : '0'}x weekly
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: colors.gray[500],
                        border: '1px dashed',
                        borderColor: colors.gray[300],
                        borderRadius: '0.375rem'
                      }}>
                        Select a zone to view details
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
                  Notification Settings
                </h4>
                
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
                        Watering Notifications
                      </div>
                      <div style={{ fontSize: '0.75rem', color: colors.gray[600] }}>
                        Receive alerts before watering starts
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
                        Schedule Change Notifications
                      </div>
                      <div style={{ fontSize: '0.75rem', color: colors.gray[600] }}>
                        Get alerted when watering schedule is adjusted
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
            )}
          </div>
          
          {/* Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '1rem',
            borderTop: '1px solid',
            borderTopColor: colors.gray[100],
            gap: '0.5rem'
          }}>
            {onCancel && (
              <button
                onClick={onCancel}
                style={{
                  backgroundColor: 'white',
                  color: colors.gray[700],
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: '0.375rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}
            
            {onSave && (
              <button
                onClick={onSave}
                style={{
                  backgroundColor: colors.blue[500],
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Save Configuration
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WateringConfigView;