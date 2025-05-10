import React, { useState, useEffect } from 'react';
import { getLawnZoneById, updateZoneMetrics, updateZoneHealth } from '../../../lib/lawnService';
import type { LawnZone, ZoneMetrics, ZoneHealthStatus } from '../../../types/lawn';
import colors from '../../../theme/foundations/colors';

interface ZoneMetricsTrackerProps {
  zoneId?: string; // If provided, only show metrics for this zone
}

/**
 * ZoneMetricsTracker component displays and manages per-zone metrics
 */
const ZoneMetricsTracker: React.FC<ZoneMetricsTrackerProps> = ({ zoneId }) => {
  const [zones, setZones] = useState<LawnZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<LawnZone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [metricType, setMetricType] = useState<'health' | 'soil'>('health');
  const [formData, setFormData] = useState<{
    health?: Partial<ZoneHealthStatus>;
    metrics?: Partial<ZoneMetrics>;
  }>({});
  
  // Load zone data on component mount
  useEffect(() => {
    const fetchZoneData = async () => {
      try {
        setIsLoading(true);
        
        // If zoneId is provided, fetch that specific zone
        if (zoneId) {
          const zoneData = await getLawnZoneById(zoneId);
          if (zoneData) {
            setZones([zoneData]);
            setSelectedZone(zoneData);
          } else {
            setZones([]);
            setSelectedZone(null);
          }
        } else {
          // Fetch all zones from the parent component
          // For now, we'll just use the selected zone if any
          if (selectedZone) {
            const updatedZone = await getLawnZoneById(selectedZone.id);
            if (updatedZone) {
              setSelectedZone(updatedZone);
              setZones(prev => prev.map(z => z.id === updatedZone.id ? updatedZone : z));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching zone data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchZoneData();
  }, [zoneId]);
  
  // Handle zone selection
  const handleSelectZone = (zone: LawnZone) => {
    setSelectedZone(zone);
    setIsEditing(false);
    
    // Initialize form data with current values
    setFormData({
      health: zone.currentHealth ? { ...zone.currentHealth } : undefined,
      metrics: zone.metrics ? { ...zone.metrics } : undefined
    });
  };
  
  // Start editing metrics
  const handleStartEdit = (type: 'health' | 'soil') => {
    setMetricType(type);
    setIsEditing(true);
    
    // Initialize form data with current values
    if (selectedZone) {
      setFormData({
        health: selectedZone.currentHealth ? { ...selectedZone.currentHealth } : {},
        metrics: selectedZone.metrics ? { ...selectedZone.metrics } : {}
      });
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  // Save edited metrics
  const handleSaveMetrics = async () => {
    if (!selectedZone) return;
    
    try {
      if (metricType === 'health' && formData.health) {
        // Update health data
        const updatedHealth = await updateZoneHealth(selectedZone.id, formData.health);
        
        if (updatedHealth) {
          // Update local state with new health data
          const updatedZone = {
            ...selectedZone,
            currentHealth: updatedHealth,
            updatedAt: new Date().toISOString()
          };
          
          setSelectedZone(updatedZone);
          setZones(prev => prev.map(z => z.id === updatedZone.id ? updatedZone : z));
        }
      } else if (metricType === 'soil' && formData.metrics) {
        // Update metrics data
        const updatedMetrics = await updateZoneMetrics(selectedZone.id, formData.metrics);
        
        if (updatedMetrics) {
          // Update local state with new metrics data
          const updatedZone = {
            ...selectedZone,
            metrics: updatedMetrics,
            updatedAt: new Date().toISOString()
          };
          
          setSelectedZone(updatedZone);
          setZones(prev => prev.map(z => z.id === updatedZone.id ? updatedZone : z));
        }
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating zone metrics:', error);
    }
  };
  
  // Handle health form input changes
  const handleHealthInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      health: {
        ...(prev.health || {}),
        [name]: name === 'colorRating' ? value : Number(value)
      }
    }));
  };
  
  // Handle metrics form input changes
  const handleMetricsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      metrics: {
        ...(prev.metrics || {}),
        [name]: Number(value)
      }
    }));
  };
  
  // Handle soil nutrients input changes
  const handleNutrientsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      metrics: {
        ...(prev.metrics || {}),
        soilNutrients: {
          ...(prev.metrics?.soilNutrients || {
            nitrogen: 0,
            phosphorus: 0,
            potassium: 0
          }),
          [name]: Number(value)
        }
      }
    }));
  };
  
  // Format date string
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get color based on health score
  const getHealthColor = (score: number): string => {
    if (score >= 80) return colors.green[500];
    if (score >= 60) return colors.status.warning;
    if (score >= 40) return colors.brown[400];
    return colors.status.error;
  };
  
  // Get health label based on rating
  const getHealthLabel = (rating: 'excellent' | 'good' | 'fair' | 'poor'): string => {
    switch (rating) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'poor': return 'Needs Work';
      default: return 'Unknown';
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "20px",
        textAlign: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        Loading zone metrics...
      </div>
    );
  }
  
  // No zones available
  if (zones.length === 0) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', color: colors.gray[800] }}>
          Zone Metrics
        </h2>
        <div style={{
          backgroundColor: colors.gray[50],
          borderRadius: "8px",
          padding: "32px 20px",
          textAlign: "center"
        }}>
          <p style={{ fontSize: '1rem', color: colors.gray[600], margin: 0 }}>
            No zones found. Create a zone first to track metrics.
          </p>
        </div>
      </div>
    );
  }
  
  // Editing mode - Health
  if (isEditing && metricType === 'health' && selectedZone) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: colors.gray[800] }}>
            Update Health Data: {selectedZone.name}
          </h2>
        </div>
        
        <form style={{ display: 'grid', gap: '16px' }}>
          {/* Overall Score */}
          <div>
            <label 
              htmlFor="overallScore" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Overall Health Score (0-100)
            </label>
            <input
              id="overallScore"
              name="overallScore"
              type="number"
              min="0"
              max="100"
              value={formData.health?.overallScore || 0}
              onChange={handleHealthInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
            
            {/* Show a slider for visual input */}
            <input
              type="range"
              min="0"
              max="100"
              value={formData.health?.overallScore || 0}
              onChange={handleHealthInputChange}
              name="overallScore"
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>
          
          {/* Color Rating */}
          <div>
            <label 
              htmlFor="colorRating" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Color Rating
            </label>
            <select
              id="colorRating"
              name="colorRating"
              value={formData.health?.colorRating || 'fair'}
              onChange={handleHealthInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem',
                backgroundColor: 'white'
              }}
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Needs Work</option>
            </select>
          </div>
          
          {/* Density */}
          <div>
            <label 
              htmlFor="density" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Density (%)
            </label>
            <input
              id="density"
              name="density"
              type="number"
              min="0"
              max="100"
              value={formData.health?.density || 0}
              onChange={handleHealthInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
            
            {/* Show a slider for visual input */}
            <input
              type="range"
              min="0"
              max="100"
              value={formData.health?.density || 0}
              onChange={handleHealthInputChange}
              name="density"
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>
          
          {/* Weed Coverage */}
          <div>
            <label 
              htmlFor="weedCoverage" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Weed Coverage (%)
            </label>
            <input
              id="weedCoverage"
              name="weedCoverage"
              type="number"
              min="0"
              max="100"
              value={formData.health?.weedCoverage || 0}
              onChange={handleHealthInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
            
            {/* Show a slider for visual input */}
            <input
              type="range"
              min="0"
              max="100"
              value={formData.health?.weedCoverage || 0}
              onChange={handleHealthInputChange}
              name="weedCoverage"
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>
          
          {/* Bare Spots */}
          <div>
            <label 
              htmlFor="bareSpots" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Bare Spots (%)
            </label>
            <input
              id="bareSpots"
              name="bareSpots"
              type="number"
              min="0"
              max="100"
              value={formData.health?.bareSpots || 0}
              onChange={handleHealthInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
            
            {/* Show a slider for visual input */}
            <input
              type="range"
              min="0"
              max="100"
              value={formData.health?.bareSpots || 0}
              onChange={handleHealthInputChange}
              name="bareSpots"
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>
          
          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            marginTop: '8px' 
          }}>
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                backgroundColor: 'white',
                color: colors.gray[700],
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveMetrics}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: colors.green[500],
                color: 'white',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Save Health Data
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  // Editing mode - Soil Metrics
  if (isEditing && metricType === 'soil' && selectedZone) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: colors.gray[800] }}>
            Update Soil Metrics: {selectedZone.name}
          </h2>
        </div>
        
        <form style={{ display: 'grid', gap: '16px' }}>
          {/* Soil Moisture */}
          <div>
            <label 
              htmlFor="soilMoisture" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Soil Moisture (%)
            </label>
            <input
              id="soilMoisture"
              name="soilMoisture"
              type="number"
              min="0"
              max="100"
              value={formData.metrics?.soilMoisture || 0}
              onChange={handleMetricsInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
            
            {/* Show a slider for visual input */}
            <input
              type="range"
              min="0"
              max="100"
              value={formData.metrics?.soilMoisture || 0}
              onChange={handleMetricsInputChange}
              name="soilMoisture"
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>
          
          {/* Soil Temperature */}
          <div>
            <label 
              htmlFor="soilTemperature" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Soil Temperature (°F)
            </label>
            <input
              id="soilTemperature"
              name="soilTemperature"
              type="number"
              min="32"
              max="120"
              value={formData.metrics?.soilTemperature || 65}
              onChange={handleMetricsInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
          </div>
          
          {/* pH Level */}
          <div>
            <label 
              htmlFor="phLevel" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              pH Level (0-14)
            </label>
            <input
              id="phLevel"
              name="phLevel"
              type="number"
              min="0"
              max="14"
              step="0.1"
              value={formData.metrics?.phLevel || 7}
              onChange={handleMetricsInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
            
            {/* Show a slider for visual input */}
            <input
              type="range"
              min="0"
              max="14"
              step="0.1"
              value={formData.metrics?.phLevel || 7}
              onChange={handleMetricsInputChange}
              name="phLevel"
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>
          
          {/* Soil Nutrients */}
          <div>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: 500, 
              margin: '8px 0',
              color: colors.gray[700]
            }}>
              Soil Nutrients
            </h3>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              {/* Nitrogen */}
              <div>
                <label 
                  htmlFor="nitrogen" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontSize: '0.875rem',
                    color: colors.gray[700]
                  }}
                >
                  Nitrogen (0-10)
                </label>
                <input
                  id="nitrogen"
                  name="nitrogen"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.metrics?.soilNutrients?.nitrogen || 0}
                  onChange={handleNutrientsChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${colors.gray[300]}`,
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              {/* Phosphorus */}
              <div>
                <label 
                  htmlFor="phosphorus" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontSize: '0.875rem',
                    color: colors.gray[700]
                  }}
                >
                  Phosphorus (0-10)
                </label>
                <input
                  id="phosphorus"
                  name="phosphorus"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.metrics?.soilNutrients?.phosphorus || 0}
                  onChange={handleNutrientsChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${colors.gray[300]}`,
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              {/* Potassium */}
              <div>
                <label 
                  htmlFor="potassium" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontSize: '0.875rem',
                    color: colors.gray[700]
                  }}
                >
                  Potassium (0-10)
                </label>
                <input
                  id="potassium"
                  name="potassium"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.metrics?.soilNutrients?.potassium || 0}
                  onChange={handleNutrientsChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${colors.gray[300]}`,
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Sunlight Hours */}
          <div>
            <label 
              htmlFor="sunlightHours" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Daily Sunlight Hours
            </label>
            <input
              id="sunlightHours"
              name="sunlightHours"
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={formData.metrics?.sunlightHours || 0}
              onChange={handleMetricsInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
          </div>
          
          {/* Shade Percentage */}
          <div>
            <label 
              htmlFor="shadePercentage" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Shade Percentage
            </label>
            <input
              id="shadePercentage"
              name="shadePercentage"
              type="number"
              min="0"
              max="100"
              value={formData.metrics?.shadePercentage || 0}
              onChange={handleMetricsInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
            
            {/* Show a slider for visual input */}
            <input
              type="range"
              min="0"
              max="100"
              value={formData.metrics?.shadePercentage || 0}
              onChange={handleMetricsInputChange}
              name="shadePercentage"
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>
          
          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            marginTop: '8px' 
          }}>
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                backgroundColor: 'white',
                color: colors.gray[700],
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveMetrics}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: colors.green[500],
                color: 'white',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Save Soil Metrics
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  // View metrics - main view
  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "8px",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: colors.gray[800] }}>
          Zone Metrics
        </h2>
      </div>
      
      {/* Zone selector if not passed via props */}
      {!zoneId && zones.length > 1 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            overflowX: 'auto',
            paddingBottom: '8px'
          }}>
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => handleSelectZone(zone)}
                style={{
                  backgroundColor: selectedZone?.id === zone.id ? colors.green[500] : 'white',
                  color: selectedZone?.id === zone.id ? 'white' : colors.gray[700],
                  border: `1px solid ${selectedZone?.id === zone.id ? colors.green[500] : colors.gray[300]}`,
                  borderRadius: '4px',
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {zone.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Display zone metrics */}
      {selectedZone ? (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Health status section */}
          <div style={{
            backgroundColor: colors.gray[50],
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>
                Health Status
              </h3>
              
              <button
                onClick={() => handleStartEdit('health')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: '4px',
                  color: colors.gray[700],
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Update Health
              </button>
            </div>
            
            {selectedZone.currentHealth ? (
              <div>
                {/* Health Summary */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: getHealthColor(selectedZone.currentHealth.overallScore),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    marginRight: '16px'
                  }}>
                    {selectedZone.currentHealth.overallScore}
                  </div>
                  
                  <div>
                    <div style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 500, 
                      marginBottom: '4px'
                    }}>
                      {getHealthLabel(selectedZone.currentHealth.colorRating)}
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: colors.gray[600]
                    }}>
                      Last updated: {formatDate(selectedZone.currentHealth.lastUpdated)}
                    </div>
                  </div>
                </div>
                
                {/* Health Metrics Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Density */}
                  <div>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: colors.gray[600],
                      marginBottom: '4px'
                    }}>
                      Density
                    </div>
                    <div style={{ 
                      fontSize: '1rem',
                      fontWeight: 500
                    }}>
                      {selectedZone.currentHealth.density}%
                    </div>
                    {/* Progress bar */}
                    <div style={{ 
                      height: '4px', 
                      backgroundColor: colors.gray[200],
                      borderRadius: '2px',
                      overflow: 'hidden',
                      marginTop: '4px'
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${selectedZone.currentHealth.density}%`,
                        backgroundColor: getHealthColor(selectedZone.currentHealth.density),
                        borderRadius: '2px'
                      }} />
                    </div>
                  </div>
                  
                  {/* Weed Coverage */}
                  <div>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: colors.gray[600],
                      marginBottom: '4px'
                    }}>
                      Weed Coverage
                    </div>
                    <div style={{ 
                      fontSize: '1rem',
                      fontWeight: 500
                    }}>
                      {selectedZone.currentHealth.weedCoverage}%
                    </div>
                    {/* Progress bar (inverse - lower is better) */}
                    <div style={{ 
                      height: '4px', 
                      backgroundColor: colors.gray[200],
                      borderRadius: '2px',
                      overflow: 'hidden',
                      marginTop: '4px'
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${selectedZone.currentHealth.weedCoverage}%`,
                        backgroundColor: getHealthColor(100 - selectedZone.currentHealth.weedCoverage),
                        borderRadius: '2px'
                      }} />
                    </div>
                  </div>
                  
                  {/* Bare Spots */}
                  <div>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: colors.gray[600],
                      marginBottom: '4px'
                    }}>
                      Bare Spots
                    </div>
                    <div style={{ 
                      fontSize: '1rem',
                      fontWeight: 500
                    }}>
                      {selectedZone.currentHealth.bareSpots}%
                    </div>
                    {/* Progress bar (inverse - lower is better) */}
                    <div style={{ 
                      height: '4px', 
                      backgroundColor: colors.gray[200],
                      borderRadius: '2px',
                      overflow: 'hidden',
                      marginTop: '4px'
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${selectedZone.currentHealth.bareSpots}%`,
                        backgroundColor: getHealthColor(100 - selectedZone.currentHealth.bareSpots),
                        borderRadius: '2px'
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center',
                padding: '24px 0',
                color: colors.gray[600]
              }}>
                <p style={{ margin: '0 0 16px 0' }}>No health data recorded yet</p>
                <button
                  onClick={() => handleStartEdit('health')}
                  style={{
                    backgroundColor: colors.green[500],
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Add Health Data
                </button>
              </div>
            )}
          </div>
          
          {/* Soil metrics section */}
          <div style={{
            backgroundColor: colors.gray[50],
            borderRadius: '8px',
            padding: '20px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>
                Soil Metrics
              </h3>
              
              <button
                onClick={() => handleStartEdit('soil')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: '4px',
                  color: colors.gray[700],
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Update Metrics
              </button>
            </div>
            
            {selectedZone.metrics ? (
              <div>
                {/* Last Updated */}
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: colors.gray[600],
                  marginBottom: '16px'
                }}>
                  Last updated: {formatDate(selectedZone.metrics.lastUpdated)}
                </div>
                
                {/* Basic Metrics Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  {/* Soil Moisture */}
                  {selectedZone.metrics.soilMoisture !== undefined && (
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: colors.gray[600],
                        marginBottom: '4px'
                      }}>
                        Soil Moisture
                      </div>
                      <div style={{ 
                        fontSize: '1rem',
                        fontWeight: 500
                      }}>
                        {selectedZone.metrics.soilMoisture}%
                      </div>
                      {/* Progress bar */}
                      <div style={{ 
                        height: '4px', 
                        backgroundColor: colors.gray[200],
                        borderRadius: '2px',
                        overflow: 'hidden',
                        marginTop: '4px'
                      }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${selectedZone.metrics.soilMoisture}%`,
                          backgroundColor: selectedZone.metrics.soilMoisture > 50 ? colors.blue[500] : colors.brown[400],
                          borderRadius: '2px'
                        }} />
                      </div>
                    </div>
                  )}
                  
                  {/* Soil Temperature */}
                  {selectedZone.metrics.soilTemperature !== undefined && (
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: colors.gray[600],
                        marginBottom: '4px'
                      }}>
                        Soil Temperature
                      </div>
                      <div style={{ 
                        fontSize: '1rem',
                        fontWeight: 500
                      }}>
                        {selectedZone.metrics.soilTemperature}°F
                      </div>
                      {/* No progress bar for temperature */}
                    </div>
                  )}
                  
                  {/* pH Level */}
                  {selectedZone.metrics.phLevel !== undefined && (
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: colors.gray[600],
                        marginBottom: '4px'
                      }}>
                        pH Level
                      </div>
                      <div style={{ 
                        fontSize: '1rem',
                        fontWeight: 500
                      }}>
                        {selectedZone.metrics.phLevel}
                      </div>
                      {/* Special pH scale */}
                      <div style={{ 
                        height: '4px', 
                        background: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
                        borderRadius: '2px',
                        position: 'relative',
                        marginTop: '4px'
                      }}>
                        {/* pH indicator marker */}
                        <div style={{ 
                          position: 'absolute',
                          top: '50%',
                          left: `${(selectedZone.metrics.phLevel / 14) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          width: '8px',
                          height: '8px',
                          backgroundColor: 'white',
                          border: '1px solid black',
                          borderRadius: '50%'
                        }} />
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '0.7rem',
                        color: colors.gray[600]
                      }}>
                        <span>Acidic</span>
                        <span>Neutral</span>
                        <span>Alkaline</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Sunlight Data */}
                {(selectedZone.metrics.sunlightHours !== undefined || selectedZone.metrics.shadePercentage !== undefined) && (
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: colors.gray[100], 
                    borderRadius: '4px',
                    marginBottom: '16px'
                  }}>
                    <h4 style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 500, 
                      margin: '0 0 8px 0'
                    }}>
                      Sunlight Data
                    </h4>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '16px'
                    }}>
                      {selectedZone.metrics.sunlightHours !== undefined && (
                        <div>
                          <div style={{ 
                            fontSize: '0.75rem',
                            color: colors.gray[600],
                            marginBottom: '4px'
                          }}>
                            Daily Sunlight
                          </div>
                          <div style={{ 
                            fontSize: '1rem',
                            fontWeight: 500
                          }}>
                            {selectedZone.metrics.sunlightHours} hours
                          </div>
                        </div>
                      )}
                      
                      {selectedZone.metrics.shadePercentage !== undefined && (
                        <div>
                          <div style={{ 
                            fontSize: '0.75rem',
                            color: colors.gray[600],
                            marginBottom: '4px'
                          }}>
                            Shade Coverage
                          </div>
                          <div style={{ 
                            fontSize: '1rem',
                            fontWeight: 500
                          }}>
                            {selectedZone.metrics.shadePercentage}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Soil Nutrients */}
                {selectedZone.metrics.soilNutrients && (
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: colors.gray[100], 
                    borderRadius: '4px' 
                  }}>
                    <h4 style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 500, 
                      margin: '0 0 8px 0'
                    }}>
                      Soil Nutrients (NPK)
                    </h4>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px'
                    }}>
                      {/* Nitrogen */}
                      <div>
                        <div style={{ 
                          fontSize: '0.75rem',
                          color: colors.gray[600],
                          marginBottom: '4px'
                        }}>
                          Nitrogen (N)
                        </div>
                        <div style={{ 
                          fontSize: '1rem',
                          fontWeight: 500
                        }}>
                          {selectedZone.metrics.soilNutrients.nitrogen}
                        </div>
                        {/* Progress bar */}
                        <div style={{ 
                          height: '4px', 
                          backgroundColor: colors.gray[200],
                          borderRadius: '2px',
                          overflow: 'hidden',
                          marginTop: '4px'
                        }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${(selectedZone.metrics.soilNutrients.nitrogen / 10) * 100}%`,
                            backgroundColor: colors.green[500],
                            borderRadius: '2px'
                          }} />
                        </div>
                      </div>
                      
                      {/* Phosphorus */}
                      <div>
                        <div style={{ 
                          fontSize: '0.75rem',
                          color: colors.gray[600],
                          marginBottom: '4px'
                        }}>
                          Phosphorus (P)
                        </div>
                        <div style={{ 
                          fontSize: '1rem',
                          fontWeight: 500
                        }}>
                          {selectedZone.metrics.soilNutrients.phosphorus}
                        </div>
                        {/* Progress bar */}
                        <div style={{ 
                          height: '4px', 
                          backgroundColor: colors.gray[200],
                          borderRadius: '2px',
                          overflow: 'hidden',
                          marginTop: '4px'
                        }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${(selectedZone.metrics.soilNutrients.phosphorus / 10) * 100}%`,
                            backgroundColor: colors.blue[500],
                            borderRadius: '2px'
                          }} />
                        </div>
                      </div>
                      
                      {/* Potassium */}
                      <div>
                        <div style={{ 
                          fontSize: '0.75rem',
                          color: colors.gray[600],
                          marginBottom: '4px'
                        }}>
                          Potassium (K)
                        </div>
                        <div style={{ 
                          fontSize: '1rem',
                          fontWeight: 500
                        }}>
                          {selectedZone.metrics.soilNutrients.potassium}
                        </div>
                        {/* Progress bar */}
                        <div style={{ 
                          height: '4px', 
                          backgroundColor: colors.gray[200],
                          borderRadius: '2px',
                          overflow: 'hidden',
                          marginTop: '4px'
                        }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${(selectedZone.metrics.soilNutrients.potassium / 10) * 100}%`,
                            backgroundColor: colors.brown[400],
                            borderRadius: '2px'
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Activity Dates */}
                <div style={{ 
                  marginTop: '20px', 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '16px'
                }}>
                  {selectedZone.metrics.lastWatered && (
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: colors.gray[600],
                        marginBottom: '4px'
                      }}>
                        Last Watered
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem'
                      }}>
                        {formatDate(selectedZone.metrics.lastWatered)}
                      </div>
                    </div>
                  )}
                  
                  {selectedZone.metrics.lastFertilized && (
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: colors.gray[600],
                        marginBottom: '4px'
                      }}>
                        Last Fertilized
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem'
                      }}>
                        {formatDate(selectedZone.metrics.lastFertilized)}
                      </div>
                    </div>
                  )}
                  
                  {selectedZone.metrics.lastMowed && (
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: colors.gray[600],
                        marginBottom: '4px'
                      }}>
                        Last Mowed
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem'
                      }}>
                        {formatDate(selectedZone.metrics.lastMowed)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center',
                padding: '24px 0',
                color: colors.gray[600]
              }}>
                <p style={{ margin: '0 0 16px 0' }}>No soil metrics recorded yet</p>
                <button
                  onClick={() => handleStartEdit('soil')}
                  style={{
                    backgroundColor: colors.green[500],
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Add Soil Metrics
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          padding: '24px 0',
          textAlign: 'center',
          color: colors.gray[600]
        }}>
          <p>Select a zone to view metrics</p>
        </div>
      )}
    </div>
  );
};

export default ZoneMetricsTracker;