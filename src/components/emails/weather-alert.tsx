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

interface WeatherAlertProps {
  userName: string;
  lawnLocation: string;
  condition: string;
  affectedTasks: Array<{
    name: string;
    scheduledDate: Date;
  }>;
}

export default function WeatherAlert({
  userName,
  lawnLocation,
  condition,
  affectedTasks,
}: WeatherAlertProps) {
  return (
    <Html>
      <Head />
      <Preview>Weather alert affecting your lawn care tasks</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Weather Alert</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            We detected weather conditions in {lawnLocation} that might affect your
            scheduled lawn care tasks:
          </Text>
          <Text style={alertBox}>
            <strong>Weather Condition:</strong> {condition}
          </Text>
          <Text style={text}>The following tasks may need to be rescheduled:</Text>
          <div style={taskList}>
            {affectedTasks.map((task, index) => (
              <Text key={index} style={taskItem}>
                • {task.name} - scheduled for{' '}
                {format(task.scheduledDate, 'EEEE, MMMM d')}
              </Text>
            ))}
          </div>
          <Text style={text}>
            Please review your task schedule and make adjustments if needed. You
            can reschedule tasks through your LawnSync dashboard.
          </Text>
          <Text style={footer}>
            Stay safe,
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

const alertBox = {
  ...text,
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  padding: '16px',
  borderRadius: '4px',
  margin: '24px 0',
};

const taskList = {
  margin: '16px 0',
  padding: '0 16px',
};

const taskItem = {
  ...text,
  margin: '8px 0',
};

const footer = {
  ...text,
  color: '#6b7280',
  fontSize: '14px',
  marginTop: '32px',
};