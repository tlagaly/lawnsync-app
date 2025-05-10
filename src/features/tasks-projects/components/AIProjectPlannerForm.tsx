import React, { useState, useEffect, useRef } from 'react';
import './AIProjectPlannerForm.css';
import { getLawnProfile, getLawnZones } from '../../../lib/lawnService';
import type { LawnProfile, LawnZone, GrassType, SoilType } from '../../../types/lawn';
import type { ScheduledTask } from '../../../types/scheduler';

// Project goal options
interface ProjectGoal {
  id: string;
  title: string;
  description: string;
  difficulty: number; // 1-3
  timeframe: string;
  recommendedGrassTypes?: GrassType[];
  recommendedSoilTypes?: SoilType[];
  seasonalTiming?: string;
  tasks: ProjectTask[];
}

// Project task template
interface ProjectTask {
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: string;
  weatherDependent: boolean;
  seasonRecommended?: 'spring' | 'summer' | 'fall' | 'winter' | 'any';
  requiredMaterials?: string[];
}

// The available project goals that users can select from
const PROJECT_GOALS: ProjectGoal[] = [
  {
    id: 'lawn-renovation',
    title: 'Complete Lawn Renovation',
    description: 'Transform your lawn with a full renovation including soil preparation, seeding, and establishing a new lawn.',
    difficulty: 3,
    timeframe: '2-3 months',
    seasonalTiming: 'Best started in early fall or spring',
    tasks: [
      {
        title: 'Soil Testing',
        description: 'Test soil pH and nutrient levels to determine amendments needed',
        category: 'soil-health',
        priority: 'high',
        estimatedDuration: '1 day',
        weatherDependent: false
      },
      {
        title: 'Kill Existing Lawn',
        description: 'Apply non-selective herbicide to remove existing grass and weeds',
        category: 'weed-control',
        priority: 'high',
        estimatedDuration: '1-2 weeks',
        weatherDependent: true
      },
      {
        title: 'Remove Dead Turf',
        description: 'Remove dead grass and debris to prepare for soil amendments',
        category: 'other',
        priority: 'medium',
        estimatedDuration: '1-2 days',
        weatherDependent: false
      },
      {
        title: 'Till and Grade Soil',
        description: 'Till soil to 4-6 inches deep and grade for proper drainage',
        category: 'soil-health',
        priority: 'high',
        estimatedDuration: '1-2 days',
        weatherDependent: false
      },
      {
        title: 'Apply Soil Amendments',
        description: 'Add compost, lime, or other amendments based on soil test',
        category: 'soil-health',
        priority: 'high',
        estimatedDuration: '1 day',
        weatherDependent: false
      },
      {
        title: 'Seed or Sod Installation',
        description: 'Apply grass seed or install sod appropriate for your region',
        category: 'other',
        priority: 'high',
        estimatedDuration: '1 day',
        weatherDependent: true
      },
      {
        title: 'Initial Watering',
        description: 'Keep soil consistently moist during germination period',
        category: 'watering',
        priority: 'high',
        estimatedDuration: '2-3 weeks',
        weatherDependent: true
      },
      {
        title: 'First Mowing',
        description: 'Perform first mowing when new grass reaches 3-4 inches',
        category: 'mowing',
        priority: 'medium',
        estimatedDuration: '1 day',
        weatherDependent: true
      }
    ]
  },
  {
    id: 'fix-bare-spots',
    title: 'Fix Bare Patches',
    description: 'Repair bare or thin areas in your lawn with proper soil preparation and seeding.',
    difficulty: 1,
    timeframe: '2-4 weeks',
    seasonalTiming: 'Early fall or spring',
    tasks: [
      {
        title: 'Identify Bare Areas',
        description: 'Mark all areas needing repair and determine total square footage',
        category: 'other',
        priority: 'medium',
        estimatedDuration: '1 hour',
        weatherDependent: false
      },
      {
        title: 'Remove Dead Grass',
        description: 'Clear dead grass and debris from bare patches',
        category: 'other',
        priority: 'medium',
        estimatedDuration: '1-2 hours',
        weatherDependent: false
      },
      {
        title: 'Loosen Soil',
        description: 'Loosen top 1-2 inches of soil in bare patches',
        category: 'soil-health',
        priority: 'high', 
        estimatedDuration: '1-2 hours',
        weatherDependent: false
      },
      {
        title: 'Add Topsoil Mix',
        description: 'Apply thin layer of topsoil/compost mixture',
        category: 'soil-health',
        priority: 'high',
        estimatedDuration: '1-2 hours',
        weatherDependent: false
      },
      {
        title: 'Apply Seed',
        description: 'Spread grass seed appropriate for your lawn type',
        category: 'other',
        priority: 'high',
        estimatedDuration: '1 hour',
        weatherDependent: false
      },
      {
        title: 'Water Seeded Areas',
        description: 'Keep seeded areas consistently moist until established',
        category: 'watering',
        priority: 'high',
        estimatedDuration: '10-14 days',
        weatherDependent: true
      }
    ]
  },
  {
    id: 'weed-control-plan',
    title: 'Comprehensive Weed Control',
    description: 'Develop and implement a season-long weed control strategy for a cleaner, healthier lawn.',
    difficulty: 2,
    timeframe: '3-6 months',
    seasonalTiming: 'Begin in early spring',
    tasks: [
      {
        title: 'Weed Identification',
        description: 'Identify types of weeds present in your lawn',
        category: 'weed-control',
        priority: 'high',
        estimatedDuration: '1 day',
        weatherDependent: false
      },
      {
        title: 'Apply Pre-emergent Herbicide',
        description: 'Apply pre-emergent herbicide to prevent crabgrass and other annual weeds',
        category: 'weed-control',
        priority: 'high',
        estimatedDuration: '1 day',
        weatherDependent: true,
        seasonRecommended: 'spring'
      },
      {
        title: 'Spot-treat Broadleaf Weeds',
        description: 'Apply selective herbicide to visible broadleaf weeds',
        category: 'weed-control',
        priority: 'medium',
        estimatedDuration: '1 day',
        weatherDependent: true
      },
      {
        title: 'Adjust Mowing Height',
        description: 'Raise mowing height to 3-4 inches to shade out weed seedlings',
        category: 'mowing',
        priority: 'medium',
        estimatedDuration: 'Ongoing',
        weatherDependent: false
      },
      {
        title: 'Apply Second Pre-emergent',
        description: 'Apply second round of pre-emergent for extended protection',
        category: 'weed-control',
        priority: 'medium',
        estimatedDuration: '1 day',
        weatherDependent: true,
        seasonRecommended: 'summer'
      },
      {
        title: 'Fall Weed Control',
        description: 'Apply broadleaf weed control in fall when weeds are actively growing',
        category: 'weed-control',
        priority: 'high',
        estimatedDuration: '1 day',
        weatherDependent: true,
        seasonRecommended: 'fall'
      }
    ]
  },
  {
    id: 'fertilization-program',
    title: 'Seasonal Fertilization Program',
    description: 'Establish a year-round fertilization schedule tailored to your lawn type and regional conditions.',
    difficulty: 2,
    timeframe: 'Ongoing (1 year)',
    seasonalTiming: 'Year-round with seasonal applications',
    tasks: [
      {
        title: 'Soil Testing',
        description: 'Test soil to determine nutrient needs and pH level',
        category: 'soil-health',
        priority: 'high',
        estimatedDuration: '1 day',
        weatherDependent: false
      },
      {
        title: 'Early Spring Fertilization',
        description: 'Apply light nitrogen fertilizer to promote initial green-up',
        category: 'fertilizing',
        priority: 'medium',
        estimatedDuration: '1 day',
        weatherDependent: true,
        seasonRecommended: 'spring'
      },
      {
        title: 'Late Spring Fertilization',
        description: 'Apply slow-release fertilizer with weed control',
        category: 'fertilizing',
        priority: 'high',
        estimatedDuration: '1 day',
        weatherDependent: true,
        seasonRecommended: 'spring'
      },
      {
        title: 'Summer Fertilization',
        description: 'Apply light fertilizer application if needed (cool-season grasses may skip)',
        category: 'fertilizing',
        priority: 'low',
        estimatedDuration: '1 day',
        weatherDependent: true,
        seasonRecommended: 'summer'
      },
      {
        title: 'Early Fall Fertilization',
        description: 'Apply balanced fertilizer to promote recovery from summer stress',
        category: 'fertilizing',
        priority: 'high',
        estimatedDuration: '1 day',
        weatherDependent: true,
        seasonRecommended: 'fall'
      },
      {
        title: 'Late Fall Fertilization',
        description: 'Apply winterizer fertilizer high in potassium',
        category: 'fertilizing',
        priority: 'high',
        estimatedDuration: '1 day',
        weatherDependent: true,
        seasonRecommended: 'fall'
      }
    ]
  },
  {
    id: 'lawn-aeration',
    title: 'Lawn Aeration & Overseeding',
    description: 'Reduce soil compaction and thicken your lawn by aerating and overseeding.',
    difficulty: 2,
    timeframe: '3-4 weeks',
    seasonalTiming: 'Early fall for cool-season grasses, late spring for warm-season',
    tasks: [
      {
        title: 'Prepare Lawn',
        description: 'Mow lawn shorter than usual and remove clippings',
        category: 'mowing',
        priority: 'medium',
        estimatedDuration: '1 day',
        weatherDependent: true
      },
      {
        title: 'Mark Sprinkler Heads/Utilities',
        description: 'Mark sprinkler heads and shallow utilities to avoid damage',
        category: 'other',
        priority: 'high',
        estimatedDuration: '1 hour',
        weatherDependent: false
      },
      {
        title: 'Core Aeration',
        description: 'Perform core aeration using rental equipment or service',
        category: 'soil-health',
        priority: 'high',
        estimatedDuration: '1 day',
        weatherDependent: true
      },
      {
        title: 'Apply Compost (Optional)',
        description: 'Spread thin layer of compost over lawn to improve soil',
        category: 'soil-health',
        priority: 'low',
        estimatedDuration: '1 day',
        weatherDependent: false
      },
      {
        title: 'Overseeding',
        description: 'Apply appropriate grass seed for your lawn type',
        category: 'other',
        priority: 'high',
        estimatedDuration: '1 day',
        weatherDependent: false
      },
      {
        title: 'Apply Starter Fertilizer',
        description: 'Apply starter fertilizer to promote seedling growth',
        category: 'fertilizing',
        priority: 'high',
        estimatedDuration: '1 day',
        weatherDependent: false
      },
      {
        title: 'Water New Seed',
        description: 'Keep seeded areas consistently moist until germination',
        category: 'watering',
        priority: 'high',
        estimatedDuration: '10-14 days',
        weatherDependent: true
      }
    ]
  },
  {
    id: 'drought-resistant',
    title: 'Drought-Resistant Lawn Conversion',
    description: 'Transform your lawn to be more water-efficient and drought-tolerant.',
    difficulty: 3,
    timeframe: '2-3 months',
    seasonalTiming: 'Spring or fall',
    tasks: [
      {
        title: 'Research Drought-Tolerant Grasses',
        description: 'Select appropriate drought-resistant grass varieties for your region',
        category: 'other',
        priority: 'high',
        estimatedDuration: '1 week',
        weatherDependent: false
      },
      {
        title: 'Remove Existing Lawn',
        description: 'Remove portions of existing lawn to be replaced',
        category: 'other',
        priority: 'high',
        estimatedDuration: '1-2 days',
        weatherDependent: false
      },
      {
        title: 'Improve Soil',
        description: 'Amend soil with compost and water-retaining materials',
        category: 'soil-health',
        priority: 'high',
        estimatedDuration: '1-2 days',
        weatherDependent: false
      },
      {
        title: 'Install Efficient Irrigation',
        description: 'Install or update irrigation to drip or high-efficiency system',
        category: 'watering',
        priority: 'high',
        estimatedDuration: '1-2 days',
        weatherDependent: false
      },
      {
        title: 'Plant Drought-Tolerant Grass',
        description: 'Seed or sod with selected drought-resistant varieties',
        category: 'other',
        priority: 'high',
        estimatedDuration: '1 day',
        weatherDependent: true
      },
      {
        title: 'Apply Mulch in Transition Areas',
        description: 'Apply mulch around edges and in transition zones',
        category: 'soil-health',
        priority: 'medium',
        estimatedDuration: '1 day',
        weatherDependent: false
      },
      {
        title: 'Establish Watering Schedule',
        description: 'Create deep, infrequent watering schedule to promote deep root growth',
        category: 'watering',
        priority: 'high',
        estimatedDuration: 'Ongoing',
        weatherDependent: true
      }
    ]
  }
];

interface AIProjectPlannerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectData: any) => void;
}

const AIProjectPlannerForm: React.FC<AIProjectPlannerFormProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  // Wizard step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Form state
  const [selectedGoal, setSelectedGoal] = useState<ProjectGoal | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectTimeframe, setProjectTimeframe] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState('');
  
  // Lawn data
  const [lawnProfile, setLawnProfile] = useState<LawnProfile | null>(null);
  const [lawnZones, setLawnZones] = useState<LawnZone[]>([]);
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const formRef = useRef<HTMLDivElement>(null);
  
  // Load lawn profile data when component mounts
  useEffect(() => {
    const fetchLawnData = async () => {
      try {
        const profile = await getLawnProfile();
        if (profile) {
          setLawnProfile(profile);
          setLawnZones(profile.zones);
        }
      } catch (error) {
        console.error('Error fetching lawn data:', error);
      }
    };
    
    if (isOpen) {
      fetchLawnData();
    }
  }, [isOpen]);
  
  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);
  
  // Update project description when a goal is selected
  useEffect(() => {
    if (selectedGoal) {
      setProjectName(`${selectedGoal.title} Project`);
      setProjectDescription(selectedGoal.description);
      setProjectTimeframe(selectedGoal.timeframe);
      
      // Pre-select all tasks by default
      const taskTitles = selectedGoal.tasks.map(task => task.title);
      setSelectedTasks(taskTitles);
    }
  }, [selectedGoal]);
  
  // Handle click outside to close
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
  
  // Reset form to initial state
  const resetForm = () => {
    setCurrentStep(1);
    setSelectedGoal(null);
    setProjectName('');
    setProjectDescription('');
    setProjectTimeframe('');
    setSelectedZone('all');
    setSelectedTasks([]);
    setCustomNotes('');
    setErrors({});
  };
  
  // Validate current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!selectedGoal) {
        newErrors.goal = 'Please select a lawn project goal';
      }
    } else if (currentStep === 2) {
      if (!projectName.trim()) {
        newErrors.projectName = 'Project name is required';
      }
      if (!projectTimeframe.trim()) {
        newErrors.projectTimeframe = 'Timeframe is required';
      }
    } else if (currentStep === 3) {
      if (selectedTasks.length === 0) {
        newErrors.tasks = 'Please select at least one task';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Generate recommendations based on lawn profile and selected goal
  const generateRecommendations = (): ProjectTask[] => {
    if (!selectedGoal) return [];
    
    const recommendations = [...selectedGoal.tasks];
    
    // Personalize recommendations based on lawn profile data
    if (lawnProfile) {
      // Example: Check if we have the right grass type for this project
      const primaryGrassType = lawnProfile.grassTypes[0]?.type;
      
      // Example: Check soil type compatibility
      const primarySoilType = lawnProfile.soilType;
      
      // Add specific recommendations based on profile data
      if (selectedGoal.id === 'lawn-renovation' && primarySoilType === 'clay') {
        recommendations.push({
          title: 'Add Sand to Clay Soil',
          description: 'Mix sand with clay soil to improve drainage for new lawn',
          category: 'soil-health',
          priority: 'high',
          estimatedDuration: '1 day',
          weatherDependent: false
        });
      }
      
      if (selectedGoal.id === 'drought-resistant' && primaryGrassType === 'kentucky-bluegrass') {
        recommendations.push({
          title: 'Gradual Transition Plan',
          description: 'Create plan for gradual transition from high-water Kentucky Bluegrass',
          category: 'other',
          priority: 'high',
          estimatedDuration: '1 day',
          weatherDependent: false
        });
      }
    }
    
    return recommendations;
  };
  
  // Toggle task selection
  const toggleTaskSelection = (taskTitle: string) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskTitle)) {
        return prev.filter(title => title !== taskTitle);
      } else {
        return [...prev, taskTitle];
      }
    });
  };
  
  // Handle project creation
  const handleCreateProject = async () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!selectedGoal) {
        throw new Error('No goal selected');
      }
      
      // Filter tasks to only include selected ones
      const finalTasks = selectedGoal.tasks
        .filter(task => selectedTasks.includes(task.title))
        .map(task => ({
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          isCompleted: false,
          dueDate: '', // Will be calculated on the next step
          scheduledDate: '', // Will be calculated on the next step
          isWeatherAppropriate: !task.weatherDependent,
          icon: getTaskIcon(task.category),
          weatherCondition: task.weatherDependent ? 'optimal' : undefined
        }));
      
      // Create project data
      const projectData = {
        id: `project-${Date.now()}`,
        title: projectName,
        description: projectDescription,
        timeframe: projectTimeframe,
        tasks: finalTasks,
        completedTasks: 0,
        totalTasks: finalTasks.length,
        type: 'custom',
        zone: selectedZone,
        notes: customNotes,
        createdAt: new Date().toISOString(),
        goalType: selectedGoal.id
      };
      
      // Call the onProjectCreated callback with the project data
      onProjectCreated(projectData);
      
      setSuccessMessage('Project created successfully!');
      
      // Close the form after a short delay
      setTimeout(() => {
        onClose();
        resetForm();
        setSuccessMessage('');
      }, 1500);
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({ submit: 'Failed to create project. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get icon for task category
  const getTaskIcon = (category: string): string => {
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
  
  // Calculate progress percentage
  const calculateProgress = (): number => {
    return ((currentStep - 1) / (totalSteps - 1)) * 100;
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="ai-planner-modal-backdrop">
      <div className="ai-planner-modal" ref={formRef}>
        {/* Modal Header */}
        <div className="ai-planner-header">
          <h2 className="ai-planner-title">
            Create AI-Assisted Lawn Project
            <span className="ai-badge">
              <span className="ai-icon">✨</span> AI Enhanced
            </span>
          </h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        {/* Wizard Steps */}
        <div className="wizard-steps">
          <div className={`wizard-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Select Goal</div>
          </div>
          <div className={`wizard-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Customize</div>
          </div>
          <div className={`wizard-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Tasks</div>
          </div>
          <div className={`wizard-step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Review</div>
          </div>
          <div className="wizard-progress-bar">
            <div className="wizard-progress" style={{ width: `${calculateProgress()}%` }}></div>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="ai-planner-body">
          {/* Step 1: Goal Selection */}
          {currentStep === 1 && (
            <div className="step-content">
              <h3>Select Your Lawn Project Goal</h3>
              <p>Choose a goal for your lawn project. Our AI will recommend a customized task plan.</p>
              
              {errors.goal && <div className="error-message">{errors.goal}</div>}
              
              <div className="goal-cards-container">
                {PROJECT_GOALS.map(goal => (
                  <div 
                    key={goal.id}
                    className={`goal-card ${selectedGoal?.id === goal.id ? 'selected' : ''}`}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <h4 className="goal-card-title">{goal.title}</h4>
                    <p className="goal-card-description">{goal.description}</p>
                    <div className="goal-card-difficulty">
                      <span className="difficulty-label">Difficulty:</span>
                      <div className="difficulty-indicator">
                        <span className={`difficulty-dot ${goal.difficulty >= 1 ? 'filled' : ''}`}></span>
                        <span className={`difficulty-dot ${goal.difficulty >= 2 ? 'filled' : ''}`}></span>
                        <span className={`difficulty-dot ${goal.difficulty >= 3 ? 'filled' : ''}`}></span>
                      </div>
                    </div>
                    <div className="goal-card-timeframe">
                      <span className="timeframe-label">Timeframe: </span>
                      <span className="timeframe-value">{goal.timeframe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 2: Project Customization */}
          {currentStep === 2 && selectedGoal && (
            <div className="step-content">
              <h3>Customize Your Project</h3>
              <p>Tailor your {selectedGoal.title.toLowerCase()} project to your specific needs.</p>
              
              <div className="form-fields">
                <div className={`form-field ${errors.projectName ? 'form-field-error' : ''}`}>
                  <label htmlFor="project-name">
                    Project Name <span className="required">*</span>
                  </label>
                  <input
                    id="project-name"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                  />
                  {errors.projectName && <div className="error-message">{errors.projectName}</div>}
                </div>
                
                <div className="form-field">
                  <label htmlFor="project-description">Description</label>
                  <textarea
                    id="project-description"
                    rows={3}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Enter project description"
                  />
                </div>
                
                <div className={`form-field ${errors.projectTimeframe ? 'form-field-error' : ''}`}>
                  <label htmlFor="project-timeframe">
                    Timeframe <span className="required">*</span>
                  </label>
                  <input
                    id="project-timeframe"
                    type="text"
                    value={projectTimeframe}
                    onChange={(e) => setProjectTimeframe(e.target.value)}
                    placeholder="e.g., Spring 2025, 2-3 weeks"
                  />
                  {errors.projectTimeframe && <div className="error-message">{errors.projectTimeframe}</div>}
                </div>
                
                <div className="form-field">
                  <label htmlFor="project-zone">Lawn Zone</label>
                  <select
                    id="project-zone"
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                  >
                    <option value="all">All Zones</option>
                    {lawnZones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-field">
                  <label htmlFor="project-notes">Additional Notes</label>
                  <textarea
                    id="project-notes"
                    rows={3}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Add any specific requirements or notes"
                  />
                </div>
              </div>
              
              {selectedGoal?.seasonalTiming && (
                <div className="info-box">
                  <strong>Timing Recommendation:</strong> {selectedGoal.seasonalTiming}
                </div>
              )}
            </div>
          )}
          
          {/* Step 3: Task Selection */}
          {currentStep === 3 && selectedGoal && (
            <div className="step-content">
              <h3>AI-Recommended Tasks</h3>
              <p>These tasks are personalized based on your lawn profile and selected goal. Select the tasks you want to include.</p>
              
              {errors.tasks && <div className="error-message">{errors.tasks}</div>}
              
              <div className="task-recommendations">
                {generateRecommendations().map((task, index) => (
                  <div key={index} className="recommendation-item">
                    <div className="recommendation-header">
                      <h4 className="recommendation-title">{task.title}</h4>
                      <label className="recommendation-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.title)}
                          onChange={() => toggleTaskSelection(task.title)}
                        />
                        <span>Include</span>
                      </label>
                    </div>
                    <p className="recommendation-description">{task.description}</p>
                    <div className="recommendation-meta">
                      <span className="recommendation-tag">
                        {task.priority === 'high' ? '🔴 High Priority' : 
                          task.priority === 'medium' ? '🟠 Medium Priority' : 
                          '🟢 Low Priority'}
                      </span>
                      <span className="recommendation-tag">
                        {task.estimatedDuration}
                      </span>
                      {task.weatherDependent && (
                        <span className="recommendation-tag">
                          ☀️ Weather Dependent
                        </span>
                      )}
                      {task.seasonRecommended && (
                        <span className="recommendation-tag">
                          {task.seasonRecommended === 'spring' ? '🌱 Spring' :
                            task.seasonRecommended === 'summer' ? '☀️ Summer' :
                            task.seasonRecommended === 'fall' ? '🍂 Fall' :
                            task.seasonRecommended === 'winter' ? '❄️ Winter' :
                            '🌿 Any Season'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 4: Review & Create */}
          {currentStep === 4 && selectedGoal && (
            <div className="step-content">
              <h3>Review & Create Project</h3>
              <p>Review your project details before creating.</p>
              
              <div className="summary-section">
                <h3>Project Summary</h3>
                <div className="summary-item">
                  <div className="summary-label">Name:</div>
                  <div className="summary-value">{projectName}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Goal:</div>
                  <div className="summary-value">{selectedGoal.title}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Timeframe:</div>
                  <div className="summary-value">{projectTimeframe}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Lawn Zone:</div>
                  <div className="summary-value">
                    {selectedZone === 'all' 
                      ? 'All Zones' 
                      : lawnZones.find(zone => zone.id === selectedZone)?.name || 'Unknown Zone'}
                  </div>
                </div>
                <div className="task-count">
                  Selected {selectedTasks.length} of {selectedGoal.tasks.length} recommended tasks
                </div>
              </div>
              
              {errors.submit && <div className="error-message">{errors.submit}</div>}
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="ai-planner-footer">
          <div className="ai-planner-footer-left">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handlePrevStep}
              >
                Back
              </button>
            )}
          </div>
          
          <div className="ai-planner-footer-right">
            {currentStep < totalSteps ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNextStep}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateProject}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            )}
          </div>
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

export default AIProjectPlannerForm;