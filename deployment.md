# Vercel Deployment Guide

## Environment Variables Setup

You need to add the following environment variables in your Vercel project settings:

1. **Database Configuration** (from Neon)
   ```
   DATABASE_URL=postgres://neondb_owner:npg_RMxb7BWjpc2i@ep-shy-tree-a5n6igw0.us-east-2.aws.neon.tech/neondb?sslmode=require
   DIRECT_URL=postgres://neondb_owner:npg_RMxb7BWjpc2i@ep-shy-tree-a5n6igw0.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

2. **NextAuth Configuration**
   ```
   NEXTAUTH_SECRET=lawnsync_secret_key_2025_secure_auth_token
   NEXTAUTH_URL=https://app.lawnsync.ai
   ```

3. **External API Keys**
   ```
   OPENWEATHER_API_KEY=5ca0f87ea9028b154c55ec95a8782e08
   RESEND_API_KEY=re_3C2oLu3h_KrWyVPNFAhc17VL9aVg55hui
   ```

4. **Node Environment**
   ```
   NODE_ENV=production
   ```

## Setting Up in Vercel Dashboard

1. Go to your project settings in the Vercel dashboard
2. Navigate to the "Environment Variables" section
3. Add each variable with its corresponding value
4. Make sure to use the exact variable names as listed above
5. Variables are automatically encrypted and securely stored

## Build Configuration

The project is configured to use:
- Next.js framework preset
- Node.js 18.x
- Build command: `npm run build`
- Install command: `npm install`

## Post-Deployment Verification

1. Check if the database migrations were successful
2. Verify that all environment variables are properly set
3. Test the authentication flow
4. Verify API integrations:
   - OpenWeather API
   - Resend email service
5. Test email notifications
6. Verify CSS styling is working correctly

## Automatic Deployments

The project is configured to automatically deploy:
1. When changes are pushed to the main branch
2. Preview deployments for pull requests
3. Production deployments when merged to main branch

## Troubleshooting

If you encounter any issues:

1. Check Vercel deployment logs for build errors
2. Verify environment variables are correctly set
3. Check if database migrations were successful
4. Verify CSS processing by inspecting network tab for CSS files
5. Check browser console for any JavaScript errors
6. Ensure all API keys are valid and have necessary permissions