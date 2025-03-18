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

interface WeeklySummaryProps {
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

export default function WeeklySummary({
  userName,
  weekStartDate,
  weekEndDate,
  completedTasks,
  upcomingTasks,
  weatherForecast,
}: WeeklySummaryProps) {
  return (
    <Html>
      <Head />
      <Preview>Your weekly lawn care summary</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Weekly Lawn Care Summary</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Here's your lawn care summary for the week of{' '}
            {format(weekStartDate, 'MMMM d')} to{' '}
            {format(weekEndDate, 'MMMM d, yyyy')}:
          </Text>

          <Heading style={h2}>Completed Tasks</Heading>
          <div style={taskList}>
            {completedTasks.length > 0 ? (
              completedTasks.map((task, index) => (
                <Text key={index} style={taskItem}>
                  • {task.name} - {format(task.completedDate, 'MMM d')}{' '}
                  {task.duration && `(${task.duration} minutes)`}
                </Text>
              ))
            ) : (
              <Text style={emptyState}>No tasks completed this week</Text>
            )}
          </div>

          <Heading style={h2}>Upcoming Tasks</Heading>
          <div style={taskList}>
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task, index) => (
                <Text key={index} style={taskItem}>
                  • {task.name} - {format(task.scheduledDate, 'MMM d')}{' '}
                  <span style={priorityBadge(task.priority)}>
                    {task.priority} priority
                  </span>
                </Text>
              ))
            ) : (
              <Text style={emptyState}>No upcoming tasks scheduled</Text>
            )}
          </div>

          <Heading style={h2}>Weather Outlook</Heading>
          <Text style={weatherBox}>
            <strong>Forecast:</strong> {weatherForecast.condition}
            <br />
            <strong>Temperature:</strong> {weatherForecast.temperature}
          </Text>

          <Text style={text}>
            Visit your LawnSync dashboard to manage your tasks and view detailed
            weather forecasts.
          </Text>
          <Text style={footer}>
            Happy gardening!
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

const h2 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.1',
  margin: '32px 0 16px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const taskList = {
  margin: '16px 0',
  padding: '0 16px',
};

const taskItem = {
  ...text,
  margin: '8px 0',
};

const emptyState = {
  ...text,
  color: '#6b7280',
  fontStyle: 'italic',
};

const priorityBadge = (priority: 'high' | 'medium' | 'low') => ({
  backgroundColor:
    priority === 'high'
      ? '#fee2e2'
      : priority === 'medium'
      ? '#fef3c7'
      : '#ecfdf5',
  color:
    priority === 'high'
      ? '#991b1b'
      : priority === 'medium'
      ? '#92400e'
      : '#065f46',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: '500',
});

const weatherBox = {
  ...text,
  backgroundColor: '#f3f4f6',
  padding: '16px',
  borderRadius: '4px',
  margin: '16px 0',
};

const footer = {
  ...text,
  color: '#6b7280',
  fontSize: '14px',
  marginTop: '32px',
};