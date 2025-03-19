# Vercel Deployment Guide

## Environment Variables

The following environment variables need to be configured in your Vercel project settings:

1. **Database Configuration**
   - Create a variable named `DATABASE_URL` (uppercase)
   - Create a variable named `DIRECT_URL` (uppercase)
   - Set their values to your Neon database URLs
   - Make sure to create these for both Production and Preview environments

2. **Authentication**
   - Create a variable named `NEXTAUTH_SECRET` (uppercase)
   - For preview deployments, NEXTAUTH_URL will be set automatically by Vercel
   - For production, it will be set to https://app.lawnsync.ai

3. **External APIs**
   - Create a variable named `OPENWEATHER_API_KEY` (uppercase)
   - Create a variable named `RESEND_API_KEY` (uppercase)
   - Create a variable named `CLAUDE_API_KEY` (uppercase)
   - Use different API keys for Production and Preview environments

4. **Environment Settings**
   - Create a variable named `NODE_ENV` (uppercase)
   - Set to "development" for preview deployments
   - Set to "production" for production deployments

## Setting Up Environment Variables in Vercel

1. Go to your project settings in the Vercel dashboard
2. Navigate to the "Environment Variables" section
3. For each variable:
   - Use UPPERCASE for variable names
   - Create separate values for Production and Preview environments
   - Variables are automatically encrypted and securely stored
   - Values will be referenced in vercel.json using ${VARIABLE_NAME} syntax

## Database Setup

1. Create a new PostgreSQL database in Neon
2. Get both connection strings from Neon dashboard:
   - Pooled connection (with pgbouncer) for `DATABASE_URL`
   - Direct connection for `DIRECT_URL`
3. Add both URLs to Vercel environment variables
4. The database migrations will run automatically during deployment

## Build Configuration

1. **Build Command**: `next build`
   - This will:
     - Generate Prisma client
     - Run database migrations
     - Build the Next.js application

2. **Install Command**: `npm install`
   - This will install all dependencies including:
     - PostCSS and its plugins
     - Tailwind CSS
     - Next.js dependencies

3. **Framework Preset**: Next.js

## Post-Deployment Verification

1. Check if the database migrations were successful
2. Verify that all environment variables are properly set
3. Test the authentication flow
4. Verify API integrations:
   - OpenWeather API
   - Resend email service
   - Claude API
5. Test email notifications
6. Verify CSS styling is working correctly

## Troubleshooting

If you encounter any issues:

1. Check Vercel deployment logs for build errors
2. Verify environment variables are correctly set:
   - Names must be in UPPERCASE
   - Values must match your local .env file
   - Separate values for Production and Preview environments
3. Check if database migrations were successful
4. Verify CSS processing by inspecting network tab for CSS files
5. Check browser console for any JavaScript errors
6. Ensure all API keys are valid and have necessary permissions

## Automatic Deployments

The project is configured to automatically deploy:
1. When changes are pushed to the `preview/vercel-config` branch
2. Preview deployments for pull requests
3. Production deployments when merged to main branch