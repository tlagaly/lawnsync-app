/**
 * Offline Types
 * Type definitions for offline functionality
 */

/**
 * Connection status enum
 */
export enum ConnectionStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  RECONNECTING = 'reconnecting'
}

/**
 * Sync status enum
 */
export enum SyncStatus {
  SYNCED = 'synced',
  PENDING = 'pending',
  SYNCING = 'syncing',
  ERROR = 'error'
}

/**
 * Entity types enum for offline storage
 */
export enum EntityType {
  TASK = 'task',
  RECOMMENDATION = 'recommendation',
  WATERING_SCHEDULE = 'watering_schedule',
  PHOTO = 'photo',
  PLANT_IDENTIFICATION = 'plant_identification',
  NOTIFICATION = 'notification',
  USER_PROFILE = 'user_profile',
  SETTINGS = 'settings'
}

/**
 * Conflict resolution strategy enum
 */
export enum ConflictResolutionStrategy {
  SERVER_WINS = 'server_wins',
  CLIENT_WINS = 'client_wins',
  NEWEST_WINS = 'newest_wins',
  MANUAL = 'manual'
}

/**
 * Offline entity interface
 * This is extended by all entities that need offline support
 */
export interface OfflineEntity {
  id: string;
  lastModified: string;
  syncStatus: SyncStatus;
  syncError?: string;
  localVersion?: number;
  serverVersion?: number;
}

/**
 * Pending operation interface
 * Represents an operation that needs to be synced with the server
 */
export interface PendingOperation {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: any;
  entityType: EntityType;
  entityId: string;
  timestamp: string;
  retryCount: number;
  priority: number;
}

/**
 * Offline settings interface
 */
export interface OfflineSettings {
  enabled: boolean;
  syncOnConnect: boolean;
  autoSync: boolean;
  syncInterval: number;
  maxStorageSize: number;
  lastSyncTimestamp: string | null;
  conflictStrategy: ConflictResolutionStrategy;
  prioritySyncEntities: EntityType[];
}

/**
 * Default offline settings
 */
export const DEFAULT_OFFLINE_SETTINGS: OfflineSettings = {
  enabled: true,
  syncOnConnect: true,
  autoSync: true,
  syncInterval: 900000, // 15 minutes
  maxStorageSize: 50, // MB
  lastSyncTimestamp: null,
  conflictStrategy: ConflictResolutionStrategy.SERVER_WINS,
  prioritySyncEntities: [
    EntityType.TASK,
    EntityType.WATERING_SCHEDULE,
    EntityType.NOTIFICATION
  ]
};

/**
 * Conflict resolution interface
 * Result of conflict resolution
 */
export interface ConflictResolution<T> {
  resolved: boolean;
  winner: 'server' | 'client' | 'merged';
  resolvedEntity?: T & OfflineEntity;
  strategy: ConflictResolutionStrategy;
}

/**
 * Sync event interface
 * Used for notifying about sync events
 */
export interface SyncEvent {
  type: 'started' | 'completed' | 'failed';
  timestamp: string;
  successCount?: number;
  failureCount?: number;
  error?: string;
}

/**
 * Storage quota info interface
 */
export interface StorageQuotaInfo {
  usage: number; // bytes
  quota: number; // bytes
  percent: number;
}

/**
 * Offline error type
 */
export class OfflineError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'OfflineError';
    this.code = code;
  }
}