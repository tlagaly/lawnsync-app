import bcrypt from 'bcryptjs';
import { db } from './db';

export async function setupTestUser() {
  try {
    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const user = await db.user.upsert({
      where: { email: 'test@lawnsync.app' },
      update: {},
      create: {
        email: 'test@lawnsync.app',
        name: 'Test User',
        password: hashedPassword,
      },
    });

    // Create notification preferences
    await db.notificationPreferences.upsert({
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
  }
}