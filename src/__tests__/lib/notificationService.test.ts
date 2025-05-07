import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences
} from '../../lib/notificationService';
import { mockLocalStorage } from '../utils/testUtils';

// Mock localStorage
const localStorageMock = mockLocalStorage();

// Mock notification data
const mockNotificationEvent = {
  type: 'weather_alert' as const,
  title: 'Heavy Rain Alert',
  message: 'Heavy rain expected in your area tomorrow.',
  priority: 'high' as const,
  actionUrl: '/dashboard/weather'
};

describe('NotificationService', () => {
  beforeEach(() => {
    // Set up localStorage mock for each test
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => localStorageMock);
    
    // Clear localStorage before each test
    localStorageMock.clear();
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getNotifications', () => {
    it('should return an array of notifications', async () => {
      const notifications = await getNotifications();
      expect(notifications).toBeDefined();
      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should filter notifications by type', async () => {
      // First create a notification so we have something in storage
      await createNotification(mockNotificationEvent);
      
      // Then get notifications with type filter
      const notifications = await getNotifications({ types: ['weather_alert'] });
      
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications.every(n => n.type === 'weather_alert')).toBe(true);
    });

    it('should filter notifications by read status', async () => {
      // Create notification
      const notification = await createNotification(mockNotificationEvent);
      
      // Get unread notifications
      const unreadNotifications = await getNotifications({ readStatus: 'unread' });
      expect(unreadNotifications.some(n => n.id === notification?.id)).toBe(true);
      
      // Mark notification as read
      if (notification) {
        await markNotificationAsRead(notification.id);
      }
      
      // Get read notifications
      const readNotifications = await getNotifications({ readStatus: 'read' });
      expect(readNotifications.some(n => n.id === notification?.id)).toBe(true);
      
      // Unread notifications should not include this one anymore
      const unreadAfterMarking = await getNotifications({ readStatus: 'unread' });
      expect(unreadAfterMarking.some(n => n.id === notification?.id)).toBe(false);
    });
  });

  describe('createNotification', () => {
    it('should create a new notification', async () => {
      const notification = await createNotification(mockNotificationEvent);
      
      expect(notification).toBeDefined();
      expect(notification?.type).toBe(mockNotificationEvent.type);
      expect(notification?.title).toBe(mockNotificationEvent.title);
      expect(notification?.message).toBe(mockNotificationEvent.message);
      expect(notification?.isRead).toBe(false);
    });

    it('should add the notification to storage', async () => {
      await createNotification(mockNotificationEvent);
      
      const notifications = await getNotifications();
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].title).toBe(mockNotificationEvent.title);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark a notification as read', async () => {
      // Create a notification
      const notification = await createNotification(mockNotificationEvent);
      
      if (!notification) {
        throw new Error('Failed to create notification');
      }
      
      // Mark as read
      const result = await markNotificationAsRead(notification.id);
      expect(result).toBe(true);
      
      // Check if it's marked as read
      const updatedNotification = (await getNotifications())
        .find(n => n.id === notification.id);
        
      expect(updatedNotification?.isRead).toBe(true);
    });

    it('should return false for non-existent notification', async () => {
      const result = await markNotificationAsRead('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read', async () => {
      // Create multiple notifications
      await createNotification(mockNotificationEvent);
      await createNotification({
        ...mockNotificationEvent,
        type: 'scheduled_task' as const,
        title: 'Task Reminder'
      });
      
      // Mark all as read
      const result = await markAllNotificationsAsRead();
      expect(result).toBe(true);
      
      // Check if all are marked as read
      const notifications = await getNotifications();
      expect(notifications.every(n => n.isRead)).toBe(true);
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('should return the count of unread notifications', async () => {
      // Create multiple notifications
      await createNotification(mockNotificationEvent);
      await createNotification({
        ...mockNotificationEvent,
        type: 'scheduled_task' as const,
        title: 'Task Reminder'
      });
      
      // Get unread count
      const count = await getUnreadNotificationCount();
      expect(count).toBe(2);
      
      // Mark one as read
      const notifications = await getNotifications();
      if (notifications.length > 0) {
        await markNotificationAsRead(notifications[0].id);
      }
      
      // Get unread count again
      const newCount = await getUnreadNotificationCount();
      expect(newCount).toBe(1);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      // Create a notification
      const notification = await createNotification(mockNotificationEvent);
      
      if (!notification) {
        throw new Error('Failed to create notification');
      }
      
      // Get the count before deletion
      const countBefore = (await getNotifications()).length;
      
      // Delete the notification
      const result = await deleteNotification(notification.id);
      expect(result).toBe(true);
      
      // Check if the notification is deleted
      const countAfter = (await getNotifications()).length;
      expect(countAfter).toBe(countBefore - 1);
      
      const stillExists = (await getNotifications())
        .some(n => n.id === notification.id);
      expect(stillExists).toBe(false);
    });
  });

  describe('notification preferences', () => {
    it('should get default notification preferences', async () => {
      const preferences = await getNotificationPreferences();
      
      expect(preferences).toBeDefined();
      expect(preferences.enabled).toBe(true);
      expect(preferences.deliveryMethods).toContain('in_app');
      expect(preferences.typePreferences).toBeDefined();
    });

    it('should update notification preferences', async () => {
      // Update preferences
      const updatedPrefs = await updateNotificationPreferences({
        enabled: false,
        quietHours: {
          enabled: true,
          start: '23:00',
          end: '07:00'
        }
      });
      
      expect(updatedPrefs.enabled).toBe(false);
      expect(updatedPrefs.quietHours.enabled).toBe(true);
      expect(updatedPrefs.quietHours.start).toBe('23:00');
      
      // Get preferences and check if they're updated
      const preferences = await getNotificationPreferences();
      expect(preferences.enabled).toBe(false);
      expect(preferences.quietHours.enabled).toBe(true);
    });
  });
});