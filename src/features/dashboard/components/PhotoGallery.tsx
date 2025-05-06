import React, { useState, useEffect, useRef } from 'react';
import { getPhotos, uploadPhoto, takePhoto, getPhotoWeatherData } from '../../../lib/galleryService';
import type { LawnPhoto, GalleryFilterOptions } from '../../../types/gallery';
import colors from '../../../theme/foundations/colors';

/**
 * PhotoGallery component for displaying lawn progress photos
 * Provides functionality for viewing, filtering, and adding new photos
 */
const PhotoGallery: React.FC = () => {
  const [photos, setPhotos] = useState<LawnPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<LawnPhoto | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [seasonFilter, setSeasonFilter] = useState<'spring' | 'summer' | 'fall' | 'winter' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect swipe gestures
  const minSwipeDistance = 50;

  // Get photos on component mount
  useEffect(() => {
    fetchPhotos();
  }, []);

  // Extract unique tags when photos change
  useEffect(() => {
    const tags = new Set<string>();
    photos.forEach(photo => {
      photo.tags.forEach(tag => tags.add(tag));
    });
    setAvailableTags(Array.from(tags));
  }, [photos]);

  // Fetch photos with optional filtering
  const fetchPhotos = async (
    filterOptions?: Partial<GalleryFilterOptions>
  ) => {
    try {
      setIsLoading(true);
      const fetchedPhotos = await getPhotos(filterOptions);
      setPhotos(fetchedPhotos);
      
      // Select first photo if none selected and photos exist
      if (fetchedPhotos.length > 0 && !selectedPhoto) {
        setSelectedPhoto(fetchedPhotos[0]);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
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

  // Handle camera capture
  const handleCameraCapture = async () => {
    const file = await takePhoto();
    if (file) {
      await handlePhotoUpload(file);
    }
  };

  // Common upload handler
  const handlePhotoUpload = async (file: File) => {
    try {
      // Get current date/time
      const now = new Date();
      const dateTaken = now.toISOString();
      
      // Get weather if available
      const weatherData = await getPhotoWeatherData();
      
      // Create basic tags (season, time of day)
      const month = now.getMonth();
      let season: string;
      if (month >= 2 && month <= 4) season = 'spring';
      else if (month >= 5 && month <= 7) season = 'summer';
      else if (month >= 8 && month <= 10) season = 'fall';
      else season = 'winter';
      
      const hour = now.getHours();
      let timeOfDay: string;
      if (hour >= 5 && hour < 12) timeOfDay = 'morning';
      else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else timeOfDay = 'evening';
      
      // Default tags including season and time of day
      const tags = [season, timeOfDay];
      
      // Upload the photo
      const newPhoto = await uploadPhoto(file, {
        dateTaken,
        title: `Lawn Photo - ${now.toLocaleDateString()}`,
        tags,
        weather: weatherData || undefined
      });
      
      // Update local state with the new photo
      setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
      setSelectedPhoto(newPhoto);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe || isRightSwipe) {
      navigatePhotos(isLeftSwipe ? 'next' : 'prev');
    }
  };

  // Navigate between photos
  const navigatePhotos = (direction: 'next' | 'prev') => {
    if (!selectedPhoto || photos.length <= 1) return;
    
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    let newIndex: number;
    
    if (direction === 'next') {
      newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    }
    
    setSelectedPhoto(photos[newIndex]);
  };

  // Filter photos by tag
  const filterByTag = (tag: string | null) => {
    setActiveTag(tag);
    
    if (tag) {
      fetchPhotos({ tags: [tag], sortBy: 'newest' });
    } else {
      fetchPhotos({ sortBy: 'newest' });
    }
  };

  // Filter photos by season
  const filterBySeason = (season: 'spring' | 'summer' | 'fall' | 'winter' | null) => {
    setSeasonFilter(season);
    
    if (season) {
      fetchPhotos({ season, sortBy: 'newest' });
    } else {
      fetchPhotos({ sortBy: 'newest' });
    }
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
        Loading gallery...
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header with filter controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Lawn Progress Gallery</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            backgroundColor: colors.green[500],
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span style={{ display: 'inline-flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          Add Photo
        </button>
      </div>

      {/* Filter tags */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '4px 0',
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

      {/* Season filter */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '4px 0',
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

      {photos.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "32px 20px",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
        }}>
          <p style={{ fontSize: '1rem', color: colors.gray[600] }}>
            No photos found. Add your first lawn photo to start tracking progress.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              backgroundColor: colors.green[500],
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 16px',
              marginTop: '16px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Take First Photo
          </button>
        </div>
      ) : (
        <>
          {/* Selected Photo View */}
          {selectedPhoto && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div style={{
                position: 'relative',
                paddingTop: '75%', // 4:3 aspect ratio
                backgroundColor: colors.gray[100]
              }}>
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title || 'Lawn photo'}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                
                {/* Navigation controls */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px',
                  pointerEvents: 'none'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigatePhotos('prev');
                    }}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      pointerEvents: 'auto'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigatePhotos('next');
                    }}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      pointerEvents: 'auto'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
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
                      pointerEvents: 'auto',
                      cursor: 'pointer'
                    }}
                    title={area.description}
                  />
                ))}
              </div>
              
              <div style={{ padding: '12px 16px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>
                  {selectedPhoto.title || 'Untitled Photo'}
                </h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: colors.gray[600],
                  fontSize: '0.875rem'
                }}>
                  <span>{formatDate(selectedPhoto.dateTaken)}</span>
                  {selectedPhoto.weather && (
                    <span>{selectedPhoto.weather.condition}, {selectedPhoto.weather.temperature}°F</span>
                  )}
                </div>
                
                {/* Tags */}
                {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    marginTop: '8px'
                  }}>
                    {selectedPhoto.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: colors.gray[100],
                          color: colors.gray[700],
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '999px'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photo Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '8px',
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
          }}>
            {photos.map(photo => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  paddingTop: '100%', // 1:1 aspect ratio
                  position: 'relative',
                  border: photo.id === selectedPhoto?.id ? `2px solid ${colors.green[500]}` : '2px solid transparent',
                }}
              >
                <img
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt={photo.title || 'Lawn photo thumbnail'}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                
                {/* Date overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '4px',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  fontSize: '0.7rem',
                  textAlign: 'center'
                }}>
                  {new Date(photo.dateTaken).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginTop: 0 }}>Add New Photo</h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <button
                onClick={handleCameraCapture}
                style={{
                  backgroundColor: colors.green[500],
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
                Take Photo with Camera
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundColor: 'white',
                  color: colors.gray[700],
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: '4px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Upload from Device
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
              
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  backgroundColor: 'white',
                  color: colors.gray[700],
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: '4px',
                  padding: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;