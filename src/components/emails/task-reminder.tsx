import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import { format } from 'date-fns';

interface TaskReminderProps {
  taskName: string;
  scheduledDate: Date;
  userName: string;
  lawnLocation: string;
}

export default function TaskReminder({
  taskName,
  scheduledDate,
  userName,
  lawnLocation,
}: TaskReminderProps) {
  return (
    <Html>
      <Head />
      <Preview>Upcoming lawn care task: {taskName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Task Reminder</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            This is a reminder about your upcoming lawn care task:
          </Text>
          <Text style={taskDetails}>
            <strong>Task:</strong> {taskName}
            <br />
            <strong>Scheduled for:</strong>{' '}
            {format(scheduledDate, 'EEEE, MMMM d, yyyy')}
            <br />
            <strong>Location:</strong> {lawnLocation}
          </Text>
          <Text style={text}>
            Please check the weather forecast and adjust your schedule if needed.
          </Text>
          <Text style={footer}>
            Best regards,
            <br />
            Your LawnSync Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.1',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const taskDetails = {
  ...text,
  backgroundColor: '#f3f4f6',
  padding: '16px',
  borderRadius: '4px',
  margin: '24px 0',
};

const footer = {
  ...text,
  color: '#6b7280',
  fontSize: '14px',
  marginTop: '32px',
};