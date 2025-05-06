/**
 * Mock data for Dashboard components
 * Will be replaced with API calls in production
 */

export const mockUserData = {
  username: 'Jane Smith',
  location: 'Austin, TX',
  lawnType: 'Bermuda Grass',
  lawnSize: '2500 sq ft',
  goals: ['Greener Lawn', 'Reduce Weeds', 'Water Efficiency'],
  lawnHealth: 65, // Percentage value for progress tracking
  joinDate: '2025-04-15',
};

export const mockWeatherData = {
  current: {
    temp: 78,
    condition: 'Sunny',
    humidity: 45,
    windSpeed: 8,
    icon: 'sun',
  },
  forecast: [
    { day: 'Today', high: 78, low: 62, condition: 'Sunny', icon: 'sun' },
    { day: 'Tomorrow', high: 82, low: 65, condition: 'Partly Cloudy', icon: 'cloud-sun' },
    { day: 'Wednesday', high: 80, low: 63, condition: 'Cloudy', icon: 'cloud' },
    { day: 'Thursday', high: 75, low: 60, condition: '30% Rain', icon: 'cloud-rain' },
    { day: 'Friday', high: 73, low: 58, condition: 'Sunny', icon: 'sun' },
  ],
  rainfall: {
    last7Days: 0.8, // inches
    projected7Days: 0.5, // inches
  }
};

export const mockTasks = [
  {
    id: 1,
    title: 'Apply Spring Fertilizer',
    description: 'Apply a slow-release nitrogen fertilizer to promote healthy growth as your lawn exits dormancy.',
    dueDate: '2025-05-10',
    priority: 'high',
    category: 'fertilizing',
    isCompleted: false,
    icon: 'leaf',
  },
  {
    id: 2,
    title: 'Spot Treat Weeds',
    description: 'Use targeted herbicide on dandelions and crabgrass in the front lawn area.',
    dueDate: '2025-05-12',
    priority: 'medium',
    category: 'weed-control',
    isCompleted: false,
    icon: 'flower',
  },
  {
    id: 3,
    title: 'Mow at Recommended Height',
    description: 'For Bermuda grass, set your mower to 1.5-2 inches for optimal growth pattern.',
    dueDate: '2025-05-07',
    priority: 'medium',
    category: 'mowing',
    isCompleted: true,
    icon: 'cut',
  },
  {
    id: 4,
    title: 'Check Irrigation System',
    description: 'Test all sprinkler zones to ensure proper coverage before summer heat arrives.',
    dueDate: '2025-05-15',
    priority: 'low',
    category: 'watering',
    isCompleted: false,
    icon: 'droplet',
  },
  {
    id: 5,
    title: 'Aerate Compacted Areas',
    description: 'Aerate high-traffic regions of your lawn to improve water penetration and root growth.',
    dueDate: '2025-05-20',
    priority: 'medium',
    category: 'soil-health',
    isCompleted: false,
    icon: 'tool',
  }
];

export const mockProgressData = {
  timeframe: '3 months',
  improvement: 25, // percentage increase
  lastPhotoDate: '2025-04-30',
  problemAreas: [
    { id: 1, name: 'Shady corner', status: 'improving' },
    { id: 2, name: 'Dog spot damage', status: 'needs-attention' },
  ],
};