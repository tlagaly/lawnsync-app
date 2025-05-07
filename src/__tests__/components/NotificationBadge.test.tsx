import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationBadge from '../../../src/features/dashboard/components/NotificationBadge';
import * as notificationService from '../../../src/lib/notificationService';

// Mock the notification service
vi.mock('../../../src/lib/notificationService', () => ({
  getUnreadNotificationCount: vi.fn()
}));

describe('NotificationBadge', () => {
  const onClickMock = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    
    // Clear all timers
    vi.useRealTimers();
  });
  
  it('renders without crashing', () => {
    // Mock the notification count
    vi.mocked(notificationService.getUnreadNotificationCount).mockResolvedValue(0);
    
    render(<NotificationBadge onClick={onClickMock} />);
    
    // Check if bell icon is present (using aria-label)
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });
  
  it('shows the correct notification count', async () => {
    // Mock the notification count
    vi.mocked(notificationService.getUnreadNotificationCount).mockResolvedValue(3);
    
    render(<NotificationBadge onClick={onClickMock} />);
    
    // Wait for the count to be rendered
    const countElement = await screen.findByText('3');
    expect(countElement).toBeInTheDocument();
  });
  
  it('formats large notification counts as 9+', async () => {
    // Mock a large notification count
    vi.mocked(notificationService.getUnreadNotificationCount).mockResolvedValue(15);
    
    render(<NotificationBadge onClick={onClickMock} />);
    
    // Wait for the formatted count to be rendered
    const countElement = await screen.findByText('9+');
    expect(countElement).toBeInTheDocument();
  });
  
  it('does not show the count when there are no notifications', async () => {
    // Mock zero notifications
    vi.mocked(notificationService.getUnreadNotificationCount).mockResolvedValue(0);
    
    const { container } = render(<NotificationBadge onClick={onClickMock} />);
    
    // Wait for any state updates to complete
    await vi.waitFor(() => {
      expect(container.querySelectorAll('div[style*="background-color"]').length).toBe(0);
    });
  });
  
  it('calls the onClick handler when clicked', () => {
    // Mock the notification count
    vi.mocked(notificationService.getUnreadNotificationCount).mockResolvedValue(3);
    
    render(<NotificationBadge onClick={onClickMock} />);
    
    // Click the button
    fireEvent.click(screen.getByLabelText('Notifications'));
    
    // Check if the onClick handler was called
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
  
  it('polls for new notifications', async () => {
    // Set up fake timers to test polling
    vi.useFakeTimers();
    
    // Mock the notification count
    const getCountMock = vi.mocked(notificationService.getUnreadNotificationCount);
    
    // First return 1, then return 3 on subsequent calls
    getCountMock.mockResolvedValueOnce(1).mockResolvedValueOnce(3);
    
    render(<NotificationBadge onClick={onClickMock} />);
    
    // Wait for initial count
    await screen.findByText('1');
    
    // Fast-forward through the polling interval
    vi.advanceTimersByTime(60000); // 1 minute
    
    // Wait for updated count
    await vi.waitFor(async () => {
      expect(getCountMock).toHaveBeenCalledTimes(2);
    });
  });
  
  it('cleans up interval on unmount', () => {
    // Set up fake timers to test cleanup
    vi.useFakeTimers();
    
    // Mock the notification count
    vi.mocked(notificationService.getUnreadNotificationCount).mockResolvedValue(1);
    
    // Set up spy on clearInterval
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    
    const { unmount } = render(<NotificationBadge onClick={onClickMock} />);
    
    // Unmount the component
    unmount();
    
    // Check if clearInterval was called
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});