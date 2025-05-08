import React, { useState, useEffect } from 'react';
import { offlineService } from '../../../lib/offlineService';
import { 
  ConflictResolutionStrategy, 
  EntityType 
} from '../../../types/offline';
import type { OfflineSettings } from '../../../types/offline';

interface OfflineSettingsViewProps {
  onSave?: () => void;
}

/**
 * Offline Settings View Component
 * Allows users to configure offline functionality settings
 */
const OfflineSettingsView: React.FC<OfflineSettingsViewProps> = ({ onSave }) => {
  const [settings, setSettings] = useState<OfflineSettings>(offlineService.getSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [pendingOperations, setPendingOperations] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const count = await offlineService.getPendingOperationCount();
      setPendingOperations(count);
      setLastSyncTime(offlineService.getSettings().lastSyncTimestamp);
    };

    loadData();

    // Set up event listeners for sync events
    const handleSyncCompleted = () => {
      loadData();
    };

    const handleOperationQueued = () => {
      loadData();
    };

    const handleSettingsUpdated = (event: any) => {
      setSettings(event.settings);
    };

    offlineService.addEventListener('syncCompleted', handleSyncCompleted);
    offlineService.addEventListener('operationQueued', handleOperationQueued);
    offlineService.addEventListener('settingsUpdated', handleSettingsUpdated);

    return () => {
      offlineService.removeEventListener('syncCompleted', handleSyncCompleted);
      offlineService.removeEventListener('operationQueued', handleOperationQueued);
      offlineService.removeEventListener('settingsUpdated', handleSettingsUpdated);
    };
  }, []);

  // Toggle enabled state
  const handleToggleEnabled = () => {
    setSettings((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };

  // Toggle sync on connect
  const handleToggleSyncOnConnect = () => {
    setSettings((prev) => ({
      ...prev,
      syncOnConnect: !prev.syncOnConnect,
    }));
  };

  // Toggle auto sync
  const handleToggleAutoSync = () => {
    setSettings((prev) => ({
      ...prev,
      autoSync: !prev.autoSync,
    }));
  };

  // Change conflict resolution strategy
  const handleChangeConflictStrategy = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSettings((prev) => ({
      ...prev,
      conflictStrategy: e.target.value as ConflictResolutionStrategy,
    }));
  };

  // Change sync interval
  const handleChangeSyncInterval = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev) => ({
      ...prev,
      syncInterval: parseInt(e.target.value, 10),
    }));
  };

  // Toggle priority entity
  const handleTogglePriorityEntity = (entity: EntityType) => {
    setSettings((prev) => {
      const newPriorities = [...prev.prioritySyncEntities];
      const index = newPriorities.indexOf(entity);

      if (index >= 0) {
        newPriorities.splice(index, 1);
      } else {
        newPriorities.push(entity);
      }

      return {
        ...prev,
        prioritySyncEntities: newPriorities,
      };
    });
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await offlineService.updateSettings(settings);
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving offline settings:', error);
      // TODO: Show error message
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger sync
  const handleSyncNow = () => {
    if (offlineService.getConnectionStatus() === 'online' && pendingOperations > 0) {
      offlineService.syncPendingOperations();
    }
  };

  // Clear all offline data
  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      try {
        await offlineService.clearAllData();
        await loadData();
      } catch (error) {
        console.error('Error clearing offline data:', error);
        // TODO: Show error message
      }
    }
  };

  // Helper to reload data
  const loadData = async () => {
    const count = await offlineService.getPendingOperationCount();
    setPendingOperations(count);
    setLastSyncTime(offlineService.getSettings().lastSyncTimestamp);
  };

  const formatSyncInterval = (ms: number): string => {
    const minutes = ms / (60 * 1000);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = minutes / 60;
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  const formatEntityName = (entity: EntityType): string => {
    return entity
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Offline Settings</h2>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Sync Status</h3>

        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#F7FAFC', 
          borderRadius: '0.375rem',
          marginBottom: '1rem' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div>Connection Status:</div>
            <div style={{ 
              fontWeight: 'bold',
              color: offlineService.getConnectionStatus() === 'online' ? '#38A169' : '#E53E3E' 
            }}>
              {offlineService.getConnectionStatus() === 'online' ? 'Online' : 'Offline'}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div>Pending Operations:</div>
            <div>{pendingOperations}</div>
          </div>

          {lastSyncTime && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>Last Synced:</div>
              <div>{new Date(lastSyncTime).toLocaleString()}</div>
            </div>
          )}
        </div>

        <button
          onClick={handleSyncNow}
          disabled={offlineService.getConnectionStatus() !== 'online' || pendingOperations === 0}
          style={{
            backgroundColor: '#3182CE',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            cursor: offlineService.getConnectionStatus() !== 'online' || pendingOperations === 0 
              ? 'not-allowed' 
              : 'pointer',
            opacity: offlineService.getConnectionStatus() !== 'online' || pendingOperations === 0 
              ? 0.5 
              : 1,
            marginRight: '1rem'
          }}
        >
          Sync Now
        </button>

        <button
          onClick={handleClearData}
          style={{
            backgroundColor: '#E53E3E',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Clear Offline Data
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>General Settings</h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={handleToggleEnabled}
              style={{ marginRight: '0.5rem' }}
            />
            Enable Offline Mode
          </label>
          <p style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.25rem' }}>
            When enabled, the app will store data locally and sync when online
          </p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={settings.syncOnConnect}
              onChange={handleToggleSyncOnConnect}
              disabled={!settings.enabled}
              style={{ marginRight: '0.5rem' }}
            />
            Automatically sync when connection is restored
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={settings.autoSync}
              onChange={handleToggleAutoSync}
              disabled={!settings.enabled}
              style={{ marginRight: '0.5rem' }}
            />
            Periodically sync in background
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Background sync interval:
          </label>
          <select
            value={settings.syncInterval}
            onChange={handleChangeSyncInterval}
            disabled={!settings.enabled || !settings.autoSync}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '0.25rem', 
              border: '1px solid #CBD5E0',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            <option value={60000}>1 minute</option>
            <option value={300000}>5 minutes</option>
            <option value={900000}>15 minutes</option>
            <option value={1800000}>30 minutes</option>
            <option value={3600000}>1 hour</option>
            <option value={7200000}>2 hours</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Conflict resolution strategy:
          </label>
          <select
            value={settings.conflictStrategy}
            onChange={handleChangeConflictStrategy}
            disabled={!settings.enabled}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '0.25rem', 
              border: '1px solid #CBD5E0',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            <option value={ConflictResolutionStrategy.SERVER_WINS}>
              Server Wins (Server data takes precedence)
            </option>
            <option value={ConflictResolutionStrategy.CLIENT_WINS}>
              Client Wins (Local data takes precedence)
            </option>
            <option value={ConflictResolutionStrategy.NEWEST_WINS}>
              Newest Wins (Most recently modified wins)
            </option>
            <option value={ConflictResolutionStrategy.MANUAL}>
              Manual Resolution (Ask me each time)
            </option>
          </select>
          <p style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.25rem' }}>
            Determines how to resolve conflicts when the same data is modified both locally and on the server
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Priority Sync Entities</h3>
        <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1rem' }}>
          Select which data types should be synced first when connection is restored
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {Object.values(EntityType).map((entity) => (
            <label 
              key={entity}
              style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '0.5rem',
                backgroundColor: settings.prioritySyncEntities.includes(entity) 
                  ? '#EBF8FF' 
                  : 'transparent',
                borderRadius: '0.25rem',
                border: '1px solid #CBD5E0'
              }}
            >
              <input
                type="checkbox"
                checked={settings.prioritySyncEntities.includes(entity)}
                onChange={() => handleTogglePriorityEntity(entity)}
                disabled={!settings.enabled}
                style={{ marginRight: '0.5rem' }}
              />
              {formatEntityName(entity)}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            backgroundColor: '#38A169',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.5 : 1
          }}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default OfflineSettingsView;