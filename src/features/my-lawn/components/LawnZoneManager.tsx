import React, { useState, useEffect } from 'react';
import { getLawnZones, createLawnZone, updateLawnZone, deleteLawnZone } from '../../../lib/lawnService';
import type { LawnZone, SoilType, SunExposure, Slope, GrassType } from '../../../types/lawn';
import colors from '../../../theme/foundations/colors';

/**
 * LawnZoneManager component manages lawn zones with create, edit, and delete functions
 */
const LawnZoneManager: React.FC = () => {
  const [zones, setZones] = useState<LawnZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<LawnZone | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<Partial<LawnZone>>({});
  
  // Load zones on component mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        setIsLoading(true);
        const data = await getLawnZones();
        setZones(data);
      } catch (error) {
        console.error('Error fetching lawn zones:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchZones();
  }, []);
  
  // Handle zone selection
  const handleSelectZone = (zone: LawnZone) => {
    setSelectedZone(zone);
    setIsEditing(false);
    setIsCreating(false);
    setShowDeleteConfirm(false);
  };
  
  // Start creating a new zone
  const handleStartCreateZone = () => {
    setFormData({
      name: '',
      size: 0,
      grassType: 'kentucky-bluegrass',
      soilType: 'loam',
      sunExposure: 'full',
      slope: 'flat',
      tags: [],
      notes: ''
    });
    setSelectedZone(null);
    setIsEditing(false);
    setIsCreating(true);
  };
  
  // Start editing a zone
  const handleStartEditZone = () => {
    if (selectedZone) {
      setFormData({ ...selectedZone });
      setIsEditing(true);
      setIsCreating(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'size' ? Number(value) : value
    });
  };
  
  // Handle dropdown selects
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle tags input
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData({
      ...formData,
      tags: tagsArray
    });
  };
  
  // Save zone changes (create or update)
  const handleSaveZone = async () => {
    try {
      if (isCreating) {
        // Create new zone
        const newZone = await createLawnZone(formData as Omit<LawnZone, 'id' | 'createdAt' | 'updatedAt'>);
        setZones([...zones, newZone]);
        setSelectedZone(newZone);
      } else if (isEditing && selectedZone) {
        // Update existing zone
        const updatedZone = await updateLawnZone(
          selectedZone.id,
          formData as Partial<Omit<LawnZone, 'id' | 'createdAt' | 'updatedAt'>>
        );
        if (updatedZone) {
          setZones(zones.map(z => z.id === updatedZone.id ? updatedZone : z));
          setSelectedZone(updatedZone);
        }
      }
      
      setIsEditing(false);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving zone:', error);
    }
  };
  
  // Cancel editing/creating
  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setShowDeleteConfirm(false);
  };
  
  // Start delete confirmation
  const handleStartDeleteZone = () => {
    setShowDeleteConfirm(true);
  };
  
  // Confirm and delete zone
  const handleConfirmDeleteZone = async () => {
    if (selectedZone) {
      try {
        const success = await deleteLawnZone(selectedZone.id);
        if (success) {
          setZones(zones.filter(z => z.id !== selectedZone.id));
          setSelectedZone(null);
        }
      } catch (error) {
        console.error('Error deleting zone:', error);
      }
      setShowDeleteConfirm(false);
    }
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
  
  if (isLoading) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "20px",
        textAlign: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        Loading lawn zones...
      </div>
    );
  }
  
  // Edit or Create form view
  if (isEditing || isCreating) {
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
            {isCreating ? 'Create New Zone' : 'Edit Zone'}
          </h2>
        </div>
        
        <form style={{ display: 'grid', gap: '16px' }}>
          {/* Zone Name */}
          <div>
            <label 
              htmlFor="name" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Zone Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="e.g., Front Yard, Backyard, etc."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
          </div>
          
          {/* Zone Size */}
          <div>
            <label 
              htmlFor="size" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Size (square feet)
            </label>
            <input
              id="size"
              name="size"
              type="number"
              min="0"
              value={formData.size || ''}
              onChange={handleInputChange}
              placeholder="Area in square feet"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
          </div>
          
          {/* Row for grass type and soil type */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Grass Type */}
            <div>
              <label 
                htmlFor="grassType" 
                style={{ 
                  display: 'block', 
                  marginBottom: '4px', 
                  fontSize: '0.875rem',
                  color: colors.gray[700]
                }}
              >
                Grass Type
              </label>
              <select
                id="grassType"
                name="grassType"
                value={formData.grassType || ''}
                onChange={handleSelectChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${colors.gray[300]}`,
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="kentucky-bluegrass">Kentucky Bluegrass</option>
                <option value="fescue">Fescue</option>
                <option value="bermuda">Bermuda</option>
                <option value="ryegrass">Ryegrass</option>
                <option value="st-augustine">St. Augustine</option>
                <option value="zoysia">Zoysia</option>
                <option value="bentgrass">Bentgrass</option>
                <option value="buffalograss">Buffalograss</option>
                <option value="centipede">Centipede</option>
              </select>
            </div>
            
            {/* Soil Type */}
            <div>
              <label 
                htmlFor="soilType" 
                style={{ 
                  display: 'block', 
                  marginBottom: '4px', 
                  fontSize: '0.875rem',
                  color: colors.gray[700]
                }}
              >
                Soil Type
              </label>
              <select
                id="soilType"
                name="soilType"
                value={formData.soilType || ''}
                onChange={handleSelectChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${colors.gray[300]}`,
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="clay">Clay</option>
                <option value="loam">Loam</option>
                <option value="sand">Sandy</option>
                <option value="silt">Silty</option>
                <option value="peaty">Peaty</option>
                <option value="chalky">Chalky</option>
              </select>
            </div>
          </div>
          
          {/* Row for sun exposure and slope */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Sun Exposure */}
            <div>
              <label 
                htmlFor="sunExposure" 
                style={{ 
                  display: 'block', 
                  marginBottom: '4px', 
                  fontSize: '0.875rem',
                  color: colors.gray[700]
                }}
              >
                Sun Exposure
              </label>
              <select
                id="sunExposure"
                name="sunExposure"
                value={formData.sunExposure || ''}
                onChange={handleSelectChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${colors.gray[300]}`,
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="full">Full Sun</option>
                <option value="partial">Partial Sun</option>
                <option value="shade">Mostly Shade</option>
              </select>
            </div>
            
            {/* Slope */}
            <div>
              <label 
                htmlFor="slope" 
                style={{ 
                  display: 'block', 
                  marginBottom: '4px', 
                  fontSize: '0.875rem',
                  color: colors.gray[700]
                }}
              >
                Slope
              </label>
              <select
                id="slope"
                name="slope"
                value={formData.slope || ''}
                onChange={handleSelectChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${colors.gray[300]}`,
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="flat">Flat</option>
                <option value="slight">Slight</option>
                <option value="moderate">Moderate</option>
                <option value="steep">Steep</option>
              </select>
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <label 
              htmlFor="tags" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Tags (comma separated)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags?.join(', ') || ''}
              onChange={handleTagsChange}
              placeholder="e.g., front, sunny, playground"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
          </div>
          
          {/* Notes */}
          <div>
            <label 
              htmlFor="notes" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              placeholder="Additional details about this zone"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem',
                minHeight: '80px',
                resize: 'vertical'
              }}
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
              onClick={handleCancel}
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
              onClick={handleSaveZone}
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
              {isCreating ? 'Create Zone' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  // Delete confirmation view
  if (showDeleteConfirm && selectedZone) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          color: colors.gray[800],
          marginTop: 0,
          marginBottom: '16px'
        }}>
          Delete Zone
        </h2>
        
        <p style={{ marginBottom: '20px' }}>
          Are you sure you want to delete the zone <strong>{selectedZone.name}</strong>? This action cannot be undone.
        </p>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px' 
        }}>
          <button
            onClick={handleCancel}
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
            onClick={handleConfirmDeleteZone}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: colors.status.error,
              color: 'white',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Delete Zone
          </button>
        </div>
      </div>
    );
  }
  
  // Main view - list of zones and selected zone details
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
          Lawn Zones
        </h2>
        <button
          onClick={handleStartCreateZone}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            backgroundColor: colors.green[500],
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          <span style={{ display: 'inline-flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          Add Zone
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Zones list */}
        <div style={{
          border: `1px solid ${colors.gray[200]}`,
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          {zones.length === 0 ? (
            <div style={{ 
              padding: '24px', 
              textAlign: 'center', 
              color: colors.gray[600],
              fontSize: '0.875rem'
            }}>
              No zones created yet. Click "Add Zone" to create your first lawn zone.
            </div>
          ) : (
            <ul style={{ 
              listStyle: 'none', 
              margin: 0, 
              padding: 0,
              maxHeight: '500px',
              overflowY: 'auto'
            }}>
              {zones.map(zone => (
                <li 
                  key={zone.id}
                  onClick={() => handleSelectZone(zone)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: `1px solid ${colors.gray[200]}`,
                    cursor: 'pointer',
                    backgroundColor: selectedZone?.id === zone.id ? colors.gray[100] : 'transparent'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: 500,
                        marginBottom: '2px'
                      }}>
                        {zone.name}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: colors.gray[600],
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>{zone.size} sq ft</span>
                        <span>•</span>
                        <span style={{ textTransform: 'capitalize' }}>{zone.grassType.replace(/-/g, ' ')}</span>
                      </div>
                    </div>
                    
                    {/* Show health indicator if available */}
                    {zone.currentHealth && (
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: getHealthColor(zone.currentHealth.overallScore)
                      }} />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Zone details */}
        <div>
          {selectedZone ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Zone details header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    marginTop: 0,
                    marginBottom: '4px',
                    color: colors.gray[800] 
                  }}>
                    {selectedZone.name}
                  </h3>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: colors.gray[600] 
                  }}>
                    Created: {formatDate(selectedZone.createdAt)}
                    {selectedZone.createdAt !== selectedZone.updatedAt && 
                      ` • Updated: ${formatDate(selectedZone.updatedAt)}`}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleStartEditZone}
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
                    Edit
                  </button>
                  <button
                    onClick={handleStartDeleteZone}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      border: `1px solid ${colors.status.error}`,
                      borderRadius: '4px',
                      color: colors.status.error,
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Zone basic info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '20px',
                padding: '16px',
                backgroundColor: colors.gray[50],
                borderRadius: '6px'
              }}>
                <div>
                  <div style={{ 
                    fontSize: '0.75rem',
                    color: colors.gray[600],
                    marginBottom: '4px'
                  }}>
                    Size
                  </div>
                  <div style={{ 
                    fontSize: '1rem',
                    fontWeight: 500
                  }}>
                    {selectedZone.size.toLocaleString()} sq ft
                  </div>
                </div>
                
                <div>
                  <div style={{ 
                    fontSize: '0.75rem',
                    color: colors.gray[600],
                    marginBottom: '4px'
                  }}>
                    Grass Type
                  </div>
                  <div style={{ 
                    fontSize: '1rem',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}>
                    {selectedZone.grassType.replace(/-/g, ' ')}
                  </div>
                </div>
                
                <div>
                  <div style={{ 
                    fontSize: '0.75rem',
                    color: colors.gray[600],
                    marginBottom: '4px'
                  }}>
                    Soil Type
                  </div>
                  <div style={{ 
                    fontSize: '1rem',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}>
                    {selectedZone.soilType}
                  </div>
                </div>
                
                <div>
                  <div style={{ 
                    fontSize: '0.75rem',
                    color: colors.gray[600],
                    marginBottom: '4px'
                  }}>
                    Sun Exposure
                  </div>
                  <div style={{ 
                    fontSize: '1rem',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}>
                    {selectedZone.sunExposure === 'full' ? 'Full Sun' : 
                     selectedZone.sunExposure === 'partial' ? 'Partial Sun' : 'Shade'}
                  </div>
                </div>
                
                <div>
                  <div style={{ 
                    fontSize: '0.75rem',
                    color: colors.gray[600],
                    marginBottom: '4px'
                  }}>
                    Slope
                  </div>
                  <div style={{ 
                    fontSize: '1rem',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}>
                    {selectedZone.slope}
                  </div>
                </div>
              </div>
              
              {/* Health status */}
              {selectedZone.currentHealth && (
                <div style={{
                  padding: '16px',
                  backgroundColor: colors.gray[50],
                  borderRadius: '6px'
                }}>
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 500, 
                    margin: '0 0 12px 0',
                    color: colors.gray[700]
                  }}>
                    Health Status
                  </h4>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: colors.gray[600],
                        marginBottom: '4px'
                      }}>
                        Overall Health
                      </div>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: getHealthColor(selectedZone.currentHealth.overallScore)
                        }} />
                        <div style={{ 
                          fontWeight: 500
                        }}>
                          {getHealthLabel(selectedZone.currentHealth.colorRating)}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: colors.gray[500]
                      }}>
                        Score: {selectedZone.currentHealth.overallScore}/100
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: colors.gray[600],
                        marginBottom: '4px'
                      }}>
                        Density
                      </div>
                      <div style={{ 
                        fontWeight: 500
                      }}>
                        {selectedZone.currentHealth.density}%
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: colors.gray[600],
                        marginBottom: '4px'
                      }}>
                        Weed Coverage
                      </div>
                      <div style={{ 
                        fontWeight: 500
                      }}>
                        {selectedZone.currentHealth.weedCoverage}%
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: colors.gray[600],
                        marginBottom: '4px'
                      }}>
                        Bare Spots
                      </div>
                      <div style={{ 
                        fontWeight: 500
                      }}>
                        {selectedZone.currentHealth.bareSpots}%
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.75rem',
                    color: colors.gray[500],
                    marginTop: '12px'
                  }}>
                    Last measured: {formatDate(selectedZone.currentHealth.lastUpdated)}
                  </div>
                </div>
              )}
              
              {/* Recent metrics */}
              {selectedZone.metrics && (
                <div style={{
                  padding: '16px',
                  backgroundColor: colors.gray[50],
                  borderRadius: '6px'
                }}>
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 500, 
                    margin: '0 0 12px 0',
                    color: colors.gray[700]
                  }}>
                    Recent Metrics
                  </h4>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '16px'
                  }}>
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
                          fontWeight: 500
                        }}>
                          {selectedZone.metrics.soilMoisture}%
                        </div>
                      </div>
                    )}
                    
                    {selectedZone.metrics.soilTemperature !== undefined && (
                      <div>
                        <div style={{ 
                          fontSize: '0.75rem',
                          color: colors.gray[600],
                          marginBottom: '4px'
                        }}>
                          Soil Temp
                        </div>
                        <div style={{ 
                          fontWeight: 500
                        }}>
                          {selectedZone.metrics.soilTemperature}°F
                        </div>
                      </div>
                    )}
                    
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
                          fontWeight: 500
                        }}>
                          {selectedZone.metrics.phLevel}
                        </div>
                      </div>
                    )}
                    
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
                          fontWeight: 500
                        }}>
                          {selectedZone.metrics.sunlightHours} hrs
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '16px',
                    marginTop: '16px'
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
              )}
              
              {/* Tags */}
              {selectedZone.tags && selectedZone.tags.length > 0 && (
                <div style={{
                  padding: '16px',
                  backgroundColor: colors.gray[50],
                  borderRadius: '6px'
                }}>
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 500, 
                    margin: '0 0 12px 0',
                    color: colors.gray[700]
                  }}>
                    Tags
                  </h4>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {selectedZone.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        style={{
                          backgroundColor: colors.blue[100],
                          color: colors.blue[700],
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {selectedZone.notes && (
                <div style={{
                  padding: '16px',
                  backgroundColor: colors.gray[50],
                  borderRadius: '6px'
                }}>
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 500, 
                    margin: '0 0 8px 0',
                    color: colors.gray[700]
                  }}>
                    Notes
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedZone.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              padding: '40px 20px',
              color: colors.gray[600]
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: colors.gray[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3.5V2M5.06066 5.06066L4 4M5 9H3.5M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke={colors.gray[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 19H21M12 18V19M19 12L17 7L7 9L5 13.5L8 17.5H16L19 12Z" stroke={colors.gray[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p style={{ margin: '0 0 8px 0', fontWeight: 500 }}>
                Select a zone or create a new one
              </p>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                Create zones to manage different areas of your lawn
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawnZoneManager;