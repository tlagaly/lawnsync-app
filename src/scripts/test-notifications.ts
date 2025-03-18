const { addDays, subDays } = require('date-fns');
const nodeFetch = require('node-fetch');

interface TaskReminderData {
  taskName: string;
  scheduledDate: Date;
  userName: string;
  lawnLocation: string;
}

interface WeatherAlertData {
  userName: string;
  lawnLocation: string;
  condition: string;
  affectedTasks: Array<{
    name: string;
    scheduledDate: Date;
  }>;
}

interface WeeklySummaryData {
  userName: string;
  weekStartDate: Date;
  weekEndDate: Date;
  completedTasks: Array<{
    name: string;
    completedDate: Date;
    duration?: number;
  }>;
  upcomingTasks: Array<{
    name: string;
    scheduledDate: Date;
    priority: 'high' | 'medium' | 'low';
  }>;
  weatherForecast: {
    condition: string;
    temperature: string;
  };
}

interface CareRecommendationData {
  userName: string;
  grassType: string;
  season: string;
  recommendations: Array<{
    title: string;
    description: string;
    importance: 'essential' | 'recommended' | 'optional';
  }>;
  products?: Array<{
    name: string;
    description: string;
    purpose: string;
  }>;
}

// Example data for different notification types
const testData = {
  taskReminder: {
    taskName: 'Lawn Mowing',
    scheduledDate: addDays(new Date(), 1),
    userName: 'John',
    lawnLocation: '123 Garden Street',
  } as TaskReminderData,

  weatherAlert: {
    userName: 'John',
    lawnLocation: '123 Garden Street',
    condition: 'Heavy Rain Expected',
    affectedTasks: [
      {
        name: 'Lawn Mowing',
        scheduledDate: addDays(new Date(), 1),
      },
      {
        name: 'Fertilizer Application',
        scheduledDate: addDays(new Date(), 2),
      },
    ],
  } as WeatherAlertData,

  weeklySummary: {
    userName: 'John',
    weekStartDate: subDays(new Date(), 7),
    weekEndDate: new Date(),
    completedTasks: [
      {
        name: 'Lawn Mowing',
        completedDate: subDays(new Date(), 5),
        duration: 45,
      },
      {
        name: 'Weeding',
        completedDate: subDays(new Date(), 3),
        duration: 30,
      },
    ],
    upcomingTasks: [
      {
        name: 'Fertilizer Application',
        scheduledDate: addDays(new Date(), 2),
        priority: 'high',
      },
      {
        name: 'Edge Trimming',
        scheduledDate: addDays(new Date(), 4),
        priority: 'medium',
      },
    ],
    weatherForecast: {
      condition: 'Partly Cloudy',
      temperature: '72°F (22°C)',
    },
  } as WeeklySummaryData,

  careRecommendation: {
    userName: 'John',
    grassType: 'Kentucky Bluegrass',
    season: 'Spring',
    recommendations: [
      {
        title: 'First Mowing of the Season',
        description:
          'Set your mower height to 2.5-3 inches for the first cut to remove dead grass and promote new growth.',
        importance: 'essential',
      },
      {
        title: 'Pre-emergent Herbicide',
        description:
          'Apply when soil temperatures reach 50°F to prevent crabgrass and other weeds.',
        importance: 'recommended',
      },
      {
        title: 'Light Fertilization',
        description:
          'Apply a balanced fertilizer with an NPK ratio of 20-5-10 to support spring growth.',
        importance: 'essential',
      },
    ],
    products: [
      {
        name: 'Spring Starter Fertilizer',
        description: 'Balanced NPK fertilizer with added micronutrients',
        purpose: 'Promote healthy spring growth',
      },
      {
        name: 'Pre-emergent Herbicide',
        description: 'Season-long crabgrass prevention',
        purpose: 'Prevent weed germination',
      },
    ],
  } as CareRecommendationData,
};

async function sendTestNotification(type: string, data: any) {
  try {
    const response = await nodeFetch('http://localhost:3005/api/notifications/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data }),
    });

    const result = await response.json();
    console.log(`${type} notification result:`, result);
  } catch (error) {
    console.error(`Error sending ${type} notification:`, error);
  }
}

// Example usage:
async function runTests() {
  // Test task reminder
  await sendTestNotification('task_reminder', testData.taskReminder);

  // Test weather alert
  await sendTestNotification('weather_alert', testData.weatherAlert);

  // Test weekly summary
  await sendTestNotification('weekly_summary', testData.weeklySummary);

  // Test care recommendations
  await sendTestNotification(
    'care_recommendation',
    testData.careRecommendation
  );
}

// Run the tests
runTests().catch(console.error);