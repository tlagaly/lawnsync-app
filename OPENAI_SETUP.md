# OpenAI Integration Guide for LawnSync

This document outlines the steps for setting up and using OpenAI's GPT-3.5 Turbo integration for LawnSync across different environments (development, staging, and production).

## Prerequisites

- OpenAI account with API access
- API keys for each environment (development, staging, production)
- LawnSync repository cloned locally

## Step 1: Register for OpenAI API Keys

1. **Create an OpenAI Account**
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Sign up or log in to your account

2. **Create API Keys**
   - Navigate to the [API Keys](https://platform.openai.com/api-keys) section
   - Create separate API keys for each environment:
     - Development: Label it "LawnSync Dev"
     - Staging: Label it "LawnSync Staging"
     - Production: Label it "LawnSync Production"
   - Store these keys securely; they cannot be viewed again after creation

3. **Set Usage Limits**
   - Go to [Usage Limits](https://platform.openai.com/account/limits)
   - Set appropriate hard and soft limits for API usage
   - Recommended production limit: $50-100/month initially

## Step 2: Configure Environment Variables

1. **Update .env.local File**
   - Copy the `.env.example` file to create a `.env.local` file if not already done:
     ```bash
     cp .env.example .env.local
     ```

2. **Add OpenAI Configuration Variables**
   - Update the following variables in your `.env.local` file:
     ```
     # OpenAI API Configuration
     VITE_OPENAI_API_KEY_DEV=your_dev_openai_api_key_here
     VITE_OPENAI_API_KEY_STAGING=your_staging_openai_api_key_here
     VITE_OPENAI_API_KEY_PROD=your_prod_openai_api_key_here
     VITE_USE_MOCK_OPENAI=false  # Set to true for local development without API calls
     VITE_OPENAI_MODEL=gpt-3.5-turbo  # Model to use for recommendations
     VITE_OPENAI_CACHE_DURATION=86400000  # 24 hours in milliseconds
     VITE_OPENAI_RATE_LIMIT=50  # Max API calls per hour
     VITE_OPENAI_TIMEOUT=10000  # API request timeout in milliseconds
     ```

3. **Set the Appropriate Environment**
   - Set `NODE_ENV` to 'development', 'staging', or 'production'
   - For local development without using actual OpenAI resources, set `VITE_USE_MOCK_OPENAI=true`

## Step 3: Using the Recommendation Service

The OpenAI integration is primarily used through the recommendation service, which provides personalized lawn care recommendations:

```typescript
import { 
  generateRecommendation, 
  buildRecommendationRequest 
} from '../lib/recommendationService';

// Example usage
const userRequest = await buildRecommendationRequest(userId);
const recommendation = await generateRecommendation(userRequest);
```

### Key Features

1. **Environment-Based API Keys**
   - The service automatically selects the correct API key based on the current environment
   - No code changes needed when deploying to different environments

2. **Rate Limiting**
   - Built-in rate limiting prevents excessive API usage
   - Configurable via the `VITE_OPENAI_RATE_LIMIT` environment variable

3. **Caching System**
   - Responses are cached to minimize API calls and reduce costs
   - Cache duration configurable via `VITE_OPENAI_CACHE_DURATION`

4. **Error Handling & Fallbacks**
   - Comprehensive error handling with fallback recommendations
   - Automatic retries with exponential backoff for transient errors

5. **Detailed Logging**
   - API calls, errors, and usage statistics are logged
   - View through the Admin API Monitor Dashboard

## Step 4: API Monitoring Dashboard

The API Monitor Dashboard allows administrators to:

1. **View Usage Statistics**
   - Total calls, success rates, token usage
   - Cost estimation based on current usage

2. **Monitor Rate Limiting**
   - Track remaining API quota
   - Prevents unexpected overage charges

3. **Test API Integration**
   - Generate test recommendations
   - Verify API connectivity and response quality

To access the dashboard, navigate to the admin section of the app:

```typescript
import ApiMonitorDashboard from '../features/dashboard/components/ApiMonitorDashboard';

// Use in your admin component
function AdminPanel() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <ApiMonitorDashboard />
    </div>
  );
}
```

## Step 5: Testing the Integration

1. **Local Testing with Mock Data**
   - Set `VITE_USE_MOCK_OPENAI=true` in your `.env.local`
   - This uses realistic mock data without making actual API calls

2. **Testing with Real API**
   - Set `VITE_USE_MOCK_OPENAI=false` in your `.env.local`
   - Use your development API key for initial testing
   - Use the API Monitor Dashboard's test feature to generate recommendations

3. **Verifying Integration**
   - Check the console logs for details on API requests
   - Verify token usage and response quality

## Security Considerations

- Never commit `.env` files containing actual API keys
- Use different API keys for different environments
- Set up usage limits to prevent unexpected costs
- Implement proper error handling to avoid exposing sensitive information
- Rate limit API requests to prevent abuse

## Troubleshooting

### API Key Issues
- Error: "Authentication error" - Check that your API key is valid and has been entered correctly
- Error: "Rate limit exceeded" - You've hit the rate limit; wait until the limit resets or increase your limit

### Response Formatting
- If responses aren't properly formatted, check the system and user prompts in `recommendationService.ts`
- The `callOpenAI` function includes JSON extraction logic to handle various response formats

### Caching Issues
- To force fresh data, use the `clearRecommendationCache()` function
- Adjust cache duration via the `VITE_OPENAI_CACHE_DURATION` environment variable

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [OpenAI Usage Policies](https://platform.openai.com/docs/usage-policies)
- [OpenAI Pricing](https://openai.com/pricing)
- [GPT-3.5 Turbo Model Details](https://platform.openai.com/docs/models/gpt-3-5-turbo)