import React, { useState, useEffect, useRef } from 'react';
import './TaskCreationForm.css';
import { createScheduledTask, updateScheduledTask } from '../../../lib/taskSchedulerService';
import type { ScheduledTask } from '../../../types/scheduler';

// Helper function to get icon based on category
const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    'mowing': 'grass',
    'watering': 'droplet',
    'fertilizing': 'plant',
    'weed-control': 'herbicide',
    'soil-health': 'soil',
    'other': 'calendar'
  };
  
  return iconMap[category] || 'calendar';
};
import { mockUserData } from '../../dashboard/mockData';

interface TaskCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: ScheduledTask) => void;
  taskToEdit: ScheduledTask | null;
}

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  taskToEdit
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('mowing');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [recurrence, setRecurrence] = useState('one-time');
  const [isWeatherDependent, setIsWeatherDependent] = useState(false);
  const [lawnZone, setLawnZone] = useState('all');
  const [notes, setNotes] = useState('');
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const formRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with task data if in edit mode
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category || 'mowing');
      
      // Parse date and time from scheduledDate
      const taskDate = new Date(taskToEdit.scheduledDate);
      setDate(taskDate.toISOString().split('T')[0]);
      setTime(taskDate.toTimeString().slice(0, 5));
      
      setPriority(taskToEdit.priority || 'medium');
      // Use optional chaining for properties not in the interface
      // These are new properties we're adding but aren't in the ScheduledTask interface yet
      setRecurrence(taskToEdit.category === 'recurring' ? 'weekly' : 'one-time');
      setIsWeatherDependent(!!taskToEdit.weatherCondition);
      setLawnZone('all'); // Default value since it's not in the interface
      setNotes(''); // Default value since it's not in the interface
    } else {
      // Set default values for new task
      resetForm();
      // Set default date to today
      const today = new Date();
      setDate(today.toISOString().split('T')[0]);
      setTime('09:00');
    }
  }, [taskToEdit, isOpen]);

  // Focus the title input when form opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle click outside to close (with focus trap)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Trap focus within the modal for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      if (e.key !== 'Tab' || !formRef.current) return;
      
      const focusableElements = formRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      // If shift + tab and on first element, wrap to last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // If tab and on last element, wrap to first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('mowing');
    setPriority('medium');
    setRecurrence('one-time');
    setIsWeatherDependent(false);
    setLawnZone('all');
    setNotes('');
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(`${date}T${time || '00:00'}`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }
    
    if (!time) {
      newErrors.time = 'Time is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the scheduled date (combine date and time)
      const scheduledDate = new Date(`${date}T${time}`);
      
      // Prepare task data that conforms to the ScheduledTask interface
      const taskData = {
        title,
        description,
        // Set category based on recurrence
        category: recurrence === 'one-time' ? category : 'recurring',
        scheduledDate: scheduledDate.toISOString(),
        dueDate: scheduledDate.toISOString(), // Set dueDate same as scheduledDate
        priority: priority as 'high' | 'medium' | 'low',
        isCompleted: false,
        isWeatherAppropriate: true, // This will be determined by the service
        icon: getCategoryIcon(category),
        // Only add weather condition if the task is weather dependent
        ...(isWeatherDependent && { weatherCondition: 'optimal' })
      };
      
      let result;
      
      if (taskToEdit) {
        // Update existing task - ensure we satisfy the ScheduledTask interface
        result = await updateScheduledTask({
          ...taskData,
          id: taskToEdit.id
        } as ScheduledTask);
      } else {
        // Create new task - ensure we satisfy the Omit<ScheduledTask, 'id'> interface
        result = await createScheduledTask(taskData as Omit<ScheduledTask, 'id'>);
      }
      
      if (result) {
        setSuccessMessage(taskToEdit ? 'Task updated successfully!' : 'Task created successfully!');
        onTaskCreated(result);
        
        // Close the form after a short delay
        setTimeout(() => {
          onClose();
          resetForm();
          setSuccessMessage('');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      setErrors({ submit: 'Failed to save task. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="task-creation-modal" ref={formRef}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="form-fields">
            {/* Title */}
            <div className={`form-field ${errors.title ? 'form-field-error' : ''}`}>
              <label htmlFor="task-title">
                Task Title <span className="required">*</span>
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                ref={titleInputRef}
              />
              {errors.title && <div className="error-message">{errors.title}</div>}
            </div>
            
            {/* Description */}
            <div className="form-field">
              <label htmlFor="task-description">Description</label>
              <textarea
                id="task-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
              />
            </div>
            
            {/* Category */}
            <div className="form-field">
              <label htmlFor="task-category">Category</label>
              <select
                id="task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="mowing">Mowing</option>
                <option value="watering">Watering</option>
                <option value="fertilizing">Fertilizing</option>
                <option value="weed-control">Weed Control</option>
                <option value="soil-health">Soil Health</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            {/* Date and Time */}
            <div className="form-field">
              <label>
                Date and Time <span className="required">*</span>
              </label>
              <div className="date-time-container">
                <div className={`date-input ${errors.date ? 'form-field-error' : ''}`}>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.date && <div className="error-message">{errors.date}</div>}
                </div>
                <div className={`time-input ${errors.time ? 'form-field-error' : ''}`}>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                  {errors.time && <div className="error-message">{errors.time}</div>}
                </div>
              </div>
            </div>
            
            {/* Priority */}
            <div className="form-field">
              <label>Priority Level</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="priority"
                    value="high"
                    checked={priority === 'high'}
                    onChange={() => setPriority('high')}
                  />
                  <span className="radio-text high-priority">High</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="priority"
                    value="medium"
                    checked={priority === 'medium'}
                    onChange={() => setPriority('medium')}
                  />
                  <span className="radio-text medium-priority">Medium</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="priority"
                    value="low"
                    checked={priority === 'low'}
                    onChange={() => setPriority('low')}
                  />
                  <span className="radio-text low-priority">Low</span>
                </label>
              </div>
            </div>
            
            {/* Recurrence */}
            <div className="form-field">
              <label>Recurrence</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="recurrence"
                    value="one-time"
                    checked={recurrence === 'one-time'}
                    onChange={() => setRecurrence('one-time')}
                  />
                  <span className="radio-text">One-time</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="recurrence"
                    value="daily"
                    checked={recurrence === 'daily'}
                    onChange={() => setRecurrence('daily')}
                  />
                  <span className="radio-text">Daily</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="recurrence"
                    value="weekly"
                    checked={recurrence === 'weekly'}
                    onChange={() => setRecurrence('weekly')}
                  />
                  <span className="radio-text">Weekly</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="recurrence"
                    value="monthly"
                    checked={recurrence === 'monthly'}
                    onChange={() => setRecurrence('monthly')}
                  />
                  <span className="radio-text">Monthly</span>
                </label>
              </div>
            </div>
            
            {/* Weather Dependency */}
            <div className="form-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isWeatherDependent}
                  onChange={(e) => setIsWeatherDependent(e.target.checked)}
                />
                <span className="checkbox-text">This task depends on weather conditions</span>
              </label>
            </div>
            
            {/* Lawn Zone */}
            <div className="form-field">
              <label htmlFor="lawn-zone">Lawn Zone</label>
              <select
                id="lawn-zone"
                value={lawnZone}
                onChange={(e) => setLawnZone(e.target.value)}
              >
                <option value="all">All Zones</option>
                <option value="front">Front Yard</option>
                <option value="back">Back Yard</option>
                <option value="side">Side Yard</option>
                <option value="garden">Garden</option>
              </select>
            </div>
            
            {/* Notes */}
            <div className="form-field">
              <label htmlFor="task-notes">Notes</label>
              <textarea
                id="task-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes"
              />
            </div>
            
            {/* Form-level errors */}
            {errors.submit && <div className="error-message">{errors.submit}</div>}
          </form>
        </div>
        
        {/* Modal Footer */}
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Saving...' 
              : taskToEdit 
                ? 'Save Changes' 
                : 'Create Task'
            }
          </button>
        </div>
        
        {/* Success Toast */}
        {successMessage && (
          <div className={`toast toast-success ${successMessage ? 'toast-visible' : ''}`}>
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCreationForm;