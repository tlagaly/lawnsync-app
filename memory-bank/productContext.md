# LawnSync - Project Overview

## Project Summary
LawnSync is an AI-powered web application (https://app.lawnsync.ai) that provides personalized lawn care guidance based on user-specific conditions, climate, and goals. The application integrates with a separate marketing website (https://www.lawnsync.ai).

## Technical Stack
- **Frontend**: React with Vite, Chakra UI, Zustand
- **Backend**: Firebase (Auth, Firestore, Storage), Supabase (Knowledge Base)
- **AI/APIs**: OpenAI GPT-3.5 Turbo, Plant.id, OpenWeatherMap
- **Mapping**: Leaflet.js
- **Deployment**: Netlify

## Business Goals

- Help homeowners achieve healthier, more beautiful lawns with minimal effort
- Provide personalized guidance based on climate, grass type, and specific conditions
- Simplify lawn care through AI-driven recommendations that adapt to weather and seasons
- Create a visual timeline of lawn improvements to track success
- Extend functionality to include other landscaping elements (shrubs, trees, flower beds)

## User Personas

### Primary: The Busy Homeowner
- Has limited lawn care knowledge
- Wants to improve their lawn but doesn't know where to start
- Values visual improvement without extensive time commitment
- Prefers automated reminders and simplified instructions

### Secondary: The Lawn Enthusiast
- Has some lawn care knowledge but wants optimization
- Seeks to tackle specific problems (bare patches, weeds, etc.)
- Interested in detailed progress tracking
- Appreciates seasonal planning and weather-adaptive recommendations

## Key Features & Differentiators

### AI-Powered Recommendations
- Personalized lawn care plan based on specific conditions
- Visual problem identification from photos
- Weather-adaptive scheduling

### Progress Tracking
- Visual timeline of lawn improvement
- Before/after photo comparison
- Goal achievement tracking

### Seasonal Adjustments
- Auto-updates tasks based on season
- Preparation for upcoming seasonal changes
- Weather-aware task scheduling

### Pre-Account Onboarding
- Complete profile and see plan preview before creating account
- Seamless transition of data upon registration
- Immediate value demonstration

### Mobile-First Design
- Designed for in-yard usage
- Photo capture and upload
- Location-based recommendations

## App Structure

### 1. Onboarding Flow
- Location, Goals, Lawn Size/Layout, Grass Type, Conditions, Problems, etc.
- Plan Preview
- Account Creation

### 2. Dashboard (Home)
- Weekly Task Feed
- Weather + Forecast
- Smart Watering Plan
- Seasonal Progress
- Problem Area Tracker
- AI Suggestions
- Photo Check-ins / Progress

### 3. Lawn Profile
- Goals (Edit/Change)
- Lawn Specs
- Problem Areas Log

### 4. Landscaping
- Tracked Plants & Features
- Decorative Task Calendar
- Before/After Visual Tracking

### 5. Tasks
- All Tasks (Upcoming, Completed)
- Filter options
- Add Custom Task

### 6. AI Assistant (Chat)
- Lawn Advice
- Weed/Pest Diagnosis
- Product Recommendations

### 7. Gallery
- Photo Timeline
- Before & After Viewer
- Add New Photo

### 8. Settings
- Profile
- Notifications
- Lawn Zones
- Product Preferences

## Technical Requirements
- Mobile-first responsive design
- Integration with weather APIs
- Secure user data storage
- Image recognition capabilities
- Push notification system
- Cross-platform compatibility

## Development Context & Constraints

### Project Ownership
- Project owner is not a developer and lacks technical knowledge/experience
- All technical decisions should be explained in accessible language
- Best practices should be proactively enforced and explained

### Development Velocity
- All tasks should be scoped to be completable by a solo developer in a single workday (8 hours)
- Implementation should prioritize maintainability and clarity over complexity
- Documentation must be thorough to enable future understanding

### Version Control Requirements
- Strict adherence to Git best practices is essential
- Scripts and hooks should enforce proper Git workflow
- Regular repository health checks should be performed
- All Git operations should be explained with rationale

### Quality Assurance
- Code quality tools should be incorporated and explained
- Testing should be implemented for critical functionality
- Security best practices must be followed and documented
- Performance considerations should be highlighted proactively

[2025-05-05 14:30:00] - Initial project overview documentation
[2025-05-07 18:40:00] - Added development context and constraints, including project ownership, velocity expectations, version control requirements, and quality assurance needs
