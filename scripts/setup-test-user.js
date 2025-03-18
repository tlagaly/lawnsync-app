const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Use the API key owner's email for testing
const TEST_EMAIL = 'tlagaly@gmail.com';
const TEST_NAME = 'Tyler Lagaly';

async function setupTestUser() {
  try {
    // Create test user with the developer's email for testing
    const hashedPassword = await bcrypt.hash('test123', 10);
    const user = await prisma.user.upsert({
      where: { email: TEST_EMAIL },
      update: {
        name: TEST_NAME,
      },
      create: {
        email: TEST_EMAIL,
        name: TEST_NAME,
        password: hashedPassword,
      },
    });

    // Create notification preferences
    await prisma.notificationPreferences.upsert({
      where: { userId: user.id },
      update: {
        taskReminders: true,
        weatherAlerts: true,
        weeklySummary: true,
        careRecommendations: true,
        timezone: 'America/Chicago',
      },
      create: {
        userId: user.id,
        taskReminders: true,
        weatherAlerts: true,
        weeklySummary: true,
        careRecommendations: true,
        timezone: 'America/Chicago',
      },
    });

    console.log('Test user created:', {
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return user;
  } catch (error) {
    console.error('Error setting up test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupTestUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });