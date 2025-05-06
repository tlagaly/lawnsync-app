import React, { useState, useEffect, useRef } from 'react';
import { getPhotos, getPhotoById, createPhotoComparison, getPhotoComparisons, getComparisonById, exportComparison } from '../../../lib/galleryService';
import type { LawnPhoto, PhotoComparison } from '../../../types/gallery';
import colors from '../../../theme/foundations/colors';

/**
 * PhotoCompare component for comparing before/after lawn photos
 * Features a slider view and the ability to highlight improvement areas
 */
const PhotoCompare: React.FC = () => {
  const [photos, setPhotos] = useState<LawnPhoto[]>([]);
  const [comparisons, setComparisons] = useState<PhotoComparison[]>([]);
  const [beforePhoto, setBeforePhoto] = useState<LawnPhoto | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<LawnPhoto | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [comparisonTitle, setComparisonTitle] = useState('');
  const [comparisonDescription, setComparisonDescription] = useState('');
  const [selectedComparison, setSelectedComparison] = useState<PhotoComparison | null>(null);
  const [isAddingHighlight, setIsAddingHighlight] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({ x: 50, y: 50, radius: 15 });
  const [highlightDescription, setHighlightDescription] = useState('');
  const [isCreatingComparison, setIsCreatingComparison] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Load photos and saved comparisons on component mount
  useEffect(() => {
    fetchPhotos();
    fetchComparisons();
  }, []);

  // Fetch all photos sorted by date (newest first)
  const fetchPhotos = async () => {
    try {
      setIsLoadingPhotos(true);
      const fetchedPhotos = await getPhotos({ sortBy: 'oldest' });
      setPhotos(fetchedPhotos);
      
      // Set initial before photo if there are photos available
      if (fetchedPhotos.length > 0 && !beforePhoto) {
        setBeforePhoto(fetchedPhotos[0]);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  // Fetch all saved comparisons
  const fetchComparisons = async () => {
    try {
      setIsLoadingSaved(true);
      const fetchedComparisons = await getPhotoComparisons();
      setComparisons(fetchedComparisons);
    } catch (error) {
      console.error('Error fetching comparisons:', error);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  // Handle slider position change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  // Handle mouse move for slider (for finer control on desktop)
  const handleSliderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return; // Only proceed if primary button is pressed
    
    const container = imageContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Calculate percentage position
    const newPosition = Math.max(0, Math.min(100, (x / width) * 100));
    setSliderPosition(newPosition);
  };

  // Handle touch move for slider (mobile)
  const handleSliderTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = imageContainerRef.current;
    if (!container) return;
    
    const touch = e.touches[0];
    const rect = container.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const width = rect.width;
    
    // Calculate percentage position
    const newPosition = Math.max(0, Math.min(100, (x / width) * 100));
    setSliderPosition(newPosition);
  };

  // Handle click on image to add highlight
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingHighlight || !imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setHighlightPosition({ ...highlightPosition, x, y });
  };

  // Save the current comparison
  const handleSaveComparison = async () => {
    if (!beforePhoto || !afterPhoto) {
      alert('Please select both before and after photos');
      return;
    }
    
    if (!comparisonTitle.trim()) {
      alert('Please provide a title for this comparison');
      return;
    }
    
    try {
      setIsCreatingComparison(true);
      
      // Prepare highlight data if available
      const highlightData = isAddingHighlight && highlightDescription.trim() 
        ? { 
            x: highlightPosition.x, 
            y: highlightPosition.y, 
            radius: highlightPosition.radius, 
            description: highlightDescription 
          } 
        : undefined;
      
      // Create the comparison
      const newComparison = await createPhotoComparison(
        beforePhoto.id,
        afterPhoto.id,
        {
          title: comparisonTitle,
          description: comparisonDescription || undefined,
          highlight: highlightData
        }
      );
      
      // Update local state
      setComparisons(prev => [newComparison, ...prev]);
      setSelectedComparison(newComparison);
      
      // Reset form
      setComparisonTitle('');
      setComparisonDescription('');
      setIsAddingHighlight(false);
      setHighlightDescription('');
      setIsCreatingComparison(false);
    } catch (error) {
      console.error('Error creating comparison:', error);
      setIsCreatingComparison(false);
      alert('Failed to save comparison. Please try again.');
    }
  };

  // Load a saved comparison
  const handleLoadComparison = async (comparison: PhotoComparison) => {
    try {
      setSelectedComparison(comparison);
      
      // Load the before and after photos
      const before = await getPhotoById(comparison.beforePhotoId);
      const after = await getPhotoById(comparison.afterPhotoId);
      
      if (before) setBeforePhoto(before);
      if (after) setAfterPhoto(after);
      
      // Reset slider to middle
      setSliderPosition(50);
      
      // Set highlight information if available
      if (comparison.highlight) {
        setHighlightPosition({
          x: comparison.highlight.x,
          y: comparison.highlight.y,
          radius: comparison.highlight.radius
        });
        setHighlightDescription(comparison.highlight.description);
        setIsAddingHighlight(true);
      } else {
        setIsAddingHighlight(false);
      }
    } catch (error) {
      console.error('Error loading comparison:', error);
    }
  };

  // Export the current comparison
  const handleExportComparison = async () => {
    if (!selectedComparison) return;
    
    try {
      setIsExporting(true);
      const imageUrl = await exportComparison(selectedComparison.id);
      
      if (imageUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `lawn-comparison-${selectedComparison.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting comparison:', error);
      alert('Failed to export comparison. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render loading states
  if (isLoadingPhotos && isLoadingSaved) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "20px",
        textAlign: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        Loading comparison tool...
      </div>
    );
  }

  // Render empty state if no photos available
  if (photos.length < 2) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "32px 20px",
        textAlign: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        <p style={{ fontSize: '1rem', color: colors.gray[600] }}>
          You need at least two photos to use the comparison tool.
        </p>
        <p style={{ fontSize: '1rem', color: colors.gray[600], marginTop: '8px' }}>
          Add more photos in the Gallery tab.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Before & After Comparison</h2>
        {selectedComparison && (
          <button
            onClick={handleExportComparison}
            disabled={isExporting}
            style={{
              backgroundColor: colors.green[500],
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: isExporting ? 'default' : 'pointer',
              opacity: isExporting ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ display: 'inline-flex' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        )}
      </div>

      {/* Comparison Viewer */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        {/* Photo selection */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: `1px solid ${colors.gray[200]}`
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
              Before Photo:
            </label>
            <select
              value={beforePhoto?.id || ''}
              onChange={(e) => {
                const selected = photos.find(p => p.id === e.target.value);
                if (selected) setBeforePhoto(selected);
              }}
              style={{
                width: '95%',
                padding: '8px',
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Select a photo</option>
              {photos.map(photo => (
                <option key={photo.id} value={photo.id}>
                  {(photo.title || 'Photo') + ' - ' + formatDate(photo.dateTaken)}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
              After Photo:
            </label>
            <select
              value={afterPhoto?.id || ''}
              onChange={(e) => {
                const selected = photos.find(p => p.id === e.target.value);
                if (selected) setAfterPhoto(selected);
              }}
              style={{
                width: '95%',
                padding: '8px',
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Select a photo</option>
              {photos.map(photo => (
                <option key={photo.id} value={photo.id}>
                  {(photo.title || 'Photo') + ' - ' + formatDate(photo.dateTaken)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Image comparison slider */}
        {beforePhoto && afterPhoto ? (
          <div style={{ padding: '16px' }}>
            <div
              ref={imageContainerRef}
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '75%', // 4:3 aspect ratio
                overflow: 'hidden',
                touchAction: 'none' // Prevent scroll during touch on mobile
              }}
              onMouseMove={handleSliderMouseMove}
              onTouchMove={handleSliderTouchMove}
              onClick={handleImageClick}
            >
              {/* Before image (right side) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${beforePhoto.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              
              {/* After image (left side with clip) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${afterPhoto.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                }}
              />
              
              {/* Slider handle */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${sliderPosition}%`,
                  width: '4px',
                  backgroundColor: 'white',
                  transform: 'translateX(-50%)',
                  cursor: 'ew-resize',
                  boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)'
                }}
              />
              
              {/* Slider handle knob (for better touch target) */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${sliderPosition}%`,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'ew-resize'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#333" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8L16 16M8 8L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              
              {/* Before/After labels */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}
              >
                After
              </div>
              
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}
              >
                Before
              </div>
              
              {/* Dates */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}
              >
                {formatDate(afterPhoto.dateTaken)}
              </div>
              
              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}
              >
                {formatDate(beforePhoto.dateTaken)}
              </div>
              
              {/* Highlight marker */}
              {isAddingHighlight && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${highlightPosition.x}%`,
                    top: `${highlightPosition.y}%`,
                    width: `${highlightPosition.radius * 2}%`,
                    height: `${highlightPosition.radius * 2}%`,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    border: '2px solid green',
                    backgroundColor: 'rgba(0, 255, 0, 0.2)',
                    cursor: 'pointer'
                  }}
                  title={highlightDescription}
                />
              )}
            </div>
            
            {/* Slider control */}
            <div style={{ margin: '16px 0' }}>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={handleSliderChange}
                style={{
                  width: '100%',
                  cursor: 'pointer'
                }}
              />
            </div>
            
            {/* Comparison details */}
            {selectedComparison ? (
              <div>
                <h3 style={{ fontSize: '1rem', margin: '0 0 8px 0' }}>
                  {selectedComparison.title}
                </h3>
                {selectedComparison.description && (
                  <p style={{ fontSize: '0.875rem', color: colors.gray[600], margin: '8px 0' }}>
                    {selectedComparison.description}
                  </p>
                )}
                <div style={{ fontSize: '0.75rem', color: colors.gray[500] }}>
                  Created: {formatDate(selectedComparison.createdAt)}
                </div>
              </div>
            ) : (
              /* New comparison form */
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                    Comparison Title:
                  </label>
                  <input
                    type="text"
                    value={comparisonTitle}
                    onChange={(e) => setComparisonTitle(e.target.value)}
                    placeholder="e.g., 2 Weeks After Fertilizer Application"
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: `1px solid ${colors.gray[300]}`
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                    Description (optional):
                  </label>
                  <textarea
                    value={comparisonDescription}
                    onChange={(e) => setComparisonDescription(e.target.value)}
                    placeholder="What has changed between these photos?"
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: `1px solid ${colors.gray[300]}`,
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <input
                      type="checkbox"
                      id="add-highlight"
                      checked={isAddingHighlight}
                      onChange={(e) => setIsAddingHighlight(e.target.checked)}
                    />
                    <label htmlFor="add-highlight" style={{ fontSize: '0.875rem' }}>
                      Add highlight to show improvement area
                    </label>
                  </div>
                  
                  {isAddingHighlight && (
                    <>
                      <p style={{ fontSize: '0.75rem', color: colors.gray[600], margin: '4px 0 8px' }}>
                        Click on the image to position the highlight marker
                      </p>
                      
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>
                          Highlight Size:
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="25"
                          value={highlightPosition.radius}
                          onChange={(e) => setHighlightPosition({
                            ...highlightPosition,
                            radius: parseInt(e.target.value)
                          })}
                          style={{ width: '100%' }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>
                          Highlight Description:
                        </label>
                        <input
                          type="text"
                          value={highlightDescription}
                          onChange={(e) => setHighlightDescription(e.target.value)}
                          placeholder="e.g., Notice improved color and thickness"
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: `1px solid ${colors.gray[300]}`
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <button
                  onClick={handleSaveComparison}
                  disabled={isCreatingComparison || !beforePhoto || !afterPhoto || !comparisonTitle.trim() || (isAddingHighlight && !highlightDescription.trim())}
                  style={{
                    backgroundColor: colors.green[500],
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    opacity: (isCreatingComparison || !beforePhoto || !afterPhoto || !comparisonTitle.trim() || (isAddingHighlight && !highlightDescription.trim())) ? 0.7 : 1
                  }}
                >
                  {isCreatingComparison ? 'Saving...' : 'Save Comparison'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            padding: '32px 16px', 
            textAlign: 'center',
            color: colors.gray[600] 
          }}>
            Select before and after photos to compare
          </div>
        )}
      </div>

      {/* Saved comparisons */}
      {comparisons.length > 0 && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
        }}>
          <h3 style={{ fontSize: '1rem', margin: '0 0 12px 0' }}>Saved Comparisons</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '12px'
          }}>
            {comparisons.map(comparison => (
              <div
                key={comparison.id}
                onClick={() => handleLoadComparison(comparison)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: selectedComparison?.id === comparison.id 
                    ? `0 0 0 2px ${colors.green[500]}` 
                    : '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  paddingTop: '75%', // 4:3 aspect ratio
                  position: 'relative',
                  backgroundColor: colors.gray[100]
                }}>
                  {/* This would ideally be a thumbnail of the comparison */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(to right, black, transparent)`
                  }}>
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '50%',
                        height: '100%',
                        backgroundImage: `url(${photos.find(p => p.id === comparison.afterPhotoId)?.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '50%',
                        height: '100%',
                        backgroundImage: `url(${photos.find(p => p.id === comparison.beforePhotoId)?.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        bottom: 0,
                        width: '2px',
                        backgroundColor: 'white',
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ padding: '8px' }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {comparison.title}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: colors.gray[600],
                    marginTop: '4px'
                  }}>
                    {formatDate(comparison.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoCompare;