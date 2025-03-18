import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function setupTestUser() {
  try {
    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const user = await prisma.user.upsert({
      where: { email: 'test@lawnsync.app' },
      update: {},
      create: {
        email: 'test@lawnsync.app',
        name: 'Test User',
        password: hashedPassword,
      },
    });

    // Create notification preferences
    await prisma.notificationPreferences.upsert({
      where: { userId: user.id },
      update: {},
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

// Export the function for use in API routes and scripts