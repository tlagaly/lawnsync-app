import React, { useState, useEffect } from 'react'
import colors from '../../../theme/foundations/colors'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

interface LocationScreenProps {
  onLocationSelected: (location: string) => void
}

// Component to handle map updates when a new location is selected
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, 13)
  }, [center, map])
  
  return null
}

/**
 * Location selection screen for the onboarding flow
 * Implements location input with search functionality and Leaflet.js map integration
 */
const LocationScreen: React.FC<LocationScreenProps> = ({ onLocationSelected }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState('')
  // Default coordinates (San Francisco)
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194])
  // Geocode data is defined but not used yet - will be used in future API integration
  const [_geocodeData, setGeocodeData] = useState<{
    display_name: string;
    lat: number;
    lon: number;
  } | null>(null)

  // Mock geocoding function - would be replaced with actual geocoding API
  const geocodeAddress = (address: string) => {
    // Simulate geocoding with random coordinates around the San Francisco area
    const lat = 37.7749 + (Math.random() - 0.5) * 0.05
    const lon = -122.4194 + (Math.random() - 0.5) * 0.05
    
    return {
      display_name: address,
      lat,
      lon
    }
  }

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    
    // Simulate API call
    setTimeout(() => {
      // Mock results based on query
      const results = [
        `${searchQuery}, Main Street`,
        `${searchQuery}, Oak Avenue`,
        `${searchQuery}, Park Road`,
      ]
      
      setSearchResults(results)
      setIsSearching(false)
    }, 800)
  }

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location)
    setSearchQuery(location)
    setSearchResults([])
    onLocationSelected(location)
    
    // Geocode the selected location to get coordinates for the map
    const geocodeResult = geocodeAddress(location)
    setGeocodeData(geocodeResult)
    setMapCenter([geocodeResult.lat, geocodeResult.lon])
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Location icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            height: '60px',
            width: '60px',
            borderRadius: '50%',
            backgroundColor: colors.green[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg 
              viewBox="0 0 24 24" 
              width="30px" 
              height="30px" 
              style={{ color: colors.green[600] }}
            >
              <path
                fill="currentColor"
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              />
            </svg>
          </div>
        </div>

        {/* Explanation text */}
        <p style={{
          textAlign: 'center',
          color: colors.gray[600],
          fontSize: '1rem',
          marginBottom: '0.5rem',
          margin: 0
        }}>
          We'll use your location to provide weather-specific lawn care recommendations
          that adapt to your local climate and conditions.
        </p>

        {/* Search input */}
        <div>
          <label 
            htmlFor="location" 
            style={{
              fontWeight: 500,
              display: 'block',
              marginBottom: '0.5rem'
            }}
          >
            Enter your address or zip code
          </label>
          <div style={{ display: 'flex' }}>
            <input
              id="location"
              type="text"
              placeholder="e.g. 10001 or 123 Main St"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: `1px solid ${colors.gray[300]}`,
                flex: 1,
                fontSize: '1rem',
                marginRight: '0.5rem'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              style={{
                backgroundColor: colors.green[400],
                color: 'white',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div style={{
            marginTop: '0.5rem',
            border: `1px solid ${colors.gray[300]}`,
            borderRadius: '0.375rem',
            padding: '0.5rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {searchResults.map((result, index) => (
                <div 
                  key={index} 
                  style={{
                    borderBottom: index < searchResults.length - 1 ? `1px solid ${colors.gray[200]}` : 'none',
                    paddingBottom: index < searchResults.length - 1 ? '0.5rem' : 0,
                    marginBottom: index < searchResults.length - 1 ? '0.5rem' : 0
                  }}
                >
                  <button
                    onClick={() => handleLocationSelect(result)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      borderRadius: '0.25rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      width="20px" 
                      height="20px" 
                      style={{ 
                        color: colors.gray[500],
                        marginRight: '0.5rem'
                      }}
                    >
                      <path
                        fill="currentColor" 
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                      />
                    </svg>
                    <span>{result}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map integration with Leaflet.js */}
        {selectedLocation && (
          <div style={{
            marginTop: '1rem',
            height: '200px',
            borderRadius: '0.375rem',
            overflow: 'hidden',
            border: `1px solid ${colors.gray[300]}`
          }}>
            <MapContainer 
              center={mapCenter} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              attributionControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={mapCenter} />
              <MapUpdater center={mapCenter} />
            </MapContainer>
          </div>
        )}

        {/* Location privacy note */}
        <p style={{
          fontSize: '0.875rem',
          color: colors.gray[500],
          marginTop: '0.5rem',
          textAlign: 'center'
        }}>
          Your location is only used to provide accurate recommendations and is never shared.
        </p>
      </div>
    </div>
  )
}

export default LocationScreen