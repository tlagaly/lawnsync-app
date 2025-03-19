# Vercel Deployment Guide

## Environment Variables

The following environment variables need to be configured in your Vercel project settings:

1. **Database Configuration**
   - `DATABASE_URL`: Your production PostgreSQL connection string from Neon (with pgbouncer enabled)
   - `DIRECT_URL`: Your direct PostgreSQL connection string from Neon (for migrations)

2. **Authentication**
   - `NEXTAUTH_URL`: Set to `https://app.lawnsync.ai`
   - `NEXTAUTH_SECRET`: Generate a secure random string using `openssl rand -base64 32`

3. **External APIs**
   - `OPENWEATHER_API_KEY`: Your OpenWeather API key
   - `RESEND_API_KEY`: Your Resend API key for email services
   - `CLAUDE_API_KEY`: Your Anthropic Claude API key

4. **Environment Settings**
   - `NODE_ENV`: Set to `production`

## Setting Up Environment Variables in Vercel

1. Go to your project settings in the Vercel dashboard
2. Navigate to the "Environment Variables" section
3. Add each variable with its corresponding value
4. Make sure to use the same variable names as listed above
5. Variables are automatically encrypted and securely stored

## Database Setup

1. Create a new PostgreSQL database in Neon
2. Get both connection strings from Neon dashboard:
   - Pooled connection (with pgbouncer) for `DATABASE_URL`
   - Direct connection for `DIRECT_URL`
3. Add both URLs to Vercel environment variables
4. The database migrations will run automatically during deployment

## Build Configuration

1. **Build Command**: `npm run build`
   - This will:
     - Generate Prisma client
     - Run database migrations
     - Build the Next.js application

2. **Install Command**: `npm install`
   - This will install all dependencies including:
     - PostCSS and its plugins
     - Tailwind CSS
     - Style loaders

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
2. Verify environment variables are correctly set
3. Check if database migrations were successful
4. Verify CSS processing by inspecting network tab for CSS files
5. Check browser console for any JavaScript errors
6. Ensure all API keys are valid and have necessary permissions

## Automatic Deployments

The project is configured to automatically deploy:
1. When changes are pushed to the `preview/vercel-config` branch
2. Preview deployments for pull requests
3. Production deployments when merged to main branch