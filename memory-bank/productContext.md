# Product Context

## Claude AI Integration

### Overview
The Claude AI integration enhances our recommendation system by providing personalized lawn care advice based on lawn profiles and current conditions. It uses a hybrid approach that combines rule-based recommendations with AI-powered insights.

### Components

#### 1. Claude Service
- **Location:** src/lib/claude.ts
- **Purpose:** Handles all Claude API interactions
- **Features:**
  - Environment-aware configuration
  - Error handling with retries
  - Type-safe request/response handling
  - Prompt template management

#### 2. Types and Interfaces
- **Location:** src/types/claude.ts
- **Key Types:**
  - Message and role types
  - Request/response schemas
  - Error handling types
  - Configuration interfaces

#### 3. Integration Points
- **Primary:** src/lib/recommendations.ts
- **Features:**
  - Hybrid recommendation system
  - AI insights integration
  - Fallback mechanisms
  - Weather-aware adjustments

### Environment Configuration
```env
# Production
CLAUDE_API_KEY=your_production_key
CLAUDE_MODEL=claude-3-sonnet-20240229

# Development
CLAUDE_API_KEY=your_development_key
```

### Development Workflow
1. Use development API key
2. Test recommendations locally
3. Verify AI insights integration
4. Check error handling
5. Monitor API usage

### Production Workflow
1. Use production API key
2. Monitor API costs and usage
3. Track recommendation quality
4. Analyze user engagement
5. Optimize prompts based on feedback

## Email Notification System

### Overview
The notification system uses Resend for email delivery, with environment-specific configurations for development and production. It supports multiple notification types with React-based email templates.

### Components

#### 1. Email Service Integration
- **Provider:** Resend
- **Configuration:**
  - Development: Test API key, onboarding@resend.dev sender
  - Production: Production API key, notifications@lawnsync.app sender

#### 2. Email Templates
- **Framework:** React Email
- **Types:**
  - Task Reminders
  - Weather Alerts
  - Weekly Summaries
  - Care Recommendations
- **Location:** src/emails/*.tsx

#### 3. Notification Service
- **Location:** src/lib/notifications.ts
- **Features:**
  - Environment-aware configuration
  - Template rendering
  - Error handling
  - Logging

#### 4. Testing Infrastructure
- **Location:** scripts/test-notifications.js
- **Features:**
  - Test all notification types
  - Environment-specific routing
  - Rate limiting handling
  - Detailed error reporting

### API Endpoints

#### Test Notifications
```typescript
POST /api/test-notifications
Body: {
  type: NotificationType,
  data: any
}
Response: {
  message: string,
  result: ResendResponse
}
```

### Environment Variables
```env
# Production
RESEND_API_KEY=re_3C2oLu3h_...

# Development
RESEND_TEST_API_KEY=re_Xn97rA4h_...
```

### Development Workflow
1. Use test API key
2. Send to verified email (tlagaly@gmail.com)
3. Run test script for verification
4. Check logs for any issues

### Production Workflow
1. Use production API key
2. Send from verified domain
3. Send to user's registered email
4. Monitor delivery status