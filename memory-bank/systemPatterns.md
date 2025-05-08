# LawnSync - System Patterns

## High-Level Architecture

```
┌─────────────────────────────────────────┐  
│                                         │  
│               React Frontend            │  
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │  
│  │ Zustand │  │ React   │  │ Chakra  │  │  
│  │ Stores  │  │ Router  │  │ UI      │  │  
│  └─────────┘  └─────────┘  └─────────┘  │  
│                                         │  
└───────────────────┬─────────────────────┘  
                    │  
                    ▼  
┌─────────────────────────────────────────┐  
│                                         │  
│              API Services               │  
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │  
│  │ Firebase│  │ Supabase│  │ External│  │  
│  │ Service │  │ Service │  │ APIs    │  │  
│  └─────────┘  └─────────┘  └─────────┘  │  
│                                         │  
└───────────────────┬─────────────────────┘  
                    │  
                    ▼  
┌─────────────────────────────────────────┐  
│                                         │  
│              Data Storage               │  
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │  
│  │ Firebase│  │ Supabase│  │ Firebase│  │  
│  │Firestore│  │PostgreSQL│ │ Storage │  │  
│  └─────────┘  └─────────┘  └─────────┘  │  
│                                         │  
└─────────────────────────────────────────┘
```

## Core Architectural Principles

### 1. Separation of Concerns
- UI components separated from business logic
- API services abstracted from components
- State management centralized in Zustand stores

### 2. Mobile-First Responsive Design
- All components designed for mobile first
- Desktop layouts as progressive enhancement
- Touch-friendly controls

### 3. Server-Stateless Architecture
- Client-side state management with Zustand
- Firebase/Supabase for persistent storage
- Cloud Functions for serverless backend logic

### 4. Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced features with JS enabled
- Offline capabilities where possible

### Mobile-First Design Pattern
- All UI components optimized for mobile touch interaction
- Responsive design scaling up to tablet and desktop
- Critical functions accessible with minimal navigation
- Offline capabilities for core features

## UI Implementation Patterns

### 1. Component Implementation Flexibility
- Prefer framework-agnostic component design where possible
- Prepare for UI framework migration/changes by using simple patterns
- Implement critical components with native HTML/CSS as needed
- Use UI frameworks as enhancement layer rather than core dependency

### 2. Fallback Implementation Strategy
- Design components with CSS-in-JS but provide native CSS fallbacks
- Maintain theme constants (colors, spacing) in standalone files
- Use inline styles for critical components when framework issues arise
- Ensure UI state managed separately from component rendering

### 3. Progressive UI Enhancement
- Basic functionality with HTML/CSS
- Enhanced interactions with JavaScript
- Rich interactions with UI framework components

## Data Flow

### 1. User Interaction
- User interacts with component
- Component calls action from Zustand store
- Action updates local state

### 2. API Communication
- Store action calls appropriate API service
- Service handles communication with backend
- Response updates store state

### 3. Data Persistence
- Store subscribes to changes and persists to localStorage
- Firebase listeners sync data in real-time
- Optimistic UI updates before confirmation

### 4. External API Integration
- Weather API data fetched on schedule
- Plant.id API called when photos uploaded
- OpenAI API called for advice generation

## Authentication Flow

### 1. Anonymous Session
- User starts with anonymous session
- Onboarding data stored in localStorage
- Session ID generated for tracking

### 2. Account Creation
- User completes onboarding and creates account
- Firebase Authentication handles credentials
- Data migrated from localStorage to Firebase

### 3. Protected Routes
- Post-authentication pages protected via React Router
- Auth state stored in Zustand
- Token refresh handled automatically

## Error Handling Strategy

### 1. Client-Side Validation
- Form validation before submission
- Type checking with TypeScript
- Graceful degradation for older browsers

### 2. API Error Handling
- Centralized error handling in API services
- Retry logic for transient failures
- Fallback mechanisms for critical features

### 3. User Feedback
- Toast notifications for errors
- Inline form validation messages
- Offline indicators and recovery options

## Performance Optimization

### 1. Code Splitting
- Route-based code splitting
- Lazy loading of non-critical components
- Dynamic imports for heavy features

### 2. Asset Optimization
- Image compression and lazy loading
- Font subsetting
- Critical CSS inline loading

### 3. Caching Strategy
- API response caching
- Weather data cached with TTL
- localStorage for offline data access

### AI Recommendation Engine
- Rule-based system combined with machine learning
- Continuous learning from user feedback and results
- Contextual awareness of location, season, and weather
- Personalization based on lawn conditions and user preferences

## Coding Patterns

### Component Structure
- Reusable UI components with clear separation of concerns
- Container/presentation component pattern
- Consistent state management approach
- Standardized error handling and validation

### Testing Strategy
- Unit tests for business logic components
- Integration tests for API interactions
- End-to-end tests for critical user flows
- Accessibility testing for all UI components

### Documentation Standards
- JSDoc/TSDoc for all functions and classes
- README files for each major module
- CHANGELOG updates with semantic versioning
- Design documentation for complex features

## Data Patterns

### User Profile Schema
- Core user information (name, email, location)
- Lawn specifications (size, grass type, sun exposure)
- User preferences and settings
- Progress metrics and history

### Lawn Data Model
- Zone-based lawn mapping
- Problem area tracking with status history
- Treatment and maintenance history
- Visual timeline with metadata

### Task Management Model
- Task definitions with dependencies
- Scheduling rules based on weather and seasons
- Completion status tracking
- User customization options

## Integration Patterns

### Weather Data Integration
- Daily forecast polling for task scheduling
- Historical weather data for analysis
- Weather alerts affecting lawn care activities
- Seasonal trend analysis for long-term planning
- Mock/real toggle pattern for local development without API credentials
- Caching strategy with 30-minute TTL to balance freshness with API usage
- Graceful error handling with fallback to mock data
- Context-aware lawn care tips based on current and forecast conditions

### Weather-Adaptive Task Scheduling Pattern
- Type-based interface definitions for robust scheduling system
- Service layer with mock/real toggle following project patterns
- Weather compatibility matrix mapping task categories to optimal conditions
- Scoring algorithm to determine task appropriateness based on weather
- Mobile-first calendar interface with touch-optimized controls
- Visual weather indicators integrated directly into task representation
- Task detail view with weather context and rescheduling options
- Tab-based navigation between list and calendar views
- Local storage persistence with future Firebase synchronization
- Personalized recommendations based on location-specific weather conditions

### Lawn Progress Gallery Pattern
- TypeScript interfaces for photo and comparison data structures
- Service layer with mock/real toggle pattern following project standards
- LocalStorage persistence with future Firebase Storage synchronization
- Mobile-first photo gallery with filtering and gesture support
- Before/After comparison with interactive slider
- Problem area marking and annotation
- Dashboard integration through tabbed navigation
- QuickActions integration for capturing new photos
- Date and season-based filtering for temporal tracking
- Weather data integration with photos for context

### AI Recommendation Engine Pattern
- TypeScript interfaces for recommendation requests, responses, and types
- Service layer with mock/real toggle following established project patterns
- OpenAI GPT-3.5 Turbo integration for personalized lawn care advice
- Intelligent caching system to minimize API calls and control costs
- Prompt engineering for context-aware recommendations
- Integration with weather data and user profile for contextual insights
- RecommendationCard component for summarized recommendation display
- RecommendationView component for detailed recommendation information
- RecommendationList component with filtering, sorting, and feedback
- Mobile-first design with clean, actionable presentation
- User feedback mechanism to improve future recommendations
- Dashboard integration through dedicated recommendations tab
- QuickActions integration with "Ask for Advice" functionality
- Categorization by type (maintenance, problem-solving, seasonal)

### Plant Identification Pattern
- TypeScript interfaces for identification requests, responses, and result types
- Service layer with mock/real toggle following project service patterns
- Plant.id API integration for accurate plant identification
- Multiple identification models for weeds, grass species, and diseases
- Intelligent caching system to minimize API costs and improve performance
- Comprehensive mock data for development and testing
- Mobile-first UI optimized for in-yard usage
- Camera integration for capturing plant photos
- Gallery integration for selecting existing photos
- PlantIdentificationCard component for displaying identification results
- PlantIdentificationView component with detailed species information
- Problem diagnosis with treatment recommendations
- Connection to recommendation engine for species-specific care advice
- Dashboard integration through QuickActions
- User feedback mechanism to improve identification accuracy

### Smart Watering Schedule Pattern
- TypeScript interfaces for watering schedules, zones, and configurations
- Service layer with mock/real toggle following established project patterns
- Weather forecast integration for adaptive watering scheduling
- Soil moisture modeling based on rainfall and evaporation rates
- Zone-based lawn management with customizable parameters
- Water conservation algorithm with rainfall compensation
- Configurable watering settings based on grass types and seasons
- Intelligent scheduling based on environmental factors
- Dashboard integration with upcoming watering events display
- Schedule customization with rule-based optimization
- Water usage monitoring and conservation metrics
- Mobile-first UI with watering zone management
- QuickActions integration with watering configuration shortcut
- Visual water conservation tracking with gallons saved display
- Different watering needs handled by soil type, sun exposure, and slope factors
- Configurable notifications for watering events and adjustments

### Image Processing Pipeline
- Secure image upload and storage
- Analysis for problem identification
- Before/after comparison processing
- Metadata extraction and tagging

## Version Control Patterns

### Branch Strategy
- Master branch contains only production-ready code
- Development branch serves as integration branch
- Feature branches for new functionality (feature/*)
- Bugfix branches for non-critical issues (bugfix/*)
- Hotfix branches for critical production fixes (hotfix/*)

### Git Automation Pattern
- Automated script-based approach to Git workflow tasks
- Daily synchronization routine with dedicated scripts
- Branch cleanup automation after merge operations
- Repository health monitoring with detailed checks
- Pre-push and post-merge hooks for enforcement
- Standardized branch lifecycle management
- Complete remote/local synchronization protocols
- Memory Bank integration for workflow documentation
- Automated prevention of direct master pushes
- Notification system for branch synchronization issues
- Regular prune operations to clean stale references

### Commit Conventions
- Semantic commit messages with prefixes (Feature:, Fix:, Docs:, etc.)
- Descriptive commit messages explaining what and why
- Related issue numbers referenced in commits
- Small, focused commits for easier review and rollback

### Pull Request Workflow
- Standardized PR template with description, type, and tests
- Required code review by at least one team member
- Automated checks must pass before merging
- Issues linked to PRs for traceability
- Clean commit history maintained via squash merges

### Issue Management
- Standardized templates for bugs and feature requests
- Consistent labeling for triage and categorization
- Issues linked to corresponding branches and PRs
- Closing issues automatically via commit messages

## Memory Bank Management

### Memory Bank File Operations
- Use `write_to_file` instead of `append_to_file` for reliable updates
- Read current file contents before writing to preserve existing data
- Always include proper timestamps in Memory Bank entries
- Enforce consistent formatting across all Memory Bank files

### Memory Bank Update Strategy
- Update Memory Bank files when completing major components or features
- Include descriptive entries with timestamps for all significant changes
- Document workarounds or technical limitations in activeContext.md
- Keep progress.md synchronized with actual development milestones

## Framework Compatibility Management

### UI Framework Workarounds
- Identify and isolate components affected by framework compatibility issues
- Convert framework-dependent components to native HTML/CSS implementations
- Maintain visual consistency through shared theme constants
- Document compatibility issues and solutions for future maintenance

### Technical Debt Management
- Track framework-related workarounds for future refactoring
- Isolate temporary solutions in well-documented wrapper components
- Maintain parallel implementations where necessary for critical components
- Prioritize stability of user-facing features over architectural purity

## Development and Testing Patterns

### Mock Implementation Pattern
- Create mockable interfaces for external services
- Implement in-memory equivalents of cloud services
- Provide runtime toggle between real and mock implementations
- Add simulated network delays for realistic testing
- Use console logging for visibility into mock operations
- Maintain data consistency across mock implementations

### Firebase Mock Implementation
- Mock Authentication with in-memory user storage
- Mock Firestore with JavaScript objects
- Toggle between real Firebase and mock with USE_MOCK flags
- Simulate network delays for realistic UX testing
- Maintain consistency in error handling behavior
- Allow testing of the entire application flow without external services

### Local-First Development
- Design components to work with both local and cloud data
- Implement offline-first approach for core features
- Synchronize data when connectivity is restored
- Test functionality in disconnected scenarios
- Cache external API responses for development efficiency

[2025-05-05 14:52:00] - Initial system patterns documentation
[2025-05-05 23:57:00] - Added Memory Bank management patterns and workarounds for file operation limitations
[2025-05-06 00:20:38] - Added UI framework compatibility management patterns and documented approach to handle Chakra UI compatibility issues
[2025-05-06 00:44:00] - Added Version Control Patterns section documenting Git workflow practices and conventions
[2025-05-06 01:09:00] - Added Development and Testing Patterns section with Mock Implementation Pattern for Firebase Authentication and Firestore
[2025-05-06 01:45:00] - Extended Weather Data Integration pattern with OpenWeatherMap mock/real toggle, caching, and context-aware recommendations
[2025-05-06 10:49:00] - Added Weather-Adaptive Task Scheduling Pattern documenting the implementation approach, including type-based interfaces, weather compatibility scoring, and mobile-first UI components
[2025-05-06 11:21:00] - Added Lawn Progress Gallery Pattern documenting the photo gallery implementation with before/after comparison, filtering, and mobile-first approach
[2025-05-06 12:36:00] - Added AI Recommendation Engine Pattern documenting the implementation approach, including OpenAI integration, caching, context-aware recommendations, and user feedback mechanisms
[2025-05-06 16:00:41] - Added Plant Identification Pattern documenting the implementation approach, including Plant.id API integration, interfaces for different identification types, and mobile-first UI components with camera integration
[2025-05-06 16:22:12] - Added Smart Watering Schedule Pattern documenting the implementation approach, including weather forecast integration, rainfall compensation, zone-based management, and water conservation metrics
[2025-05-07 18:35:00] - Enhanced Git Automation Pattern with detailed implementation of scripts, hooks, and branch management protocols; moved Git workflow documentation to Memory Bank for project-wide reference

## API Monitoring Pattern

### Production-Ready OpenAI Integration Pattern
- Environment-based API key management for seamless deployment across environments
- Tiered key selection system (dev/staging/prod) based on environment variables
- Rate limiting implementation with configurable request quotas
- Request throttling with exponential backoff for API limit handling
- Enhanced caching system with TTL and invalidation strategies
- Fallback recommendations when API is unavailable or rate limited
- Error classification for different response types (network, API limit, token limit)
- Cost optimization through token usage monitoring and caching
- Complete logging system for auditing and debugging

### API Usage Monitoring Dashboard Pattern
- Real-time usage statistics with visual metrics
- API health monitoring with success rate tracking
- Token usage tracking with cost estimation
- Performance metrics including latency and error rates
- Test interface for direct API interaction
- Interactive visualization of API usage patterns
- Rate limit monitoring with quota visualization
- Daily, weekly, and monthly usage trends
- Native HTML/CSS implementation for framework independence
- Live testing functionality with response visualization

### UI Framework Compatibility Pattern
- Simplified wrapper components that avoid problematic framework APIs
- Native HTML/CSS implementations for critical UI components
- Theme application through direct styling rather than component props
- Style extraction from theme objects for direct application
- CSS-in-JS to inline style conversion for framework independence
- Graceful degradation while maintaining core functionality
- Extraction of essential design tokens for styling consistency
- Common interface for both framework-based and native components

[2025-05-07 18:55:00] - Added Production-Ready OpenAI Integration Pattern documenting enhanced GPT-3.5 Turbo integration, API Monitoring Dashboard Pattern, and UI Framework Compatibility Pattern; enhanced documentation on environment-based configuration, rate limiting, and fallback mechanisms
