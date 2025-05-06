import React, { useState, useRef } from 'react';
import colors from '../../../theme/foundations/colors';
import { identifyPlant, getIdentificationWeatherContext } from '../../../lib/plantIdentificationService';
import type { PlantIdentificationResult } from '../../../types/plantIdentification';
import PlantIdentificationCard from './PlantIdentificationCard';

interface PlantIdentificationViewProps {
  userId: string;
  onIdentificationComplete?: (result: PlantIdentificationResult) => void;
  location?: string;
}

/**
 * Component for capturing and uploading images for plant identification
 */
const PlantIdentificationView: React.FC<PlantIdentificationViewProps> = ({
  userId,
  onIdentificationComplete,
  location = 'Unknown location'
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [identificationResult, setIdentificationResult] = useState<PlantIdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Start camera stream
  const startCamera = async () => {
    setIsCapturing(true);
    setUploadedImage(null);
    setIdentificationResult(null);
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions or use file upload instead.');
      setIsCapturing(false);
    }
  };
  
  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsCapturing(false);
  };
  
  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 data URL
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setUploadedImage(imageData);
        
        // Stop camera after capture
        stopCamera();
      }
    }
  };
  
  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image too large. Please select an image under 10MB.');
        return;
      }
      
      setIsUploading(true);
      setError(null);
      
      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setUploadedImage(e.target.result);
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading file. Please try again.');
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Process the image for identification
  const processImage = async () => {
    if (!uploadedImage) {
      setError('No image available. Please capture or upload an image first.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Get weather context for the identification
      const weatherContext = await getIdentificationWeatherContext(location);
      
      // Extract base64 data (remove data:image/jpeg;base64, prefix)
      const base64Data = uploadedImage.split(',')[1];
      
      // Call the identification service
      const result = await identifyPlant({
        userId,
        imageData: base64Data,
        dateTaken: new Date().toISOString(),
        additionalContext: {
          weatherConditions: weatherContext || undefined
        }
      });
      
      setIdentificationResult(result);
      
      // Notify parent component if callback provided
      if (onIdentificationComplete) {
        onIdentificationComplete(result);
      }
    } catch (err) {
      console.error('Error identifying plant:', err);
      setError('Could not identify plant. Please try again or use a clearer image.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Reset the process
  const resetProcess = () => {
    setUploadedImage(null);
    setIdentificationResult(null);
    setError(null);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Render the appropriate view based on state
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)',
      overflow: 'hidden',
      marginBottom: '1rem'
    }}>
      {/* Card Header */}
      <div style={{ 
        display: 'flex',
        padding: '1rem',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderBottomColor: colors.gray[100]
      }}>
        <h3 style={{ 
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.gray[800],
          display: 'flex',
          alignItems: 'center',
          margin: 0
        }}>
          <span style={{ 
            display: 'inline-flex', 
            marginRight: '0.5rem', 
            color: colors.green[500], 
            width: '20px', 
            height: '20px' 
          }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22q-2.05 0-3.9-.788-1.85-.787-3.175-2.137-1.325-1.35-2.1-3.175Q2 14.075 2 12t.825-3.9q.825-1.85 2.125-3.175Q6.25 3.575 8.1 2.787 9.95 2 12 2t3.9.787q1.85.788 3.175 2.138 1.325 1.35 2.1 3.175Q22 9.925 22 12t-.825 3.9q-.825 1.85-2.125 3.175Q17.75 20.425 15.9 21.213 14.05 22 12 22zm0-2q3.35 0 5.675-2.35Q20 15.3 20 12q0-3.35-2.325-5.675Q15.35 4 12 4 8.65 4 6.325 6.325 4 8.65 4 12q0 3.35 2.325 5.65Q8.65 20 12 20z" />
            </svg>
          </span>
          Plant Identification
        </h3>
      </div>
      
      {/* Main Content */}
      <div style={{ padding: '1rem' }}>
        {/* Camera View */}
        {isCapturing && (
          <div style={{ marginBottom: '1rem' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={{
                width: '100%',
                maxHeight: '70vh',
                borderRadius: '0.5rem',
                backgroundColor: colors.gray[800]
              }}
            />
            
            <button
              onClick={capturePhoto}
              style={{
                display: 'block',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: colors.green[500],
                color: 'white',
                border: 'none',
                margin: '1rem auto',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M12 14.4q1 0 1.7-.7.7-.7.7-1.7 0-1-.7-1.7-.7-.7-1.7-.7-1 0-1.7.7-.7.7-.7 1.7 0 1 .7 1.7.7.7 1.7.7zM12 9q1.25 0 2.125.875T15 12q0 1.25-.875 2.125T12 15q-1.25 0-2.125-.875T9 12q0-1.25.875-2.125T12 9zm-8 9h16V8h-4.05l-1.83-2H9.88L8.05 8H4v10zm8 4q-2.075 0-3.9-.788-1.825-.787-3.175-2.137-1.35-1.35-2.137-3.175Q2 14.075 2 12t.788-3.9q.787-1.825 2.137-3.175 1.35-1.35 3.175-2.138Q9.925 2 12 2t3.9.787q1.825.788 3.175 2.138 1.35 1.35 2.137 3.175Q22 9.925 22 12t-.788 3.9q-.787 1.825-2.137 3.175-1.35 1.35-3.175 2.137Q14.075 22 12 22z" />
              </svg>
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={stopCamera}
                style={{
                  backgroundColor: 'transparent',
                  color: colors.gray[600],
                  border: 'none',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Hidden canvas for capturing photos */}
        <canvas 
          ref={canvasRef} 
          style={{ display: 'none' }} 
        />
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {/* Uploaded Image Preview */}
        {uploadedImage && !identificationResult && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <img 
              src={uploadedImage} 
              alt="Plant to identify"
              style={{
                maxWidth: '100%',
                maxHeight: '60vh',
                borderRadius: '0.5rem'
              }}
            />
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '1rem'
            }}>
              <button
                onClick={resetProcess}
                style={{
                  backgroundColor: colors.gray[100],
                  color: colors.gray[700],
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Start Over
              </button>
              
              <button
                onClick={processImage}
                disabled={isProcessing}
                style={{
                  backgroundColor: colors.green[500],
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.5rem 1rem',
                  cursor: isProcessing ? 'default' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  opacity: isProcessing ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {isProcessing ? (
                  <>
                    <span style={{ 
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.2)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      marginRight: '0.5rem',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Identifying...
                  </>
                ) : (
                  'Identify Plant'
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Identification Result */}
        {identificationResult && (
          <div style={{ marginBottom: '1rem' }}>
            <PlantIdentificationCard 
              identification={identificationResult} 
            />
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                onClick={resetProcess}
                style={{
                  backgroundColor: colors.gray[100],
                  color: colors.gray[700],
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Identify Another Plant
              </button>
            </div>
          </div>
        )}
        
        {/* Initial State / Instructions */}
        {!isCapturing && !uploadedImage && !identificationResult && (
          <div>
            <p style={{ 
              textAlign: 'center',
              color: colors.gray[600],
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              lineHeight: 1.5
            }}>
              Take a clear photo of a plant or weed in your lawn to identify it 
              and get specific care recommendations.
            </p>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <button
                onClick={startCamera}
                style={{
                  flex: 1,
                  backgroundColor: colors.green[50],
                  color: colors.green[700],
                  border: '1px solid',
                  borderColor: colors.green[100],
                  borderRadius: '0.25rem',
                  padding: '1rem',
                  marginRight: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '120px'
                }}
              >
                <span style={{ 
                  display: 'flex',
                  backgroundColor: 'white',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <svg viewBox="0 0 24 24" fill={colors.green[500]} width="24" height="24">
                    <path d="M12 15q1.25 0 2.125-.875T15 12q0-1.25-.875-2.125T12 9q-1.25 0-2.125.875T9 12q0 1.25.875 2.125T12 15zm0-1.5q-.625 0-1.062-.438Q10.5 12.625 10.5 12t.438-1.062Q11.375 10.5 12 10.5t1.062.438q.438.437.438 1.062t-.438 1.062q-.437.438-1.062.438zM4 21q-.825 0-1.412-.587Q2 19.825 2 19V7q0-.825.588-1.412Q3.175 5 4 5h3.15L9 3h6l1.85 2H20q.825 0 1.413.588Q22 6.175 22 7v12q0 .825-.587 1.413Q20.825 21 20 21z" />
                  </svg>
                </span>
                Take Photo
              </button>
              
              <button
                onClick={triggerFileUpload}
                style={{
                  flex: 1,
                  backgroundColor: colors.blue[50],
                  color: colors.blue[700],
                  border: '1px solid',
                  borderColor: colors.blue[100],
                  borderRadius: '0.25rem',
                  padding: '1rem',
                  marginLeft: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '120px'
                }}
              >
                <span style={{ 
                  display: 'flex',
                  backgroundColor: 'white',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <svg viewBox="0 0 24 24" fill={colors.blue[500]} width="24" height="24">
                    <path d="M11 16V7.85l-2.6 2.6L7 9l5-5 5 5-1.4 1.45-2.6-2.6V16zm-5 4q-.825 0-1.412-.587Q4 18.825 4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413Q18.825 20 18 20z" />
                  </svg>
                </span>
                Upload Photo
              </button>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div style={{
            backgroundColor: colors.status.error + '19', // Add transparency
            color: colors.status.error,
            padding: '0.75rem 1rem',
            borderRadius: '0.25rem',
            marginTop: '1rem',
            fontSize: '0.875rem'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ 
                display: 'inline-flex',
                marginRight: '0.5rem',
                width: '16px',
                height: '16px'
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17q.425 0 .713-.288Q13 16.425 13 16t-.287-.712Q12.425 15 12 15t-.712.288Q11 15.575 11 16t.288.712Q11.575 17 12 17zm0-4q.425 0 .713-.288Q13 12.425 13 12V8q0-.425-.287-.713Q12.425 7 12 7t-.712.287Q11 7.575 11 8v4q0 .425.288.712.287.288.712.288zm0 9q-2.075 0-3.9-.788-1.825-.787-3.175-2.137-1.35-1.35-2.137-3.175Q2 14.075 2 12t.788-3.9q.787-1.825 2.137-3.175 1.35-1.35 3.175-2.138Q9.925 2 12 2t3.9.787q1.825.788 3.175 2.138 1.35 1.35 2.137 3.175Q22 9.925 22 12t-.788 3.9q-.787 1.825-2.137 3.175-1.35 1.35-3.175 2.137Q14.075 22 12 22z" />
                </svg>
              </span>
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantIdentificationView;