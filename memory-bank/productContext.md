# Product Context

## Project Overview
- **Name**: Lawn Genius
- **Type**: Web Application
- **Status**: MVP Sprint (1 week)
- **Domain**: app.lawnsync.ai

## Project Description
Lawn Genius is a lawn care management application that helps homeowners maintain healthier lawns with personalized, AI-driven recommendations based on their specific lawn conditions and local environment.

## Core Value Proposition
- Personalized lawn care recommendations based on lawn profile and weather data
- Task scheduling integrated with real-time weather conditions
- Smart product recommendations for upcoming maintenance tasks

## Technical Architecture
### Frontend
- Framework: Next.js
- Styling: Tailwind CSS
- UI Components: shadcn UI
- State Management: React Context
- Form Handling: react-hook-form

### Backend
- ORM: Prisma
- Database: PostgreSQL
- Authentication: NextAuth.js with auto-login system
- API: Server Actions and setup endpoints
- Development Tools: Environment-aware utilities

### External Integrations
- AI: Claude API for personalized recommendations
- Weather: OpenWeatherMap API
- Deployment: Vercel
- Version Control: GitHub

## MVP Features
### Essential
1. User Authentication
   - Email/password signup
   - Login/logout functionality
   - Protected routes

2. Lawn Profile Management
   - Profile creation form
   - Location-based settings
   - Grass type selection
   - Basic lawn metrics

3. Weather Integration
   - Current conditions display
   - 5-day forecast
   - Weather-based task adjustments

4. Task Management
   - Task generation
   - Task completion tracking
   - Weather-aware scheduling
   - Basic task history
   - Interactive calendar view
     * Priority-based task indicators
     * Weather warning integration
     * Task status visualization
     * Date-based task filtering
     * Mobile-responsive design

5. Product Recommendations
   - Generic product catalog
   - Task-based suggestions
   - Basic product details

### Excluded from MVP
- Multiple lawn profiles
- Advanced analytics
- Community features
- Email notifications
- Native mobile app
- Marketing website

## Development Guidelines
- Mobile-first responsive design
- Modular component architecture
- Type-safe database operations
- Continuous deployment workflow
- Test-driven development approach
- Environment-aware development features
- Automated test user management
- Streamlined local development flow

## Environment Setup
- Production: app.lawnsync.ai
- Staging: staging.lawnsync.ai
- Local: localhost:3000
- Database: Vercel PostgreSQL
- CI/CD: GitHub Actions

## Notes
- Focus on core functionality over feature breadth
- Prioritize reliability and user experience
- Document technical decisions in Memory Bank
- Regular progress updates in activeContext.md