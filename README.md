This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Notification System

LawnSync includes a comprehensive notification system that supports various types of notifications:

- Task Reminders
- Weather Alerts
- Weekly Summaries
- Care Recommendations

### Setup

1. Install dependencies:
```bash
npm install @react-email/components resend date-fns --legacy-peer-deps
```

2. Add your Resend API key to `.env`:
```bash
RESEND_API_KEY=your_api_key_here
```

You can get an API key by signing up at [Resend](https://resend.com).

### Email Templates

The notification system includes several email templates:

- `TaskReminder`: Sends reminders for upcoming lawn care tasks
- `WeatherAlert`: Notifies users about weather conditions affecting their tasks
- `WeeklySummary`: Provides a weekly overview of completed and upcoming tasks
- `CareRecommendations`: Sends seasonal lawn care tips and product recommendations

### Testing Notifications

The project includes a test script to verify the notification system:

1. Start the development server:
```bash
npm run dev
```

2. Run the test script:
```bash
npx ts-node src/scripts/test-notifications.ts
```

The test script will send example notifications of each type to the authenticated user's email address.

You can also test individual notifications using the API endpoint:

```bash
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "task_reminder",
    "data": {
      "taskName": "Lawn Mowing",
      "scheduledDate": "2025-03-19T10:00:00Z",
      "userName": "John",
      "lawnLocation": "123 Garden Street"
    }
  }'
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
