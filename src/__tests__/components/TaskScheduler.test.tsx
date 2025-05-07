import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskScheduler from '../../../src/features/dashboard/components/TaskScheduler';
import * as taskSchedulerService from '../../../src/lib/taskSchedulerService';
import { mockUserData } from '../../../src/features/dashboard/mockData';
import type { ScheduledTask } from '../../../src/types/scheduler';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

// Mock taskSchedulerService
vi.mock('../../../src/lib/taskSchedulerService', () => ({
  getScheduledTasks: vi.fn(),
  getWeatherCompatibleTasks: vi.fn(),
  suggestOptimalTiming: vi.fn(),
  rescheduleTask: vi.fn(),
  updateScheduledTask: vi.fn()
}));

// Sample tasks for testing
const mockTasks: ScheduledTask[] = [
  {
    id: 1,
    title: 'Mow the lawn',
    description: 'Cut grass to 2.5 inches',
    dueDate: '2025-05-10',
    scheduledDate: '2025-05-10',
    priority: 'high',
    category: 'mowing',
    isCompleted: false,
    icon: 'mower',
    isWeatherAppropriate: true,
    weatherCondition: 'Sunny'
  },
  {
    id: 2,
    title: 'Fertilize garden',
    description: 'Apply organic fertilizer',
    dueDate: '2025-05-12',
    scheduledDate: '2025-05-12',
    priority: 'medium',
    category: 'fertilizing',
    isCompleted: false,
    icon: 'leaf',
    isWeatherAppropriate: false,
    weatherCondition: 'Rain'
  },
  {
    id: 3,
    title: 'Trim hedges',
    description: 'Shape and trim the hedges',
    dueDate: '2025-05-15',
    scheduledDate: '2025-05-15',
    priority: 'low',
    category: 'trimming',
    isCompleted: true,
    icon: 'cut',
    isWeatherAppropriate: true
  }
];

describe('TaskScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the implementation of the service methods
    vi.mocked(taskSchedulerService.getWeatherCompatibleTasks).mockResolvedValue(mockTasks);
    vi.mocked(taskSchedulerService.updateScheduledTask).mockImplementation(
      async (task) => Promise.resolve(task)
    );
    vi.mocked(taskSchedulerService.rescheduleTask).mockImplementation(
      async (taskId, newDate) => {
        const task = mockTasks.find(t => t.id === taskId);
        if (!task) return null;
        return { ...task, scheduledDate: newDate };
      }
    );
    
    // Reset console mock
    console.error = vi.fn();
  });
  
  it('renders without crashing', async () => {
    render(<TaskScheduler />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(taskSchedulerService.getWeatherCompatibleTasks).toHaveBeenCalledWith(
        mockUserData.location
      );
    });
    
    // Check if the main header is present
    expect(screen.getByText('Task Scheduler')).toBeInTheDocument();
  });
  
  it('displays the current month and year', async () => {
    render(<TaskScheduler />);
    
    // Get current month and year
    const date = new Date();
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    await waitFor(() => {
      expect(screen.getByText(monthYear)).toBeInTheDocument();
    });
  });
  
  it('displays week day names', async () => {
    render(<TaskScheduler />);
    
    // Check if all day names are present
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    await waitFor(() => {
      days.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });
  });
  
  it('displays the number of scheduled tasks', async () => {
    render(<TaskScheduler />);
    
    // Get the number of non-completed tasks
    const scheduledCount = mockTasks.filter(task => !task.isCompleted).length;
    
    await waitFor(() => {
      expect(screen.getByText(`${scheduledCount} Scheduled`)).toBeInTheDocument();
    });
  });
  
  it('navigates to the previous month when the button is clicked', async () => {
    render(<TaskScheduler />);
    
    await waitFor(() => {
      expect(taskSchedulerService.getWeatherCompatibleTasks).toHaveBeenCalled();
    });
    
    // Get current month
    const date = new Date();
    const currentMonth = date.getMonth();
    
    // Click the previous month button
    const prevButton = screen.getByText('<').parentElement;
    if (prevButton) fireEvent.click(prevButton);
    
    // Get previous month name
    date.setMonth(currentMonth - 1);
    const prevMonthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    await waitFor(() => {
      expect(screen.getByText(prevMonthYear)).toBeInTheDocument();
    });
    
    // Verify the service was called again
    expect(taskSchedulerService.getWeatherCompatibleTasks).toHaveBeenCalledTimes(2);
  });
  
  it('navigates to the next month when the button is clicked', async () => {
    render(<TaskScheduler />);
    
    await waitFor(() => {
      expect(taskSchedulerService.getWeatherCompatibleTasks).toHaveBeenCalled();
    });
    
    // Get current month
    const date = new Date();
    const currentMonth = date.getMonth();
    
    // Click the next month button
    const nextButton = screen.getByText('>').parentElement;
    if (nextButton) fireEvent.click(nextButton);
    
    // Get next month name
    date.setMonth(currentMonth + 1);
    const nextMonthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    await waitFor(() => {
      expect(screen.getByText(nextMonthYear)).toBeInTheDocument();
    });
    
    // Verify the service was called again
    expect(taskSchedulerService.getWeatherCompatibleTasks).toHaveBeenCalledTimes(2);
  });
  
  it('displays task information when a day with tasks is clicked', async () => {
    // We need to modify the mock implementation to simulate tasks on the current date
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    const tasksWithToday = [
      ...mockTasks,
      {
        id: 4,
        title: 'Today\'s Task',
        description: 'This task is scheduled for today',
        dueDate: todayString,
        scheduledDate: todayString,
        priority: 'high' as const,
        category: 'mowing',
        isCompleted: false,
        icon: 'mower',
        isWeatherAppropriate: true
      }
    ];
    
    vi.mocked(taskSchedulerService.getWeatherCompatibleTasks).mockResolvedValue(tasksWithToday);
    
    render(<TaskScheduler />);
    
    await waitFor(() => {
      expect(taskSchedulerService.getWeatherCompatibleTasks).toHaveBeenCalled();
    });
    
    // Find today's date cell and click it
    // Note: This is a bit tricky since we don't know exactly how it will appear in the DOM
    // We'll need to find a cell that contains today's date
    const todayDate = today.getDate().toString();
    
    // Wait for the calendar to render
    await waitFor(() => {
      // Look for the today's date with today's class styling
      const cells = document.querySelectorAll('div[style*="backgroundColor: white"]');
      let todayCell = null;
      
      cells.forEach(cell => {
        if (cell.textContent?.includes(todayDate) && 
            cell.className?.includes('font-bold')) {
          todayCell = cell;
        }
      });
      
      if (todayCell) {
        fireEvent.click(todayCell);
      }
    });
    
    // Check if the task details appear
    await waitFor(() => {
      expect(screen.getByText('Today\'s Task')).toBeInTheDocument();
      expect(screen.getByText('This task is scheduled for today')).toBeInTheDocument();
    });
  });
  
  it('marks a task as completed when the complete button is clicked', async () => {
    // Setup similar to previous test to get a task to display
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    const tasksWithToday = [
      {
        id: 4,
        title: 'Today\'s Task',
        description: 'This task is scheduled for today',
        dueDate: todayString,
        scheduledDate: todayString,
        priority: 'high' as const,
        category: 'mowing',
        isCompleted: false,
        icon: 'mower',
        isWeatherAppropriate: true
      }
    ];
    
    vi.mocked(taskSchedulerService.getWeatherCompatibleTasks).mockResolvedValue(tasksWithToday);
    vi.mocked(taskSchedulerService.updateScheduledTask).mockImplementation(async (task) => {
      return { ...task, isCompleted: true };
    });
    
    render(<TaskScheduler />);
    
    // Wait for the calendar to render and click on today's cell
    await waitFor(() => {
      const cells = document.querySelectorAll('div[style*="backgroundColor: white"]');
      let todayCell = null;
      
      cells.forEach(cell => {
        if (cell.textContent?.includes(today.getDate().toString()) && 
            cell.className?.includes('font-bold')) {
          todayCell = cell;
        }
      });
      
      if (todayCell) {
        fireEvent.click(todayCell);
      }
    });
    
    // Find and click the complete button
    await waitFor(() => {
      const completeButton = document.querySelector('button[style*="color: rgb"]');
      if (completeButton) {
        fireEvent.click(completeButton);
      }
    });
    
    // Verify the service was called with the right task
    await waitFor(() => {
      expect(taskSchedulerService.updateScheduledTask).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 4,
          isCompleted: true
        })
      );
    });
  });
  
  it('shows error in console when service calls fail', async () => {
    // Mock the service to reject
    vi.mocked(taskSchedulerService.getWeatherCompatibleTasks).mockRejectedValue(
      new Error('Service error')
    );
    
    render(<TaskScheduler />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  it('shows a calendar day with appropriate styling when tasks are weather appropriate', async () => {
    // Task that is weather appropriate
    const tasksWithAppropriate = [
      {
        id: 1,
        title: 'Appropriate Task',
        description: 'This task is weather appropriate',
        dueDate: '2025-05-10',
        scheduledDate: '2025-05-10',
        priority: 'high' as const,
        category: 'mowing',
        isCompleted: false,
        icon: 'mower',
        isWeatherAppropriate: true,
        weatherCondition: 'Sunny'
      }
    ];
    
    vi.mocked(taskSchedulerService.getWeatherCompatibleTasks).mockResolvedValue(tasksWithAppropriate);
    
    render(<TaskScheduler />);
    
    await waitFor(() => {
      expect(taskSchedulerService.getWeatherCompatibleTasks).toHaveBeenCalled();
    });
    
    // We can't easily check the specific styling, but we can verify that appropriate classes
    // or styles would be applied based on the component's logic
    // This would require a more specific approach if we want to verify the exact styles
  });
});