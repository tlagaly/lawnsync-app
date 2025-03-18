import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';
import { renderEmailTemplate } from '@/lib/email-renderer';
import {
  isTaskReminderData,
  isWeatherAlertData,
  isWeeklySummaryData,
  isCareRecommendationsData,
} from '@/lib/email-renderer';
import type { NotificationType } from '@/types/notifications';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { type, data } = body;

    // Validate notification type
    if (!isValidNotificationType(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // Validate data based on notification type
    if (!isValidData(type, data)) {
      return NextResponse.json(
        { error: 'Invalid data for notification type' },
        { status: 400 }
      );
    }

    // Render email template
    const emailContent = await renderEmailTemplate({ type, data });

    // Send notification
    const result = await sendNotification(session.user.id, type, {
      to: session.user.email!,
      subject: getSubject(type, data),
      content: emailContent,
      metadata: { test: true },
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error testing notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}

function isValidNotificationType(type: any): type is NotificationType {
  return [
    'task_reminder',
    'weather_alert',
    'weekly_summary',
    'care_recommendation',
  ].includes(type);
}

function isValidData(type: NotificationType, data: any): boolean {
  switch (type) {
    case 'task_reminder':
      return isTaskReminderData(data);
    case 'weather_alert':
      return isWeatherAlertData(data);
    case 'weekly_summary':
      return isWeeklySummaryData(data);
    case 'care_recommendation':
      return isCareRecommendationsData(data);
    default:
      return false;
  }
}

function getSubject(type: NotificationType, data: any): string {
  switch (type) {
    case 'task_reminder':
      return `Reminder: ${data.taskName} scheduled for ${data.scheduledDate.toLocaleDateString()}`;
    case 'weather_alert':
      return `Weather Alert: Conditions affecting your lawn care tasks`;
    case 'weekly_summary':
      return `Your Weekly Lawn Care Summary`;
    case 'care_recommendation':
      return `${data.season} Care Recommendations for Your ${data.grassType}`;
    default:
      return 'LawnSync Notification';
  }
}