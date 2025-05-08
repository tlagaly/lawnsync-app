/**
 * LawnSync Offline Service
 * Handles offline data persistence, synchronization, and service worker communication
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ConnectionStatus,
  SyncStatus,
  EntityType,
  ConflictResolutionStrategy,
  DEFAULT_OFFLINE_SETTINGS
} from '../types/offline';
import type {
  OfflineEntity,
  PendingOperation,
  ConflictResolution,
  OfflineSettings,
  SyncEvent
} from '../types/offline';

// IndexedDB database name and version
const DB_NAME = 'LawnSyncOfflineDB';
const DB_VERSION = 1;

// Store names for IndexedDB
const STORES = {
  TASKS: 'tasks',
  RECOMMENDATIONS: 'recommendations',
  WATERING_SCHEDULES: 'watering_schedules',
  PHOTOS: 'photos',
  PLANT_IDENTIFICATIONS: 'plant_identifications',
  NOTIFICATIONS: 'notifications',
  PENDING_OPERATIONS: 'pending_operations',
  SETTINGS: 'settings'
};

// Default options for the offline service
const DEFAULT_OPTIONS = {
  enableSync: true,
  autoSyncOnConnect: true,
  backgroundSync: true,
  logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error', // Type assertion for logLevel
  maxRetries: 3
};

// Service class
class OfflineService {
  private db: IDBDatabase | null = null;
  private connected: boolean = navigator.onLine;
  private connectionStatus: ConnectionStatus = navigator.onLine ? ConnectionStatus.ONLINE : ConnectionStatus.OFFLINE;
  private settings: OfflineSettings = DEFAULT_OFFLINE_SETTINGS;
  private options = DEFAULT_OPTIONS;
  private syncInProgress: boolean = false;
  private eventListeners: Map<string, Set<(event: any) => void>> = new Map();
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  // Create a singleton instance
  private static instance: OfflineService | null = null;

  // Logger levels
  private readonly logLevels: Record<string, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  /**
   * Get the singleton instance of OfflineService
   */
  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Initialize the database
    this.initDatabase();

    // Set up event listeners for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Set up service worker message handling
    this.initServiceWorker();

    // Log initialization
    this.log('info', 'OfflineService initialized');

    // Load settings from IndexedDB
    this.loadSettings();
  }

  /**
   * Initialize the IndexedDB database
   */
  private async initDatabase(): Promise<void> {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.TASKS)) {
          db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.RECOMMENDATIONS)) {
          db.createObjectStore(STORES.RECOMMENDATIONS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.WATERING_SCHEDULES)) {
          db.createObjectStore(STORES.WATERING_SCHEDULES, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.PHOTOS)) {
          db.createObjectStore(STORES.PHOTOS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.PLANT_IDENTIFICATIONS)) {
          db.createObjectStore(STORES.PLANT_IDENTIFICATIONS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.NOTIFICATIONS)) {
          db.createObjectStore(STORES.NOTIFICATIONS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.PENDING_OPERATIONS)) {
          db.createObjectStore(STORES.PENDING_OPERATIONS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
        }

        this.log('info', 'Database schema upgraded to version ' + DB_VERSION);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.log('info', 'IndexedDB connection established');
        
        // Initialize settings if they don't exist
        this.initSettings();
      };

      request.onerror = (event) => {
        this.log('error', 'Error opening IndexedDB:', (event.target as IDBOpenDBRequest).error);
      };
    } catch (error) {
      this.log('error', 'IndexedDB initialization failed:', error);
    }
  }

  /**
   * Initialize the service worker connection
   */
  private async initServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        // Get the active service worker registration
        this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
        
        // Set up message handler for service worker communication
        navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);
        
        this.log('info', 'Service worker connection established');
      } catch (error) {
        this.log('error', 'Error connecting to service worker:', error);
      }
    } else {
      this.log('warn', 'Service workers are not supported in this browser');
    }
  }

  /**
   * Initialize settings if they don't exist
   */
  private async initSettings(): Promise<void> {
    try {
      if (this.db) {
        const tx = this.db.transaction(STORES.SETTINGS, 'readwrite');
        const store = tx.objectStore(STORES.SETTINGS);
        
        // Check if settings exist
        const request = store.get('offline_settings');
        
        request.onsuccess = (event) => {
          const settings = (event.target as IDBRequest).result;
          
          if (!settings) {
            // Create default settings
            store.put({
              id: 'offline_settings',
              ...DEFAULT_OFFLINE_SETTINGS
            });
            
            this.log('info', 'Default offline settings created');
          }
        };
        
        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }
    } catch (error) {
      this.log('error', 'Error initializing settings:', error);
    }
  }

  /**
   * Load settings from IndexedDB
   */
  private async loadSettings(): Promise<void> {
    try {
      if (this.db) {
        const tx = this.db.transaction(STORES.SETTINGS, 'readonly');
        const store = tx.objectStore(STORES.SETTINGS);
        
        const request = store.get('offline_settings');
        
        request.onsuccess = (event) => {
          const settings = (event.target as IDBRequest).result;
          
          if (settings) {
            this.settings = settings;
            this.log('info', 'Offline settings loaded');
          }
        };
        
        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }
    } catch (error) {
      this.log('error', 'Error loading settings:', error);
    }
  }

  /**
   * Save settings to IndexedDB
   */
  private async saveSettings(): Promise<void> {
    try {
      if (this.db) {
        const tx = this.db.transaction(STORES.SETTINGS, 'readwrite');
        const store = tx.objectStore(STORES.SETTINGS);
        
        store.put({
          id: 'offline_settings',
          ...this.settings
        });
        
        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
        
        this.log('info', 'Offline settings saved');
      }
    } catch (error) {
      this.log('error', 'Error saving settings:', error);
    }
  }

  /**
   * Event handler for online event
   */
  private handleOnline = async (): Promise<void> => {
    this.connected = true;
    this.connectionStatus = ConnectionStatus.ONLINE;
    
    // Dispatch event
    this.dispatchEvent('connectionChange', { status: this.connectionStatus });
    
    this.log('info', 'Connection restored');
    
    // If auto-sync on connect is enabled, trigger sync
    if (this.settings.syncOnConnect && this.settings.enabled) {
      this.syncPendingOperations();
    }
  };

  /**
   * Event handler for offline event
   */
  private handleOffline = (): void => {
    this.connected = false;
    this.connectionStatus = ConnectionStatus.OFFLINE;
    
    // Dispatch event
    this.dispatchEvent('connectionChange', { status: this.connectionStatus });
    
    this.log('info', 'Connection lost');
  };

  /**
   * Handle messages from the service worker
   */
  private handleServiceWorkerMessage = (event: MessageEvent): void => {
    const { data } = event;
    
    if (data && data.type) {
      switch (data.type) {
        case 'SYNC_SUCCESS':
          this.log('info', 'Background sync successful for operation:', data.operationId);
          this.removePendingOperation(data.operationId);
          break;
          
        case 'SYNC_ERROR':
          this.log('error', 'Background sync failed for operation:', data.operationId, data.error);
          break;
          
        case 'CONNECTION_STATUS':
          this.connectionStatus = data.status;
          this.dispatchEvent('connectionChange', { status: this.connectionStatus });
          break;
          
        default:
          this.log('debug', 'Unknown message from service worker:', data);
      }
    }
  };

  /**
   * Add an entity to the local storage
   * @param entityType The type of entity
   * @param entity The entity to store
   * @returns The stored entity with offline metadata
   */
  public async saveEntity<T extends { id: string }>(entityType: EntityType, entity: T): Promise<T & OfflineEntity> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      const storeName = this.getStoreNameForEntityType(entityType);
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      
      // Add offline metadata
      const offlineEntity: T & OfflineEntity = {
        ...entity,
        lastModified: new Date().toISOString(),
        syncStatus: this.connected ? SyncStatus.SYNCED : SyncStatus.PENDING,
        localVersion: 1
      };
      
      // Check if entity exists
      const request = store.get(entity.id);
      
      request.onsuccess = (event) => {
        const existingEntity = (event.target as IDBRequest).result;
        
        if (existingEntity) {
          // Update local version
          offlineEntity.localVersion = (existingEntity.localVersion || 0) + 1;
          // Keep server version if it exists
          if (existingEntity.serverVersion) {
            offlineEntity.serverVersion = existingEntity.serverVersion;
          }
        }
        
        // Store entity
        store.put(offlineEntity);
        
        // If we're offline, queue a pending operation
        if (!this.connected && this.settings.enabled) {
          this.queuePendingOperation({
            id: uuidv4(),
            url: `/api/${storeName}/${entity.id}`,
            method: existingEntity ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: offlineEntity,
            entityType,
            entityId: entity.id,
            timestamp: new Date().toISOString(),
            retryCount: 0,
            priority: this.getPriorityForEntityType(entityType)
          });
        }
      };
      
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      
      this.dispatchEvent('entityUpdated', { 
        entityType, 
        entityId: entity.id, 
        status: offlineEntity.syncStatus 
      });
      
      return offlineEntity;
    } catch (error) {
      this.log('error', 'Error saving entity:', error);
      throw error;
    }
  }

  /**
   * Get an entity from local storage
   * @param entityType The type of entity
   * @param id The entity ID
   * @returns The entity or null if not found
   */
  public async getEntity<T>(entityType: EntityType, id: string): Promise<(T & OfflineEntity) | null> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      const storeName = this.getStoreNameForEntityType(entityType);
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      
      const request = store.get(id);
      
      return new Promise<(T & OfflineEntity) | null>((resolve, reject) => {
        request.onsuccess = (event) => {
          resolve((event.target as IDBRequest).result || null);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      this.log('error', 'Error getting entity:', error);
      throw error;
    }
  }

  /**
   * Get all entities of a specific type
   * @param entityType The type of entity
   * @returns Array of entities
   */
  public async getAllEntities<T>(entityType: EntityType): Promise<(T & OfflineEntity)[]> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      const storeName = this.getStoreNameForEntityType(entityType);
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      
      const request = store.getAll();
      
      return new Promise<(T & OfflineEntity)[]>((resolve, reject) => {
        request.onsuccess = (event) => {
          resolve((event.target as IDBRequest).result || []);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      this.log('error', 'Error getting all entities:', error);
      throw error;
    }
  }

  /**
   * Delete an entity from local storage
   * @param entityType The type of entity
   * @param id The entity ID
   * @returns True if successful
   */
  public async deleteEntity(entityType: EntityType, id: string): Promise<boolean> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      const storeName = this.getStoreNameForEntityType(entityType);
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      
      // Queue delete operation if offline
      if (!this.connected && this.settings.enabled) {
        this.queuePendingOperation({
          id: uuidv4(),
          url: `/api/${storeName}/${id}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          entityType,
          entityId: id,
          timestamp: new Date().toISOString(),
          retryCount: 0,
          priority: this.getPriorityForEntityType(entityType)
        });
      }
      
      const request = store.delete(id);
      
      return new Promise<boolean>((resolve, reject) => {
        request.onsuccess = () => {
          this.dispatchEvent('entityDeleted', { entityType, entityId: id });
          resolve(true);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      this.log('error', 'Error deleting entity:', error);
      throw error;
    }
  }

  /**
   * Queue a pending operation for sync
   * @param operation The operation to queue
   */
  private async queuePendingOperation(operation: PendingOperation): Promise<void> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      const tx = this.db.transaction(STORES.PENDING_OPERATIONS, 'readwrite');
      const store = tx.objectStore(STORES.PENDING_OPERATIONS);
      
      store.add(operation);
      
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      
      this.log('info', 'Queued pending operation:', operation.method, operation.url);
      
      // Register for background sync if available
      this.registerBackgroundSync();
      
      // Dispatch event
      this.dispatchEvent('operationQueued', { operation });
    } catch (error) {
      this.log('error', 'Error queuing pending operation:', error);
    }
  }

  /**
   * Remove a pending operation
   * @param id The operation ID
   */
  private async removePendingOperation(id: string): Promise<void> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      const tx = this.db.transaction(STORES.PENDING_OPERATIONS, 'readwrite');
      const store = tx.objectStore(STORES.PENDING_OPERATIONS);
      
      store.delete(id);
      
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      
      this.log('info', 'Removed pending operation:', id);
    } catch (error) {
      this.log('error', 'Error removing pending operation:', error);
    }
  }

  /**
   * Register for background sync if available
   */
  private async registerBackgroundSync(): Promise<void> {
    if (this.serviceWorkerRegistration && 'sync' in this.serviceWorkerRegistration) {
      try {
        await (this.serviceWorkerRegistration as any).sync.register('sync-pending-operations');
        this.log('info', 'Registered for background sync');
      } catch (error) {
        this.log('error', 'Error registering for background sync:', error);
      }
    }
  }

  /**
   * Sync pending operations
   */
  public async syncPendingOperations(): Promise<void> {
    // If not online or sync already in progress, don't proceed
    if (!this.connected || this.syncInProgress || !this.settings.enabled) {
      return;
    }
    
    try {
      this.syncInProgress = true;
      this.dispatchEvent('syncStarted', { timestamp: new Date().toISOString() });
      
      this.log('info', 'Starting sync of pending operations');
      
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      const tx = this.db.transaction(STORES.PENDING_OPERATIONS, 'readonly');
      const store = tx.objectStore(STORES.PENDING_OPERATIONS);
      
      const operations = await new Promise<PendingOperation[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
      
      // Sort operations by priority (higher first) and timestamp (oldest first)
      operations.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // Higher priority first
        }
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(); // Oldest first
      });
      
      let successCount = 0;
      let failureCount = 0;
      
      for (const operation of operations) {
        try {
          // Perform the API operation
          const response = await fetch(operation.url, {
            method: operation.method,
            headers: operation.headers,
            body: operation.body ? JSON.stringify(operation.body) : undefined
          });
          
          if (response.ok) {
            // Operation successful, remove from queue
            await this.removePendingOperation(operation.id);
            
            // Update entity sync status if it still exists
            await this.updateEntitySyncStatus(operation.entityType, operation.entityId, SyncStatus.SYNCED);
            
            successCount++;
          } else {
            // Operation failed
            failureCount++;
            
            // If we've exceeded max retries, remove the operation
            if (operation.retryCount >= this.options.maxRetries) {
              await this.removePendingOperation(operation.id);
              await this.updateEntitySyncStatus(operation.entityType, operation.entityId, SyncStatus.ERROR, `HTTP error: ${response.status}`);
            } else {
              // Increment retry count
              await this.updateOperationRetryCount(operation.id, operation.retryCount + 1);
            }
          }
        } catch (error) {
          failureCount++;
          this.log('error', 'Error syncing operation:', operation.id, error);
          
          // If we've exceeded max retries, remove the operation
          if (operation.retryCount >= this.options.maxRetries) {
            await this.removePendingOperation(operation.id);
            await this.updateEntitySyncStatus(operation.entityType, operation.entityId, SyncStatus.ERROR, String(error));
          } else {
            // Increment retry count
            await this.updateOperationRetryCount(operation.id, operation.retryCount + 1);
          }
        }
      }
      
      // Update last sync timestamp
      this.settings.lastSyncTimestamp = new Date().toISOString();
      await this.saveSettings();
      
      this.log('info', `Sync completed: ${successCount} succeeded, ${failureCount} failed`);
      
      this.dispatchEvent('syncCompleted', { 
        timestamp: new Date().toISOString(),
        successCount,
        failureCount
      });
    } catch (error) {
      this.log('error', 'Error during sync:', error);
      
      this.dispatchEvent('syncFailed', { 
        timestamp: new Date().toISOString(),
        error: String(error)
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Update an entity's sync status
   * @param entityType The entity type
   * @param id The entity ID
   * @param status The new sync status
   * @param error Optional error message
   */
  private async updateEntitySyncStatus(
    entityType: EntityType, 
    id: string, 
    status: SyncStatus,
    error?: string
  ): Promise<void> {
    try {
      const entity = await this.getEntity(entityType, id);
      
      if (entity) {
        entity.syncStatus = status;
        if (error) {
          entity.syncError = error;
        } else {
          delete entity.syncError;
        }
        
        const storeName = this.getStoreNameForEntityType(entityType);
        const tx = this.db!.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        
        store.put(entity);
        
        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
        
        this.dispatchEvent('entityUpdated', { 
          entityType, 
          entityId: id, 
          status 
        });
      }
    } catch (error) {
      this.log('error', 'Error updating entity sync status:', error);
    }
  }

  /**
   * Update a pending operation's retry count
   * @param id The operation ID
   * @param retryCount The new retry count
   */
  private async updateOperationRetryCount(id: string, retryCount: number): Promise<void> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      const tx = this.db.transaction(STORES.PENDING_OPERATIONS, 'readwrite');
      const store = tx.objectStore(STORES.PENDING_OPERATIONS);
      
      const request = store.get(id);
      
      request.onsuccess = (event) => {
        const operation = (event.target as IDBRequest).result;
        
        if (operation) {
          operation.retryCount = retryCount;
          store.put(operation);
        }
      };
      
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      this.log('error', 'Error updating operation retry count:', error);
    }
  }

  /**
   * Resolve a conflict between local and server versions
   * @param entityType The entity type
   * @param localEntity The local entity
   * @param serverEntity The server entity
   * @param strategy The conflict resolution strategy
   * @returns The resolved entity
   */
  public async resolveConflict<T extends { id: string }>(
    entityType: EntityType,
    localEntity: T & OfflineEntity,
    serverEntity: T & OfflineEntity,
    strategy: ConflictResolutionStrategy = this.settings.conflictStrategy
  ): Promise<ConflictResolution<T>> {
    try {
      let resolvedEntity: T & OfflineEntity;
      let winner: 'server' | 'client' | 'merged' = 'server';
      
      switch (strategy) {
        case ConflictResolutionStrategy.SERVER_WINS:
          resolvedEntity = {
            ...serverEntity,
            syncStatus: SyncStatus.SYNCED,
            lastModified: new Date().toISOString(),
            localVersion: localEntity.localVersion,
            serverVersion: serverEntity.serverVersion
          };
          winner = 'server';
          break;
          
        case ConflictResolutionStrategy.CLIENT_WINS:
          resolvedEntity = {
            ...localEntity,
            syncStatus: SyncStatus.SYNCED,
            lastModified: new Date().toISOString(),
            serverVersion: serverEntity.serverVersion
          };
          winner = 'client';
          break;
          
        case ConflictResolutionStrategy.NEWEST_WINS:
          const localDate = new Date(localEntity.lastModified).getTime();
          const serverDate = new Date(serverEntity.lastModified).getTime();
          
          if (localDate > serverDate) {
            resolvedEntity = {
              ...localEntity,
              syncStatus: SyncStatus.SYNCED,
              lastModified: new Date().toISOString(),
              serverVersion: serverEntity.serverVersion
            };
            winner = 'client';
          } else {
            resolvedEntity = {
              ...serverEntity,
              syncStatus: SyncStatus.SYNCED,
              lastModified: new Date().toISOString(),
              localVersion: localEntity.localVersion,
              serverVersion: serverEntity.serverVersion
            };
            winner = 'server';
          }
          break;
          
        case ConflictResolutionStrategy.MANUAL:
          // Return without resolving for manual intervention
          return {
            resolved: false,
            winner: 'server', // Default
            strategy
          };
          
        default:
          // Default to server wins
          resolvedEntity = {
            ...serverEntity,
            syncStatus: SyncStatus.SYNCED,
            lastModified: new Date().toISOString(),
            localVersion: localEntity.localVersion,
            serverVersion: serverEntity.serverVersion
          };
          winner = 'server';
      }
      
      // Save the resolved entity
      await this.saveEntity(entityType, resolvedEntity);
      
      return {
        resolved: true,
        winner,
        resolvedEntity,
        strategy
      };
    } catch (error) {
      this.log('error', 'Error resolving conflict:', error);
      throw error;
    }
  }

  /**
   * Update offline settings
   * @param settings New settings (partial)
   */
  public async updateSettings(settings: Partial<OfflineSettings>): Promise<OfflineSettings> {
    this.settings = {
      ...this.settings,
      ...settings
    };
    
    await this.saveSettings();
    
    this.dispatchEvent('settingsUpdated', { settings: this.settings });
    
    return this.settings;
  }

  /**
   * Get current offline settings
   */
  public getSettings(): OfflineSettings {
    return { ...this.settings };
  }

  /**
   * Get the current connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Check if there are pending operations
   */
  public async hasPendingOperations(): Promise<boolean> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      const tx = this.db.transaction(STORES.PENDING_OPERATIONS, 'readonly');
      const store = tx.objectStore(STORES.PENDING_OPERATIONS);
      
      const request = store.count();
      
      return new Promise<boolean>((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result > 0);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      this.log('error', 'Error checking pending operations:', error);
      return false;
    }
  }

  /**
   * Get count of pending operations
   */
  public async getPendingOperationCount(): Promise<number> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      const tx = this.db.transaction(STORES.PENDING_OPERATIONS, 'readonly');
      const store = tx.objectStore(STORES.PENDING_OPERATIONS);
      
      const request = store.count();
      
      return new Promise<number>((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      this.log('error', 'Error getting pending operation count:', error);
      return 0;
    }
  }

  /**
   * Clear all cached data (use with caution)
   */
  public async clearAllData(): Promise<void> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      const stores = [
        STORES.TASKS,
        STORES.RECOMMENDATIONS,
        STORES.WATERING_SCHEDULES,
        STORES.PHOTOS,
        STORES.PLANT_IDENTIFICATIONS,
        STORES.NOTIFICATIONS,
        STORES.PENDING_OPERATIONS
      ];
      
      for (const store of stores) {
        const tx = this.db.transaction(store, 'readwrite');
        const objectStore = tx.objectStore(store);
        
        objectStore.clear();
        
        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }
      
      // Keep settings
      this.log('info', 'All cached data cleared');
      
      this.dispatchEvent('dataCacheCleared', { timestamp: new Date().toISOString() });
    } catch (error) {
      this.log('error', 'Error clearing cached data:', error);
      throw error;
    }
  }

  /**
   * Add an event listener
   * @param event Event name
   * @param listener Listener function
   */
  public addEventListener(event: string, listener: (event: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * Remove an event listener
   * @param event Event name
   * @param listener Listener function
   */
  public removeEventListener(event: string, listener: (event: any) => void): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.delete(listener);
    }
  }

  /**
   * Dispatch an event
   * @param event Event name
   * @param data Event data
   */
  private dispatchEvent(event: string, data: any): void {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)!;
      
      for (const listener of listeners) {
        try {
          listener({ type: event, ...data });
        } catch (error) {
          this.log('error', 'Error in event listener:', error);
        }
      }
    }
  }

  /**
   * Log a message with the specified level
   * @param level Log level
   * @param message Message
   * @param args Additional arguments
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
    if (this.logLevels[level] >= this.logLevels[this.options.logLevel]) {
      const timestamp = new Date().toISOString();
      const prefix = `[OfflineService] [${timestamp}] [${level.toUpperCase()}]`;
      
      switch (level) {
        case 'error':
          console.error(prefix, message, ...args);
          break;
        case 'warn':
          console.warn(prefix, message, ...args);
          break;
        case 'info':
          console.info(prefix, message, ...args);
          break;
        case 'debug':
        default:
          console.debug(prefix, message, ...args);
      }
    }
  }

  /**
   * Get the store name for an entity type
   * @param entityType Entity type
   * @returns Store name
   */
  private getStoreNameForEntityType(entityType: EntityType): string {
    switch (entityType) {
      case EntityType.TASK:
        return STORES.TASKS;
      case EntityType.RECOMMENDATION:
        return STORES.RECOMMENDATIONS;
      case EntityType.WATERING_SCHEDULE:
        return STORES.WATERING_SCHEDULES;
      case EntityType.PHOTO:
        return STORES.PHOTOS;
      case EntityType.PLANT_IDENTIFICATION:
        return STORES.PLANT_IDENTIFICATIONS;
      case EntityType.NOTIFICATION:
        return STORES.NOTIFICATIONS;
      case EntityType.USER_PROFILE:
      case EntityType.SETTINGS:
      default:
        throw new Error(`No store defined for entity type: ${entityType}`);
    }
  }

  /**
   * Get sync priority for an entity type
   * @param entityType Entity type
   * @returns Priority (higher = more important)
   */
  private getPriorityForEntityType(entityType: EntityType): number {
    const priorityMap: Record<EntityType, number> = {
      [EntityType.USER_PROFILE]: 100,
      [EntityType.SETTINGS]: 90,
      [EntityType.TASK]: 80,
      [EntityType.WATERING_SCHEDULE]: 70,
      [EntityType.NOTIFICATION]: 60,
      [EntityType.RECOMMENDATION]: 50,
      [EntityType.PLANT_IDENTIFICATION]: 40,
      [EntityType.PHOTO]: 30
    };
    
    return priorityMap[entityType] || 0;
  }
}

// Export the singleton instance
export const offlineService = OfflineService.getInstance();

export default offlineService;