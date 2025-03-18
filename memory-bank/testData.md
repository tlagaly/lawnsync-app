# Test Data

## Authentication Test Credentials

### Default Test User
- Name: Test User
- Email: test@example.com
- Password: password123

This user account has been created in the development database and can be used for testing purposes. The account has basic user permissions and can be used to test:
- Sign-in functionality
- Protected route access
- Session management
- Authentication flows

## Using Test Credentials

### Development Environment
The test user is automatically:
1. Created if it doesn't exist (via /api/setup endpoint)
2. Signed in when accessing protected routes
3. Managed by the auto-login system

### Manual Testing
If needed, you can still sign in manually:
1. Navigate to `/signin`
2. Enter the email and password listed above
3. You should be redirected to the dashboard upon successful authentication

## Notes
- These credentials are for development/testing only
- Do not use these credentials in production
- Test user is automatically managed in development
- Auto-login is disabled in production environment
- If the test account becomes corrupted, it will be recreated automatically

## Weather Integration Test Data

### Test Location
- City: Lawrence
- ZIP: 66044
- Expected weather data available

### Test Lawn Profile
- Size: 5000 sq ft
- Grass Type: Kentucky Bluegrass
- Sun Exposure: Full Sun
- Location: 66044

### Weather API Testing
1. Current Weather Endpoint
   ```
   GET /api/weather/current?location=66044
   ```
   Expected response includes:
   - Temperature
   - Condition
   - Humidity
   - Wind Speed
   - Weather Icon

2. Forecast Endpoint
   ```
   GET /api/weather/forecast?location=66044
   ```
   Expected response includes:
   - 5-day forecast
   - Daily temperatures
   - Weather conditions
   - Weather icons

### Task Recommendation Testing
Test conditions for outdoor tasks:
- Good Weather:
  - Temperature: 65°F
  - Clear skies
  - Wind: 5mph
- Bad Weather:
  - Temperature: 45°F
  - Rain
  - Wind: 20mph