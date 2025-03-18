const { addDays, subDays } = require('date-fns');
const nodeFetch = require('node-fetch');

const BASE_URL = 'http://localhost:3005';
const TEST_EMAIL = 'tlagaly@gmail.com';
const TEST_NAME = 'Tyler Lagaly';

// Example data for different notification types
const testData = {
  taskReminder: {
    taskName: 'Lawn Mowing',
    scheduledDate: addDays(new Date(), 1),
    userName: TEST_NAME,
    lawnLocation: '123 Garden Street',
  },

  weatherAlert: {
    userName: TEST_NAME,
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
  },

  weeklySummary: {
    userName: TEST_NAME,
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
  },

  careRecommendation: {
    userName: TEST_NAME,
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
  },
};

async function sendTestNotification(type, data) {
  try {
    console.log(`\nTesting ${type} notification...`);
    
    const response = await nodeFetch(`${BASE_URL}/api/test-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data }),
    });

    const result = await response.json();
    
    if (result.result?.error) {
      console.error(`Error sending ${type} notification:`, result.result.error);
      console.log('Troubleshooting tips:');
      console.log('1. Ensure RESEND_TEST_API_KEY is set in .env');
      console.log('2. Verify the API key starts with "re_test_"');
      console.log(`3. Confirm recipient email is set to ${TEST_EMAIL}`);
      console.log('4. Check that NODE_ENV=development is set');
    } else {
      console.log(`${type} notification sent successfully!`);
    }

    return result;
  } catch (error) {
    console.error(`Network error sending ${type} notification:`, error);
    throw error;
  }
}

// Add delay between requests to handle rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Example usage:
async function runTests() {
  console.log('Starting notification tests...');
  console.log(`Test recipient: ${TEST_EMAIL}`);
  console.log('Environment:', process.env.NODE_ENV || 'not set');

  try {
    // Test task reminder
    await sendTestNotification('task_reminder', testData.taskReminder);
    await delay(1000); // Wait 1 second between requests

    // Test weather alert
    await sendTestNotification('weather_alert', testData.weatherAlert);
    await delay(1000);

    // Test weekly summary
    await sendTestNotification('weekly_summary', testData.weeklySummary);
    await delay(1000);

    // Test care recommendations
    await sendTestNotification(
      'care_recommendation',
      testData.careRecommendation
    );

    console.log('\nNotification tests complete');
  } catch (error) {
    console.error('\nTest suite failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();