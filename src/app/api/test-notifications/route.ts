import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NotificationType, sendNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    // Get test user
    const testUser = await db.user.findUnique({
      where: { email: 'test@lawnsync.app' },
      include: {
        notificationPrefs: true,
      },
    });

    if (!testUser) {
      return NextResponse.json(
        { error: 'Test user not found' },
        { status: 404 }
      );
    }

    const { type, data } = await request.json();

    // Validate notification type
    if (!['task_reminder', 'weather_alert', 'weekly_summary', 'care_recommendation'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // Send notification
    const result = await sendNotification(
      type as NotificationType,
      data,
      testUser.email
    );

    // Log notification in history
    await db.notificationHistory.create({
      data: {
        userId: testUser.id,
        type: type as any,
        status: 'sent',
        subject: `Test ${type} Notification`,
        content: JSON.stringify(data, null, 2),
        metadata: data,
      },
    });

    return NextResponse.json({
      message: 'Test notification sent successfully',
      result,
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}