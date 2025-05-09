import React, { useState, useEffect } from 'react';
import './TasksProjectsContainer.css';
import TaskScheduler from '../maintain/components/TaskScheduler';
import SeasonalTasks from '../maintain/components/SeasonalTasks';
import colors from '../../theme/foundations/colors';
import { getScheduledTasks } from '../../lib/taskSchedulerService';
import type { ScheduledTask } from '../../types/scheduler';
import { mockUserData } from '../dashboard/mockData';

/**
 * ProjectCard Component
 *
 * Reusable component for displaying both system-generated seasonal projects
 * and user-created custom projects
 */
interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  completedTasks: number;
  totalTasks: number;
  type: 'seasonal' | 'custom';
  onSelect: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  timeframe,
  completedTasks,
  totalTasks,
  type,
  onSelect
}) => {
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks * 100) : 0;
  
  return (
    <div
      className={`project-card ${type}-project`}
      onClick={onSelect}
    >
      <div className="project-card-header">
        <div className="project-title-container">
          <h3>{title}</h3>
          <span className="project-timeframe">{timeframe}</span>
        </div>
        <div className="project-badge">{type === 'seasonal' ? 'Seasonal' : 'Custom'}</div>
      </div>
      
      <p className="project-description">{description}</p>
      
      <div className="project-progress">
        <div className="progress-text">
          {completedTasks} of {totalTasks} tasks completed
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

/**
 * NewProjectForm Component
 *
 * Form for creating a new custom project
 */
interface NewProjectFormProps {
  onSubmit: (projectData: {name: string; description: string; timeframe: string}) => void;
  onCancel: () => void;
}

const NewProjectForm: React.FC<NewProjectFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [timeframe, setTimeframe] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, timeframe });
  };
  
  return (
    <div className="new-project-form-container">
      <h3>Create New Project</h3>
      
      <form className="new-project-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="project-name">Project Name</label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Backyard Renovation"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="project-description">Description</label>
          <textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your project goals"
            rows={3}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="project-timeframe">Timeframe</label>
          <input
            id="project-timeframe"
            type="text"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            placeholder="e.g., May-June 2025"
            required
          />
        </div>
        
        <div className="form-buttons">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * TasksProjectsContainer Component
 *
 * Combines tasks, scheduling, and project management features
 * Merges elements from previous Maintain and Track sections
 */
const TasksProjectsContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'seasonal' | 'custom'>('daily');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [allTasks, setAllTasks] = useState<ScheduledTask[]>([]);
  const [customProjects, setCustomProjects] = useState<any[]>([
    {
      id: 'custom-1',
      title: 'Front Yard Renovation',
      description: 'Complete overhaul of front yard including new sod, flower beds, and irrigation',
      timeframe: 'Spring-Summer 2025',
      completedTasks: 2,
      totalTasks: 8,
      tasks: []
    }
  ]);
  
  // Fetch tasks when component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasks = await getScheduledTasks();
        setAllTasks(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    
    fetchTasks();
  }, []);
  
  // Handle creating a new custom project
  const handleCreateProject = (projectData: {name: string; description: string; timeframe: string}) => {
    const newProject = {
      id: `custom-${customProjects.length + 1}`,
      title: projectData.name,
      description: projectData.description,
      timeframe: projectData.timeframe,
      completedTasks: 0,
      totalTasks: 0,
      tasks: []
    };
    
    setCustomProjects([...customProjects, newProject]);
    setShowNewProjectForm(false);
    // Switch to the custom projects tab to show the new project
    setActiveTab('custom');
  };
  
  return (
    <div className="tasks-projects-container">
      <div className="tasks-projects-header">
        <h1>Tasks & Projects</h1>
        <p className="subtitle">Manage your lawn care schedule and projects</p>
      </div>
      
      {/* Tabbed Navigation */}
      <div className="tasks-projects-tabs">
        <button
          className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          Daily & Weekly Tasks
        </button>
        <button
          className={`tab-button ${activeTab === 'seasonal' ? 'active' : ''}`}
          onClick={() => setActiveTab('seasonal')}
        >
          Seasonal Projects
        </button>
        <button
          className={`tab-button ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          Custom Projects
        </button>
      </div>
      
      <div className="tasks-projects-content">
        {/* Daily & Weekly Tasks Tab */}
        {activeTab === 'daily' && (
          <div className="daily-tasks-container">
            <div className="section-header">
              <h2>Task Calendar</h2>
            </div>
            <TaskScheduler />
          </div>
        )}
        
        {/* Seasonal Projects Tab */}
        {activeTab === 'seasonal' && (
          <div className="seasonal-projects-container">
            <div className="section-header">
              <h2>Seasonal Lawn Projects</h2>
            </div>
            <SeasonalTasks />
          </div>
        )}
        
        {/* Custom Projects Tab */}
        {activeTab === 'custom' && (
          <div className="custom-projects-container">
            <div className="section-header">
              <h2>Custom Lawn Projects</h2>
              {!showNewProjectForm && (
                <button
                  className="new-project-button"
                  onClick={() => setShowNewProjectForm(true)}
                >
                  + New Project
                </button>
              )}
            </div>
            
            {showNewProjectForm ? (
              <NewProjectForm
                onSubmit={handleCreateProject}
                onCancel={() => setShowNewProjectForm(false)}
              />
            ) : (
              <>
                {customProjects.length === 0 ? (
                  <div className="no-projects-message">
                    <p>You don't have any custom projects yet.</p>
                    <p>Create a project to organize related lawn care tasks and track your progress.</p>
                  </div>
                ) : (
                  <div className="projects-grid">
                    {customProjects.map(project => (
                      <ProjectCard
                        key={project.id}
                        id={project.id}
                        title={project.title}
                        description={project.description}
                        timeframe={project.timeframe}
                        completedTasks={project.completedTasks}
                        totalTasks={project.totalTasks}
                        type="custom"
                        onSelect={() => console.log('Selected project:', project.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksProjectsContainer;