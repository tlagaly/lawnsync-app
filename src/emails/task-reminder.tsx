import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface TaskReminderEmailProps {
  taskName: string;
  scheduledDate: Date;
  userName: string;
  lawnLocation: string;
}

export const TaskReminderEmail = ({
  taskName,
  scheduledDate,
  userName,
  lawnLocation,
}: TaskReminderEmailProps) => {
  const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>Upcoming lawn maintenance task reminder</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Task Reminder</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            This is a reminder about your upcoming lawn maintenance task:
          </Text>
          <Container style={taskBox}>
            <Text style={{ ...text, ...taskNameStyle }}>
              <strong>{taskName}</strong>
            </Text>
            <Text style={{ ...text, ...taskDetailStyle }}>
              <strong>When:</strong> {formattedDate}
            </Text>
            <Text style={{ ...text, ...taskDetailStyle }}>
              <strong>Location:</strong> {lawnLocation}
            </Text>
          </Container>
          <Text style={text}>
            Please ensure you have all necessary equipment ready for this task.
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
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
} as const;

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
} as const;

const h1 = {
  color: '#32325d',
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '30px 0',
} as const;

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  marginBottom: '12px',
} as const;

const taskBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
} as const;

const taskNameStyle = {
  fontSize: '18px',
  color: '#32325d',
  marginBottom: '8px',
} as const;

const taskDetailStyle = {
  color: '#525f7f',
  marginBottom: '4px',
} as const;

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  marginTop: '32px',
} as const;

export default TaskReminderEmail;