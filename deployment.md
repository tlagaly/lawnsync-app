# Vercel Deployment Configuration

## Overview
The LawnSync application is deployed on Vercel with automatic deployments enabled for the main branch. Each push to the main branch triggers a new deployment.

## Build Configuration
- Framework: Next.js
- Build Command: `next build`
- Install Command: `npm install && npx prisma generate && npx prisma migrate deploy`
- Output Directory: `.next`

## Environment Variables
The following environment variables need to be configured in Vercel:

| Variable | Description | Source |
|----------|-------------|--------|
| NEXTAUTH_URL | Authentication callback URL | Set to deployment URL (e.g., https://lawnsync-app.vercel.app) |
| NEXTAUTH_SECRET | Secret key for NextAuth | Generate using `openssl rand -base64 32` |
| DATABASE_URL | PostgreSQL connection string | From your database provider |
| OPENWEATHER_API_KEY | API key for weather data | From OpenWeather API dashboard |
| RESEND_API_KEY | API key for email service | From Resend dashboard |
| ANTHROPIC_API_KEY | API key for Claude AI | From Anthropic dashboard |

## Database Migrations
Database migrations are automatically run during the build process using the `prisma migrate deploy` command. This ensures the production database schema is always in sync with the application code.

## Deployment Process
1. Push changes to the main branch
2. Vercel automatically detects the push
3. Builds the application using the configured build settings
4. Runs database migrations
5. Deploys to production if all steps succeed

## Monitoring
- Vercel automatically provides deployment logs
- Build logs can be accessed in the Vercel dashboard
- Runtime logs are available through Vercel's logging interface

## Troubleshooting
If a deployment fails:
1. Check the build logs in Vercel dashboard
2. Verify all environment variables are correctly set
3. Ensure database migrations can be applied successfully
4. Check for any failed API integrations

## Rollback Process
If needed, you can instantly revert to a previous deployment using Vercel's dashboard:
1. Go to the project in Vercel dashboard
2. Navigate to Deployments
3. Find the last working deployment
4. Click "..." and select "Promote to Production"