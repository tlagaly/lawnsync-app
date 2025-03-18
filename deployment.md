# Vercel Deployment Configuration

This project is configured for deployment on Vercel with the following settings:

## Build Configuration
- Framework: Next.js
- Build Command: `next build`
- Install Command: `npm install && npx prisma generate && npx prisma migrate deploy`
- Output Directory: `.next`

## Environment Configuration
- Production and Preview environments configured
- Separate database instances for each environment
- API keys configured for all services

## Branch Configuration
- Production Branch: `main`
- Preview Deployments: Enabled for all branches and pull requests
- Pull Request Comments: Enabled

## Database
- Production Database: Neon PostgreSQL (Production Branch)
- Preview Database: Neon PostgreSQL (Preview Branch)
- Automatic migrations during deployment

## API Integration
- OpenWeather API
- Resend Email Service
- Claude AI Integration

## Deployment Protection
- Production: Standard protection
- Preview: Password protection enabled
- Build checks enabled