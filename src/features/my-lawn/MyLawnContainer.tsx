import React, { useState, useEffect } from 'react';
import PageLayout from '../../components/PageLayout';
import LawnProfile from './components/LawnProfile';
import LawnZoneManager from './components/LawnZoneManager';
import ZonePhotoGallery from './components/ZonePhotoGallery';
import ZoneMetricsTracker from './components/ZoneMetricsTracker';
import { getLawnZones } from '../../lib/lawnService';
import type { LawnZone } from '../../types/lawn';
import './MyLawnContainer.css';

/**
 * MyLawnContainer is the main component for the My Lawn section
 * It includes zone-based lawn management functionality
 */
const MyLawnContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [zones, setZones] = useState<LawnZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load zones on component mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        setIsLoading(true);
        const data = await getLawnZones();
        setZones(data);
        
        // Select the first zone by default if available
        if (data.length > 0 && !selectedZoneId) {
          setSelectedZoneId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching lawn zones:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchZones();
  }, []);
  
  // Handle zone selection change
  const handleZoneChange = (zoneId: string) => {
    setSelectedZoneId(zoneId);
  };
  
  // Get selected zone name for display
  const getSelectedZoneName = (): string => {
    const zone = zones.find(z => z.id === selectedZoneId);
    return zone ? zone.name : '';
  };
  
  // Main render
  return (
    <PageLayout title="My Lawn">
      <div className="my-lawn-container">
        {/* Top section - Lawn Profile */}
        <div className="lawn-section">
          <LawnProfile />
        </div>
        
        {/* Lawn Zone Manager */}
        <div className="lawn-section">
          <h2 className="section-heading">Lawn Zones</h2>
          <LawnZoneManager />
        </div>
        
        {/* Zone Details Tabs - only shown when a zone is selected */}
        {zones.length > 0 && (
          <div className="zone-details-container">
            <div className="zone-details-header">
              <h2 className="section-heading">Zone Details</h2>
              <div style={{ 
                display: 'flex', 
                overflowX: 'auto',
                gap: '8px',
                marginTop: '12px'
              }}>
                {zones.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => handleZoneChange(zone.id)}
                    style={{
                      backgroundColor: selectedZoneId === zone.id ? '#4a9937' : 'white',
                      color: selectedZoneId === zone.id ? 'white' : '#636363',
                      border: `1px solid ${selectedZoneId === zone.id ? '#4a9937' : '#d0d0d0'}`,
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
            
            {/* Custom tabs implementation */}
            <div style={{ borderBottom: '1px solid #E2E8F0', padding: '0 16px' }}>
              <div style={{ display: 'flex' }}>
                <button
                  onClick={() => setActiveTab(0)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: activeTab === 0 ? '2px solid #4a9937' : '2px solid transparent',
                    backgroundColor: 'transparent',
                    color: activeTab === 0 ? '#4a9937' : '#636363',
                    fontWeight: activeTab === 0 ? 600 : 400,
                    cursor: 'pointer',
                    border: 'none',
                    marginRight: '8px'
                  }}
                >
                  Photos
                </button>
                <button
                  onClick={() => setActiveTab(1)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: activeTab === 1 ? '2px solid #4a9937' : '2px solid transparent',
                    backgroundColor: 'transparent',
                    color: activeTab === 1 ? '#4a9937' : '#636363',
                    fontWeight: activeTab === 1 ? 600 : 400,
                    cursor: 'pointer',
                    border: 'none',
                    marginRight: '8px'
                  }}
                >
                  Metrics
                </button>
                <button
                  onClick={() => setActiveTab(2)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: activeTab === 2 ? '2px solid #4a9937' : '2px solid transparent',
                    backgroundColor: 'transparent',
                    color: activeTab === 2 ? '#4a9937' : '#636363',
                    fontWeight: activeTab === 2 ? 600 : 400,
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  Tasks
                </button>
              </div>
            </div>
            
            {/* Tab content */}
            <div style={{ padding: '16px' }}>
              {activeTab === 0 && (
                <ZonePhotoGallery
                  zoneId={selectedZoneId || undefined}
                  zoneName={getSelectedZoneName()}
                />
              )}
              
              {activeTab === 1 && (
                <ZoneMetricsTracker
                  zoneId={selectedZoneId || undefined}
                />
              )}
              
              {activeTab === 2 && (
                <div className="empty-tab-content">
                  <p>Zone-specific tasks will be integrated here.</p>
                  <p>Tasks can be assigned to specific zones or multiple zones.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Empty state when no zones exist */}
        {zones.length === 0 && !isLoading && (
          <div className="empty-state">
            <p>
              No lawn zones created yet. Create your first zone to start managing your lawn by zone.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MyLawnContainer;