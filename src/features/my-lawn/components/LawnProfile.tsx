import React, { useState, useEffect } from 'react';
import { getLawnProfile, updateLawnProfile } from '../../../lib/lawnService';
import type { LawnProfile as LawnProfileType, GrassType, SoilType } from '../../../types/lawn';
import colors from '../../../theme/foundations/colors';

/**
 * LawnProfile component displays overall lawn information and allows editing
 */
const LawnProfile: React.FC = () => {
  const [profile, setProfile] = useState<LawnProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<LawnProfileType>>({});
  
  // Load lawn profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await getLawnProfile();
        setProfile(data);
        setFormData(data || {});
      } catch (error) {
        console.error('Error fetching lawn profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'totalSize' ? Number(value) : value
    });
  };
  
  // Handle soil type selection
  const handleSoilTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      soilType: e.target.value as SoilType
    });
  };
  
  // Handle pH level input
  const handlePhLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      phLevel: Number(e.target.value)
    });
  };
  
  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      const updatedProfile = await updateLawnProfile(formData);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating lawn profile:', error);
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };
  
  // Calculate total area of all zones
  const calculateZonesTotalArea = () => {
    if (!profile?.zones) return 0;
    return profile.zones.reduce((total, zone) => total + zone.size, 0);
  };
  
  // Calculate coverage percentages
  const calculateCoveragePercentage = () => {
    const totalZoneArea = calculateZonesTotalArea();
    return profile?.totalSize ? Math.round((totalZoneArea / profile.totalSize) * 100) : 0;
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
        Loading lawn profile...
      </div>
    );
  }
  
  // Display placeholder when no profile exists
  if (!profile && !isEditing) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        <h2 style={{ marginTop: 0, fontSize: '1.25rem', color: colors.gray[800] }}>
          Lawn Profile
        </h2>
        <div style={{
          backgroundColor: colors.gray[100],
          borderRadius: "6px",
          padding: "24px",
          textAlign: "center"
        }}>
          <p style={{ marginBottom: '16px', color: colors.gray[700] }}>
            No lawn profile set up yet. Create one to get started with zone management.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              backgroundColor: colors.green[500],
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Create Lawn Profile
          </button>
        </div>
      </div>
    );
  }
  
  // Edit mode
  if (isEditing) {
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
            {profile ? 'Edit Lawn Profile' : 'Create Lawn Profile'}
          </h2>
        </div>
        
        <form style={{ display: 'grid', gap: '16px' }}>
          {/* Name */}
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
              Lawn Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="e.g., Home Lawn, Back Garden"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
          </div>
          
          {/* Address */}
          <div>
            <label 
              htmlFor="address" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address || ''}
              onChange={handleInputChange}
              placeholder="Enter your property address"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
          </div>
          
          {/* Total Size */}
          <div>
            <label 
              htmlFor="totalSize" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '0.875rem',
                color: colors.gray[700]
              }}
            >
              Total Lawn Size (sq ft)
            </label>
            <input
              id="totalSize"
              name="totalSize"
              type="number"
              min="0"
              value={formData.totalSize || ''}
              onChange={handleInputChange}
              placeholder="Total area in square feet"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem'
              }}
            />
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
              onChange={handleSoilTypeChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '1rem',
                backgroundColor: 'white'
              }}
            >
              <option value="">Select Soil Type</option>
              <option value="clay">Clay</option>
              <option value="loam">Loam</option>
              <option value="sand">Sandy</option>
              <option value="silt">Silty</option>
              <option value="peaty">Peaty</option>
              <option value="chalky">Chalky</option>
            </select>
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
              Soil pH Level (if known)
            </label>
            <input
              id="phLevel"
              name="phLevel"
              type="number"
              min="0"
              max="14"
              step="0.1"
              value={formData.phLevel || ''}
              onChange={handlePhLevelChange}
              placeholder="e.g., 6.5"
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
              placeholder="Additional information about your lawn"
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
              onClick={handleSaveProfile}
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
              Save Profile
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  // View mode (displaying profile)
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
          Lawn Profile
        </h2>
        <button
          onClick={() => setIsEditing(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            backgroundColor: 'transparent',
            border: `1px solid ${colors.gray[300]}`,
            borderRadius: '4px',
            color: colors.gray[700],
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          <span style={{ display: 'inline-flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 3.5L20.5 7.5L16.5 11.5M20.5 7.5H10.5M12.5 20.5H4.5C3.97 20.5 3.5 20.03 3.5 19.5V4.5C3.5 3.97 3.97 3.5 4.5 3.5H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          Edit
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {/* Basic info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          padding: '16px',
          backgroundColor: colors.gray[50],
          borderRadius: '6px'
        }}>
          {/* Name and Address */}
          <div>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: 500, 
              margin: '0 0 8px 0',
              color: colors.gray[700]
            }}>
              {profile?.name || 'Unnamed Lawn'}
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '0.875rem',
              color: colors.gray[600]
            }}>
              {profile?.address || 'No address provided'}
            </p>
          </div>
          
          {/* Size Info */}
          <div>
            <div style={{ 
              fontSize: '0.875rem',
              color: colors.gray[600],
              marginBottom: '4px'
            }}>
              Total Size
            </div>
            <div style={{ 
              fontSize: '1.125rem',
              fontWeight: 500
            }}>
              {profile?.totalSize?.toLocaleString() || 0} sq ft
            </div>
          </div>
          
          {/* Zone Coverage */}
          <div>
            <div style={{ 
              fontSize: '0.875rem',
              color: colors.gray[600],
              marginBottom: '4px'
            }}>
              Zone Coverage
            </div>
            <div style={{ 
              fontSize: '1.125rem',
              fontWeight: 500
            }}>
              {calculateCoveragePercentage()}%
            </div>
            <div style={{ 
              fontSize: '0.75rem',
              color: colors.gray[500]
            }}>
              {calculateZonesTotalArea().toLocaleString()} sq ft in zones
            </div>
          </div>
          
          {/* Zone Count */}
          <div>
            <div style={{ 
              fontSize: '0.875rem',
              color: colors.gray[600],
              marginBottom: '4px'
            }}>
              Zones
            </div>
            <div style={{ 
              fontSize: '1.125rem',
              fontWeight: 500
            }}>
              {profile?.zones?.length || 0}
            </div>
          </div>
        </div>
        
        {/* Soil Information */}
        <div style={{
          padding: '16px',
          backgroundColor: colors.gray[50],
          borderRadius: '6px'
        }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: 500, 
            margin: '0 0 12px 0',
            color: colors.gray[700]
          }}>
            Soil Conditions
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px'
          }}>
            {/* Soil Type */}
            <div>
              <div style={{ 
                fontSize: '0.875rem',
                color: colors.gray[600],
                marginBottom: '4px'
              }}>
                Soil Type
              </div>
              <div style={{ fontSize: '1rem' }}>
                {profile?.soilType ? (
                  <span style={{ 
                    textTransform: 'capitalize'
                  }}>
                    {profile.soilType}
                  </span>
                ) : (
                  <span style={{ color: colors.gray[500], fontStyle: 'italic', fontSize: '0.875rem' }}>
                    Not specified
                  </span>
                )}
              </div>
            </div>
            
            {/* pH Level */}
            <div>
              <div style={{ 
                fontSize: '0.875rem',
                color: colors.gray[600],
                marginBottom: '4px'
              }}>
                pH Level
              </div>
              <div style={{ fontSize: '1rem' }}>
                {profile?.phLevel ? (
                  <span>{profile.phLevel}</span>
                ) : (
                  <span style={{ color: colors.gray[500], fontStyle: 'italic', fontSize: '0.875rem' }}>
                    Not measured
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Grass Types */}
        <div style={{
          padding: '16px',
          backgroundColor: colors.gray[50],
          borderRadius: '6px'
        }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: 500, 
            margin: '0 0 12px 0',
            color: colors.gray[700]
          }}>
            Grass Types
          </h3>
          
          {profile?.grassTypes && profile.grassTypes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profile.grassTypes.map((grass, index) => (
                <div key={`${grass.type}-${index}`} style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ 
                    textTransform: 'capitalize',
                    fontSize: '0.875rem' 
                  }}>
                    {grass.type.replace(/-/g, ' ')}
                  </div>
                  <div style={{
                    backgroundColor: colors.green[100],
                    color: colors.green[700],
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {grass.coveragePercentage}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: colors.gray[500], fontStyle: 'italic', fontSize: '0.875rem' }}>
              No grass types specified
            </div>
          )}
        </div>
        
        {/* Notes */}
        {profile?.notes && (
          <div style={{
            padding: '16px',
            backgroundColor: colors.gray[50],
            borderRadius: '6px'
          }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: 500, 
              margin: '0 0 8px 0',
              color: colors.gray[700]
            }}>
              Notes
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '0.875rem',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap'
            }}>
              {profile.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawnProfile;