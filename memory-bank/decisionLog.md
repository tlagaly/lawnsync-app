# Decision Log

This file records architectural and implementation decisions using a list format.

## [2025-05-08 12:48:00] - Restructure App Using Jobs-to-be-Done Approach

### Decision
Completely restructure the LawnSync application architecture from a feature-centric approach to a jobs-to-be-done approach with dedicated sections focused on user goals.

### Rationale
1. The current feature-centric structure requires users to mentally map features to their actual goals
2. Users think in terms of what they want to accomplish (jobs-to-be-done) rather than what features they need to use
3. A jobs-to-be-done approach creates a more intuitive information architecture
4. This approach better aligns with user mental models and reduces cognitive load
5. The new structure will improve discoverability of related features
6. Navigation will be more intuitive, especially for new users
7. This approach supports better contextual presentation of features and content

### Implementation Details
1. Create new top-level navigation sections based on primary user jobs:
   - My Dashboard (personalized overview)
   - Fix Issues (problem diagnosis & solutions)
   - Maintain (routine care & scheduling)
   - Improve (enhancement projects)
   - Track (progress visualization)
   - Resources (knowledge & tools)
   - Settings (account & preferences)

2. Reorganize existing components to fit within the new jobs-based structure:
   - Move TaskScheduler and Calendar to "Maintain" section
   - Move PhotoGallery and Comparison to "Track" section
   - Move Plant Identification to "Fix Issues" section
   - Move Recommendations to context-specific locations in multiple sections

3. Create new layout and navigation components:
   - Main navigation for top-level sections
   - Sub-navigation for section-specific content
   - Consistent page layout across all sections
   - Mobile-optimized navigation with bottom bar

4. Implement phased approach as outlined in implementationPlan.md:
   - Phase 1: Architecture Preparation
   - Phase 2: Content Migration & Feature Refactoring
   - Phase 3: Data & State Management Refactoring 
   - Phase 4: Navigation & UX Implementation
   - Phase 5: Testing & Optimization
   - Phase 6: Finalization & Deployment

5. Key technical considerations:
   - Use React Router for primary navigation
   - Use context API for navigation state
   - Implement code splitting for performance
   - Create consistent component patterns across sections

### Expected Impact
1. Improved user experience with more intuitive navigation
2. Better feature discovery and utilization
3. Clearer user journeys with contextual feature presentation
4. More natural information architecture that aligns with user mental models
5. Enhanced mobile experience with task-focused navigation
6. More scalable architecture for adding future features

## [2025-05-08 14:02:00] - Navigation Structure Refinement Based on User Feedback

### Decision
Update the navigation structure based on user feedback and design mockup to better reflect user-centric organization:

1. Replace previous section names with new user-centric sections:
   - Home (replaces Dashboard)
   - Tasks and Projects (combines elements of Maintain and Track)
   - AI Lawn Assistant (new chat-based interface section)
   - My Lawn (combines elements of Improve and Track)
   - Plant and Lawn Identifier (moved from Fix Issues to standalone section)

2. Implement header with:
   - Logo and app name (left)
   - Notifications and user dropdown (right)
   - User dropdown containing: My profile, Settings, Theme, Logout

3. Position navigation:
   - Fixed bottom navigation for mobile
   - Icon-based navigation with labels for the 5 main sections

### Rationale
1. The revised structure more directly aligns with how users think about their lawn care activities
2. Separating the plant identification into its own section emphasizes this key feature
3. Adding a dedicated AI assistant section provides clear access to help and guidance
4. The header with user dropdown improves accessibility to account-related functions
5. Bottom navigation on mobile follows modern mobile UI patterns and matches the design mockup
6. The updated structure provides clearer paths to key functionality

### Implementation Details
1. Update MainNavigationBar component with new sections and icons
2. Create/rename container components for each new section
3. Implement header with user dropdown menu
4. Update routing in App.tsx to reflect the new structure
5. Style all components according to the provided design mockup
6. Ensure responsive design with different layouts for mobile and desktop
7. Migrate existing functionality into the new structure in a future phase

### Expected Impact
1. Improved user experience with more intuitive section organization
2. Better alignment with user mental models of lawn care activities
3. Clearer access to key features like plant identification and AI assistance
4. More modern mobile interface with bottom navigation
5. Consistent header across all sections improving overall app navigation
