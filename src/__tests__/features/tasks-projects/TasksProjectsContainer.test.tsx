import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import TasksProjectsContainer from '../../../features/tasks-projects/TasksProjectsContainer';
import * as taskSchedulerService from '../../../lib/taskSchedulerService';
import userEvent from '@testing-library/user-event';

// Mock the TaskScheduler and SeasonalTasks components
vi.mock('../../../features/maintain/components/TaskScheduler', () => {
  return {
    default: function MockTaskScheduler() {
      return <div data-testid="task-scheduler-component">TaskScheduler Component</div>;
    }
  };
});

vi.mock('../../../features/maintain/components/SeasonalTasks', () => {
  return {
    default: function MockSeasonalTasks() {
      return <div data-testid="seasonal-tasks-component">SeasonalTasks Component</div>;
    }
  };
});

// Mock the taskSchedulerService
vi.mock('../../../lib/taskSchedulerService', () => ({
  getScheduledTasks: vi.fn(),
}));

describe('TasksProjectsContainer', () => {
  beforeEach(() => {
    // Mock the getScheduledTasks function to return an empty array
    (taskSchedulerService.getScheduledTasks as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <TasksProjectsContainer />
      </BrowserRouter>
    );
  };

  it('renders the component with header and tabs', () => {
    renderComponent();
    
    // Check if the header is rendered
    expect(screen.getByText('Tasks & Projects')).toBeInTheDocument();
    expect(screen.getByText('Manage your lawn care schedule and projects')).toBeInTheDocument();
    
    // Check if all tabs are rendered
    expect(screen.getByText('Daily & Weekly Tasks')).toBeInTheDocument();
    expect(screen.getByText('Seasonal Projects')).toBeInTheDocument();
    expect(screen.getByText('Custom Projects')).toBeInTheDocument();
  });

  it('displays TaskScheduler component when Daily & Weekly Tasks tab is active', () => {
    renderComponent();
    
    // The Daily & Weekly Tasks tab should be active by default
    expect(screen.getByText('Daily & Weekly Tasks').closest('button')).toHaveClass('active');
    expect(screen.getByTestId('task-scheduler-component')).toBeInTheDocument();
  });

  it('switches to Seasonal Projects tab when clicked', async () => {
    renderComponent();
    
    // Click on the Seasonal Projects tab
    fireEvent.click(screen.getByText('Seasonal Projects'));
    
    // Check if the Seasonal Projects tab is active and shows SeasonalTasks component
    await waitFor(() => {
      expect(screen.getByText('Seasonal Projects').closest('button')).toHaveClass('active');
      expect(screen.getByTestId('seasonal-tasks-component')).toBeInTheDocument();
    });
  });

  it('switches to Custom Projects tab when clicked', async () => {
    renderComponent();
    
    // Click on the Custom Projects tab
    fireEvent.click(screen.getByText('Custom Projects'));
    
    // Check if the Custom Projects tab is active and shows custom projects
    await waitFor(() => {
      expect(screen.getByText('Custom Projects').closest('button')).toHaveClass('active');
      expect(screen.getByText('Custom Lawn Projects')).toBeInTheDocument();
    });
  });

  it('shows the new project form when New Project button is clicked', async () => {
    renderComponent();
    
    // Navigate to the Custom Projects tab
    fireEvent.click(screen.getByText('Custom Projects'));
    
    // Click on the New Project button
    fireEvent.click(screen.getByText('+ New Project'));
    
    // Check if the form is displayed
    await waitFor(() => {
      expect(screen.getByText('Create New Project')).toBeInTheDocument();
      expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Timeframe')).toBeInTheDocument();
    });
  });

  it('can create a new project', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Navigate to the Custom Projects tab
    await user.click(screen.getByText('Custom Projects'));
    
    // Click on the New Project button
    await user.click(screen.getByText('+ New Project'));
    
    // Fill out the form
    await user.type(screen.getByLabelText('Project Name'), 'Test Project');
    await user.type(screen.getByLabelText('Description'), 'Test Description');
    await user.type(screen.getByLabelText('Timeframe'), 'Summer 2025');
    
    // Submit the form
    await user.click(screen.getByText('Create Project'));
    
    // Check if the project is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Summer 2025')).toBeInTheDocument();
    });
  });

  it('can cancel new project creation', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Navigate to the Custom Projects tab
    await user.click(screen.getByText('Custom Projects'));
    
    // Click on the New Project button
    await user.click(screen.getByText('+ New Project'));
    
    // Click the cancel button
    await user.click(screen.getByText('Cancel'));
    
    // Check that the form is no longer displayed
    await waitFor(() => {
      expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
      expect(screen.getByText('+ New Project')).toBeInTheDocument();
    });
  });
});