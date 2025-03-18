import { Resend } from 'resend';
import { render } from '@react-email/render';
import TaskReminderEmail from '@/emails/task-reminder';

const isDev = process.env.NODE_ENV === 'development';

// Use test API key in development, production key in production
const apiKey = isDev 
  ? process.env.RESEND_TEST_API_KEY 
  : process.env.RESEND_API_KEY;

const resend = new Resend(apiKey);

// Email configuration
const TEST_EMAIL = 'tlagaly@gmail.com';
const PROD_FROM_EMAIL = 'notifications@lawnsync.app';
const DEV_FROM_EMAIL = 'onboarding@resend.dev';

export type NotificationType = 
  | 'task_reminder'
  | 'weather_alert'
  | 'weekly_summary'
  | 'care_recommendation';

export async function sendNotification(
  type: NotificationType,
  data: any,
  recipientEmail: string
) {
  try {
    let emailHtml: string;
    let subject: string;

    switch (type) {
      case 'task_reminder':
        emailHtml = await render(TaskReminderEmail(data));
        subject = `Reminder: ${data.taskName} scheduled for tomorrow`;
        break;
      // TODO: Add other email templates
      default:
        // Temporary fallback for types without templates yet
        emailHtml = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        subject = `LawnSync ${type.replace('_', ' ')} Notification`;
    }

    // In development:
    // - Always send to test email
    // - Use Resend's test domain as sender
    const to = isDev ? TEST_EMAIL : recipientEmail;
    const from = isDev ? DEV_FROM_EMAIL : PROD_FROM_EMAIL;

    // Debug logging in development
    if (isDev) {
      console.log('Email Configuration:', {
        environment: process.env.NODE_ENV,
        isTestKey: apiKey?.startsWith('re_test_'),
        to,
        from,
        type,
      });
    }

    const result = await resend.emails.send({
      from: `LawnSync <${from}>`,
      to,
      subject,
      html: emailHtml,
    });

    return result;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}