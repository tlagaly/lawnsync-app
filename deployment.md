# Vercel Deployment Guide

## Environment Variables

The following environment variables need to be configured in your Vercel project settings:

1. **Authentication**
   - `NEXTAUTH_URL`: Set to your production URL (e.g., https://app.lawnsync.ai)
   - `NEXTAUTH_SECRET`: Generate a secure random string for session encryption

2. **Database**
   - `DATABASE_URL`: Your production PostgreSQL connection string from Neon
   - Make sure to enable the "Automatically expose System Environment Variables" option in Vercel

3. **API Keys**
   - `OPENWEATHER_API_KEY`: Your OpenWeather API key
   - `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude

4. **Email Configuration**
   - `EMAIL_SERVER_HOST`: SMTP server host
   - `EMAIL_SERVER_PORT`: SMTP server port
   - `EMAIL_SERVER_USER`: SMTP server username
   - `EMAIL_SERVER_PASSWORD`: SMTP server password
   - `EMAIL_FROM`: Default sender email address

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

3. **Output Directory**: `.next`

4. **Framework Preset**: Next.js

## Database Setup

1. Create a new PostgreSQL database in Neon
2. Get the connection string from Neon dashboard
3. Add the connection string as `DATABASE_URL` in Vercel environment variables
4. The database migrations will run automatically during deployment via the build command

## Post-Deployment Verification

1. Check if the database migrations were successful
2. Verify that all environment variables are properly set
3. Test the authentication flow
4. Verify API integrations (OpenWeather, Claude)
5. Test email notifications
6. Verify CSS styling is working correctly

## Troubleshooting

If you encounter any issues:

1. Check Vercel deployment logs for build errors
2. Verify environment variables are correctly set
3. Check if database migrations were successful
4. Verify CSS processing by inspecting network tab for CSS files
5. Check browser console for any JavaScript errors