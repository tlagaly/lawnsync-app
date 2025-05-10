import React, { useState, useEffect, useRef } from 'react';
import { getZoneImages, addZoneImage, createZoneComparison } from '../../../lib/lawnService';
import type { ZoneImage, ZoneGalleryFilter, ZoneComparison } from '../../../types/lawn';
import colors from '../../../theme/foundations/colors';

interface ZonePhotoGalleryProps {
  zoneId?: string; // Optional - if provided, only shows photos for that zone
  zoneName?: string; // Optional - for display purposes
}

/**
 * ZonePhotoGallery component displays and manages zone-specific lawn photos
 */
const ZonePhotoGallery: React.FC<ZonePhotoGalleryProps> = ({ zoneId, zoneName }) => {
  const [photos, setPhotos] = useState<ZoneImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<ZoneImage | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [seasonFilter, setSeasonFilter] = useState<'spring' | 'summer' | 'fall' | 'winter' | null>(null);
  const [comparisonForm, setComparisonForm] = useState<{
    title: string;
    description: string;
    beforePhotoId: string;
    afterPhotoId: string;
  }>({
    title: '',
    description: '',
    beforePhotoId: '',
    afterPhotoId: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load photos on component mount or when filters change
  useEffect(() => {
    fetchPhotos();
  }, [zoneId, activeTag, seasonFilter]);
  
  // Extract unique tags when photos change
  useEffect(() => {
    const tags = new Set<string>();
    photos.forEach(photo => {
      photo.tags.forEach(tag => {
        // Exclude the zoneId from the displayed tags
        if (tag !== zoneId) {
          tags.add(tag);
        }
      });
    });
    setAvailableTags(Array.from(tags));
  }, [photos, zoneId]);
  
  // Fetch photos with optional filtering
  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      
      // Build filter options
      const filterOptions: Partial<ZoneGalleryFilter> = {
        sortBy: 'newest'
      };
      
      // Add zoneId filter if provided
      if (zoneId) {
        filterOptions.zoneId = zoneId;
      }
      
      // Add tag filter if selected
      if (activeTag) {
        filterOptions.tags = [activeTag];
      }
      
      // Add season filter if selected
      if (seasonFilter) {
        filterOptions.season = seasonFilter;
      }
      
      const fetchedPhotos = await getZoneImages(filterOptions);
      setPhotos(fetchedPhotos);
      
      // Select first photo if none selected and photos exist
      if (fetchedPhotos.length > 0 && !selectedPhoto) {
        setSelectedPhoto(fetchedPhotos[0]);
      } else if (selectedPhoto) {
        // Keep the selected photo in sync with the updated list
        const updatedSelectedPhoto = fetchedPhotos.find(p => p.id === selectedPhoto.id);
        setSelectedPhoto(updatedSelectedPhoto || (fetchedPhotos.length > 0 ? fetchedPhotos[0] : null));
      }
    } catch (error) {
      console.error('Error fetching zone photos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file selection from device
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    await handlePhotoUpload(file);
    
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle photo upload
  const handlePhotoUpload = async (file: File) => {
    if (!zoneId) {
      console.error('Cannot upload photo: No zone selected');
      return;
    }
    
    try {
      // Gather metadata from form
      const imageType = document.querySelector<HTMLInputElement>('input[name="imageType"]:checked');
      const tags = document.querySelector<HTMLInputElement>('#photoTags')?.value.split(',').map(tag => tag.trim()).filter(Boolean) || [];
      
      // Create metadata object
      const metadata = {
        zoneId: zoneId,
        tags: tags,
        isBeforeImage: imageType?.value === 'before',
        isAfterImage: imageType?.value === 'after'
      };
      
      // Upload the photo
      const newPhoto = await addZoneImage(file, metadata);
      
      // Update state with new photo
      setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
      setSelectedPhoto(newPhoto);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };
  
  // Create a before/after comparison
  const handleCreateComparison = async () => {
    if (!zoneId) {
      console.error('Cannot create comparison: No zone selected');
      return;
    }
    
    try {
      // Validate form
      if (!comparisonForm.beforePhotoId || !comparisonForm.afterPhotoId) {
        console.error('Please select both before and after photos');
        return;
      }
      
      if (!comparisonForm.title) {
        console.error('Please provide a title for the comparison');
        return;
      }
      
      // Create the comparison
      const newComparison = await createZoneComparison(
        zoneId,
        comparisonForm.beforePhotoId,
        comparisonForm.afterPhotoId,
        {
          title: comparisonForm.title,
          description: comparisonForm.description
        }
      );
      
      // Close modal and reset form
      setShowComparisonModal(false);
      setComparisonForm({
        title: '',
        description: '',
        beforePhotoId: '',
        afterPhotoId: ''
      });
      
      // Optionally fetch photos again to update any metadata
      fetchPhotos();
      
    } catch (error) {
      console.error('Error creating comparison:', error);
    }
  };
  
  // Handle form input changes for comparison
  const handleComparisonFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setComparisonForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Filter photos by tag
  const filterByTag = (tag: string | null) => {
    setActiveTag(tag);
  };
  
  // Filter photos by season
  const filterBySeason = (season: 'spring' | 'summer' | 'fall' | 'winter' | null) => {
    setSeasonFilter(season);
  };
  
  // Generate a date string for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "20px",
        textAlign: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        Loading zone photos...
      </div>
    );
  }
  
  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "8px",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
    }}>
      {/* Header with title and actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: colors.gray[800] }}>
          {zoneName ? `${zoneName} Photos` : 'Lawn Photos'}
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {photos.length >= 2 && (
            <button
              onClick={() => setShowComparisonModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                backgroundColor: 'white',
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
                  <path d="M21 18V6M3 18V6M12 18V6M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              Compare
            </button>
          )}
          
          <button
            onClick={() => setShowUploadModal(true)}
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
            Add Photo
          </button>
        </div>
      </div>
      
      {/* Filter tags if there are any */}
      {availableTags.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '4px 0 12px',
          scrollbarWidth: 'none', // Hide scrollbar for Firefox
        }}>
          <button
            onClick={() => filterByTag(null)}
            style={{
              backgroundColor: activeTag === null ? colors.green[500] : 'white',
              color: activeTag === null ? 'white' : colors.gray[700],
              border: `1px solid ${activeTag === null ? colors.green[500] : colors.gray[300]}`,
              borderRadius: '999px',
              padding: '4px 12px',
              fontSize: '0.875rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            All Photos
          </button>
          
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => filterByTag(tag)}
              style={{
                backgroundColor: activeTag === tag ? colors.green[500] : 'white',
                color: activeTag === tag ? 'white' : colors.gray[700],
                border: `1px solid ${activeTag === tag ? colors.green[500] : colors.gray[300]}`,
                borderRadius: '999px',
                padding: '4px 12px',
                fontSize: '0.875rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      
      {/* Season filter */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '4px 0 16px',
        scrollbarWidth: 'none', // Hide scrollbar for Firefox
      }}>
        <button
          onClick={() => filterBySeason(null)}
          style={{
            backgroundColor: seasonFilter === null ? colors.green[500] : 'white',
            color: seasonFilter === null ? 'white' : colors.gray[700],
            border: `1px solid ${seasonFilter === null ? colors.green[500] : colors.gray[300]}`,
            borderRadius: '4px',
            padding: '4px 12px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          All Seasons
        </button>
        
        {(['spring', 'summer', 'fall', 'winter'] as const).map(season => (
          <button
            key={season}
            onClick={() => filterBySeason(season)}
            style={{
              backgroundColor: seasonFilter === season ? colors.green[500] : 'white',
              color: seasonFilter === season ? 'white' : colors.gray[700],
              border: `1px solid ${seasonFilter === season ? colors.green[500] : colors.gray[300]}`,
              borderRadius: '4px',
              padding: '4px 12px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {season.charAt(0).toUpperCase() + season.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Empty state */}
      {photos.length === 0 ? (
        <div style={{
          backgroundColor: colors.gray[50],
          borderRadius: "8px",
          padding: "32px 20px",
          textAlign: "center",
          marginTop: '16px'
        }}>
          <p style={{ fontSize: '1rem', color: colors.gray[600], marginBottom: '16px' }}>
            {zoneId 
              ? `No photos added to this zone yet. Add your first photo to start tracking progress.`
              : `No zone photos found. Select a zone and add photos to track progress.`}
          </p>
          {zoneId && (
            <button
              onClick={() => setShowUploadModal(true)}
              style={{
                backgroundColor: colors.green[500],
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Add First Photo
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* Photo grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {photos.map(photo => (
              <div 
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: selectedPhoto?.id === photo.id ? `2px solid ${colors.green[500]}` : '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{
                  position: 'relative',
                  paddingTop: '75%', // 4:3 aspect ratio
                  backgroundColor: colors.gray[100]
                }}>
                  <img
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt={photo.tags.join(', ')}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  
                  {/* Show indicators for before/after photos */}
                  {(photo.isBeforeImage || photo.isAfterImage) && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: photo.isBeforeImage ? colors.blue[500] : colors.green[500],
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {photo.isBeforeImage ? 'BEFORE' : 'AFTER'}
                    </div>
                  )}
                  
                  {/* Show problem indicator if photo has problem areas */}
                  {photo.problemAreas && photo.problemAreas.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: colors.status.error,
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      ISSUE
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '8px 12px' }}>
                  <div style={{
                    fontSize: '0.75rem',
                    color: colors.gray[600],
                    marginBottom: '4px'
                  }}>
                    {formatDate(photo.dateTaken)}
                  </div>
                  
                  {/* Display relevant tags (excluding zone ID) */}
                  {photo.tags.filter(tag => tag !== zoneId).length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      marginTop: '4px'
                    }}>
                      {photo.tags.filter(tag => tag !== zoneId).slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            backgroundColor: colors.gray[100],
                            color: colors.gray[700],
                            fontSize: '0.65rem',
                            padding: '1px 6px',
                            borderRadius: '20px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '80px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {photo.tags.filter(tag => tag !== zoneId).length > 2 && (
                        <span style={{
                          fontSize: '0.65rem',
                          color: colors.gray[500]
                        }}>
                          +{photo.tags.filter(tag => tag !== zoneId).length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Selected photo detail view */}
          {selectedPhoto && (
            <div style={{
              border: `1px solid ${colors.gray[200]}`,
              borderRadius: '8px',
              overflow: 'hidden',
              marginTop: '16px'
            }}>
              <div style={{
                position: 'relative',
                backgroundColor: colors.gray[100],
                textAlign: 'center',
                minHeight: '300px',
                maxHeight: '500px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.tags.join(', ')}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain'
                  }}
                />
                
                {/* Problem area markers */}
                {selectedPhoto.problemAreas?.map(area => (
                  <div
                    key={area.id}
                    style={{
                      position: 'absolute',
                      left: `${area.x}%`,
                      top: `${area.y}%`,
                      width: `${area.radius * 2}%`,
                      height: `${area.radius * 2}%`,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      border: '2px solid red',
                      backgroundColor: 'rgba(255, 0, 0, 0.2)',
                      cursor: 'pointer'
                    }}
                    title={area.description}
                  />
                ))}
              </div>
              
              <div style={{ padding: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>
                    {selectedPhoto.isBeforeImage 
                      ? 'Before Photo'
                      : selectedPhoto.isAfterImage
                        ? 'After Photo'
                        : zoneName 
                          ? `${zoneName} Photo`
                          : 'Lawn Photo'
                    }
                  </h3>
                  
                  <div style={{ color: colors.gray[600], fontSize: '0.875rem' }}>
                    {formatDate(selectedPhoto.dateTaken)}
                  </div>
                </div>
                
                {/* Weather data if available */}
                {selectedPhoto.weather && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    color: colors.gray[600],
                    fontSize: '0.875rem',
                    marginBottom: '12px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L14.39 6.26L19 7.13L15.5 10.56L16.5 15.22L12 13.05L7.5 15.22L8.5 10.56L5 7.13L9.61 6.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>
                      {selectedPhoto.weather.condition}, {selectedPhoto.weather.temperature}°F
                    </span>
                  </div>
                )}
                
                {/* Tags */}
                {selectedPhoto.tags.filter(tag => tag !== zoneId).length > 0 && (
                  <div style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: '12px' 
                  }}>
                    {selectedPhoto.tags.filter(tag => tag !== zoneId).map((tag, index) => (
                      <span 
                        key={index}
                        style={{
                          backgroundColor: colors.gray[100],
                          color: colors.gray[700],
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Problem areas list if any */}
                {selectedPhoto.problemAreas && selectedPhoto.problemAreas.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '0.875rem', margin: '0 0 8px 0' }}>Problem Areas:</h4>
                    <ul style={{ 
                      margin: 0, 
                      padding: '0 0 0 16px', 
                      fontSize: '0.875rem',
                      color: colors.gray[700]
                    }}>
                      {selectedPhoto.problemAreas.map(area => (
                        <li key={area.id}>
                          {area.description}
                          <span style={{ 
                            fontSize: '0.75rem',
                            color: colors.gray[500],
                            marginLeft: '4px'
                          }}>
                            ({area.status})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Upload modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Add New Zone Photo</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 12px 0', fontWeight: 500 }}>Photo Type:</p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    type="radio" 
                    name="imageType" 
                    value="regular" 
                    defaultChecked 
                  />
                  Regular Photo
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    type="radio" 
                    name="imageType" 
                    value="before" 
                  />
                  Before Photo
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    type="radio" 
                    name="imageType" 
                    value="after" 
                  />
                  After Photo
                </label>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="photoTags" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: 500
                }}
              >
                Tags (comma separated):
              </label>
              <input
                id="photoTags"
                type="text"
                placeholder="e.g., spring, maintenance, fertilizer"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${colors.gray[300]}`,
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ marginTop: '24px' }}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px' 
              }}>
                <button
                  onClick={() => setShowUploadModal(false)}
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
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: colors.green[500],
                    color: 'white',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 3H3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H21C22.1046 21 23 20.1046 23 19V5C23 3.89543 22.1046 3 21 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12L12 9L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 9V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Select Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Comparison modal */}
      {showComparisonModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Create Before & After Comparison</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="title" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: 500
                }}
              >
                Comparison Title:
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={comparisonForm.title}
                onChange={handleComparisonFormChange}
                placeholder="e.g., Front Yard 2 Month Progress"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${colors.gray[300]}`,
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="description" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: 500
                }}
              >
                Description (optional):
              </label>
              <textarea
                id="description"
                name="description"
                value={comparisonForm.description}
                onChange={handleComparisonFormChange}
                placeholder="Describe the changes or improvements"
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
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '16px',
              marginBottom: '24px' 
            }}>
              {/* Before photo selection */}
              <div>
                <label 
                  htmlFor="beforePhotoId" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: 500
                  }}
                >
                  Before Photo:
                </label>
                <select
                  id="beforePhotoId"
                  name="beforePhotoId"
                  value={comparisonForm.beforePhotoId}
                  onChange={handleComparisonFormChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${colors.gray[300]}`,
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Select Before Photo</option>
                  {photos
                    .filter(p => p.isBeforeImage || (!p.isBeforeImage && !p.isAfterImage))
                    .sort((a, b) => new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime())
                    .map(photo => (
                      <option key={`before-${photo.id}`} value={photo.id}>
                        {formatDate(photo.dateTaken)} {photo.isBeforeImage ? '(Before)' : ''}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              {/* After photo selection */}
              <div>
                <label 
                  htmlFor="afterPhotoId" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: 500
                  }}
                >
                  After Photo:
                </label>
                <select
                  id="afterPhotoId"
                  name="afterPhotoId"
                  value={comparisonForm.afterPhotoId}
                  onChange={handleComparisonFormChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${colors.gray[300]}`,
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Select After Photo</option>
                  {photos
                    .filter(p => p.isAfterImage || (!p.isBeforeImage && !p.isAfterImage))
                    .sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime())
                    .map(photo => (
                      <option key={`after-${photo.id}`} value={photo.id}>
                        {formatDate(photo.dateTaken)} {photo.isAfterImage ? '(After)' : ''}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px' 
            }}>
              <button
                onClick={() => setShowComparisonModal(false)}
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
                onClick={handleCreateComparison}
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
                Create Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZonePhotoGallery;