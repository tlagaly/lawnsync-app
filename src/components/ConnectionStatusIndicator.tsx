import React, { useEffect, useState } from 'react';
import { offlineService } from '../lib/offlineService';
import { ConnectionStatus, SyncStatus } from '../types/offline';

interface ConnectionStatusIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showMenu?: boolean;
}

/**
 * Connection status indicator that displays the current
 * online/offline status and provides sync controls
 */
const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  size = 'md',
  showLabel = true,
  showMenu = true,
}) => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.ONLINE);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Size configurations
  const sizeConfig = {
    sm: {
      iconSize: '14px',
      textSize: '12px',
      badgeSize: '8px',
    },
    md: {
      iconSize: '18px',
      textSize: '14px',
      badgeSize: '10px',
    },
    lg: {
      iconSize: '22px',
      textSize: '16px',
      badgeSize: '12px',
    },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    // Initial status
    setStatus(offlineService.getConnectionStatus());
    updatePendingCount();
    updateLastSyncTime();

    // Set up event listeners
    const handleConnectionChange = (event: any) => {
      setStatus(event.status);
    };

    const handleSyncStarted = () => {
      setIsSyncing(true);
    };

    const handleSyncCompleted = () => {
      setIsSyncing(false);
      updateLastSyncTime();
      updatePendingCount();
    };

    const handleSyncFailed = () => {
      setIsSyncing(false);
    };

    const handleOperationQueued = () => {
      updatePendingCount();
    };

    offlineService.addEventListener('connectionChange', handleConnectionChange);
    offlineService.addEventListener('syncStarted', handleSyncStarted);
    offlineService.addEventListener('syncCompleted', handleSyncCompleted);
    offlineService.addEventListener('syncFailed', handleSyncFailed);
    offlineService.addEventListener('operationQueued', handleOperationQueued);

    // Clean up
    return () => {
      offlineService.removeEventListener('connectionChange', handleConnectionChange);
      offlineService.removeEventListener('syncStarted', handleSyncStarted);
      offlineService.removeEventListener('syncCompleted', handleSyncCompleted);
      offlineService.removeEventListener('syncFailed', handleSyncFailed);
      offlineService.removeEventListener('operationQueued', handleOperationQueued);
    };
  }, []);

  // Update pending operation count
  const updatePendingCount = async () => {
    const count = await offlineService.getPendingOperationCount();
    setPendingCount(count);
  };

  // Update last sync time
  const updateLastSyncTime = () => {
    const settings = offlineService.getSettings();
    setLastSyncTime(settings.lastSyncTimestamp);
  };

  // Sync pending operations
  const handleSyncNow = () => {
    if (status === ConnectionStatus.ONLINE && !isSyncing && pendingCount > 0) {
      offlineService.syncPendingOperations();
    }
    setIsMenuOpen(false);
  };

  // Toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case ConnectionStatus.ONLINE:
        return '#38A169'; // green
      case ConnectionStatus.OFFLINE:
        return '#E53E3E'; // red
      case ConnectionStatus.RECONNECTING:
        return '#ECC94B'; // yellow
      default:
        return '#38A169'; // green
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case ConnectionStatus.ONLINE:
        return 'Online';
      case ConnectionStatus.OFFLINE:
        return 'Offline';
      case ConnectionStatus.RECONNECTING:
        return 'Reconnecting';
      default:
        return 'Online';
    }
  };

  // Render status icon
  const renderStatusIcon = () => {
    const color = getStatusColor();
    return (
      <div 
        style={{ 
          position: 'relative',
          width: config.iconSize,
          height: config.iconSize,
        }}
      >
        <div 
          style={{ 
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
        
        {pendingCount > 0 && (
          <div 
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: config.badgeSize,
              height: config.badgeSize,
              borderRadius: '50%',
              backgroundColor: '#E53E3E',
              border: '1px solid white',
            }}
          />
        )}
        
        {isSyncing && (
          <div 
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `2px solid ${color}`,
              borderTopColor: 'transparent',
              animation: 'spin 1.5s linear infinite',
            }}
          />
        )}
      </div>
    );
  };

  // Render menu
  const renderMenu = () => {
    if (!isMenuOpen || !showMenu) return null;
    
    return (
      <div 
        style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '4px',
          width: '220px',
          backgroundColor: 'white',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          style={{
            padding: '12px',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <div style={{ fontWeight: 'bold' }}>Connection: {getStatusText()}</div>
          {lastSyncTime && (
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Last synced: {new Date(lastSyncTime).toLocaleString()}
            </div>
          )}
        </div>
        
        <div 
          style={{
            padding: '8px 12px',
            cursor: status !== ConnectionStatus.ONLINE || isSyncing || pendingCount === 0 
              ? 'default' 
              : 'pointer',
            opacity: status !== ConnectionStatus.ONLINE || isSyncing || pendingCount === 0 
              ? 0.5 
              : 1,
            borderBottom: '1px solid #E2E8F0',
          }}
          onClick={handleSyncNow}
        >
          Sync Now ({pendingCount} pending)
        </div>
        
        <div 
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
          }}
          onClick={() => {
            setIsMenuOpen(false);
            // TODO: Navigate to offline settings
          }}
        >
          Offline Settings
        </div>
      </div>
    );
  };

  return (
    <div 
      style={{ 
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: showMenu ? 'pointer' : 'default',
          padding: '4px',
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (showMenu) toggleMenu();
        }}
        title={`${getStatusText()}${pendingCount > 0 ? ` • ${pendingCount} pending changes` : ''}`}
      >
        {renderStatusIcon()}
        
        {showLabel && (
          <span
            style={{
              fontSize: config.textSize,
              fontWeight: 500,
              color: getStatusColor(),
            }}
          >
            {getStatusText()}
          </span>
        )}
      </div>
      
      {renderMenu()}
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ConnectionStatusIndicator;