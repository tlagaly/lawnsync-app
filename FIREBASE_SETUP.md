# Firebase Setup Guide for LawnSync

This document outlines the steps for setting up Firebase for the LawnSync app across different environments (development, staging, and production).

## Prerequisites

- Firebase account with admin access
- Node.js and npm installed
- LawnSync repository cloned locally

## Overview of Multi-Environment Architecture

LawnSync uses three separate Firebase environments:

1. **Development Environment**
   - Used for active feature development
   - May have more relaxed security rules for testing
   - Named `lawnsync-app-dev` in Firebase Console

2. **Staging Environment**
   - Used for pre-release testing
   - Has production-like security settings
   - Contains test data that mimics production
   - Named `lawnsync-app-staging` in Firebase Console

3. **Production Environment**
   - Used for the live application
   - Has strict security rules
   - Contains real user data
   - Named `lawnsync-app` in Firebase Console

## Step 1: Create Firebase Projects

You'll need to create separate Firebase projects for each environment:

1. **Development Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Name it "lawnsync-app-dev"
   - Enable Google Analytics (required for full feature set)
   - Choose the resource location "us-central" for all services
   - Complete the setup and take note of your project ID

2. **Staging Project**
   - Repeat the process but name it "lawnsync-app-staging"
   - Use the same resource location (us-central)
   - Enable the same settings as the development project

3. **Production Project**
   - Repeat the process but name it "lawnsync-app"
   - Use the same resource location (us-central)
   - Enable the same settings as the other projects

## Step 2: Register Web Applications

For each Firebase project, you need to register a web application:

1. In your Firebase project, click the web icon (</>) to add a web app
2. Register the app with an appropriate nickname:
   - Development: "lawnsync-web-dev"
   - Staging: "lawnsync-web-staging"
   - Production: "lawnsync-web-prod"
3. Do not enable Firebase Hosting yet (this will be configured later)
4. Copy the Firebase configuration object for use in the next step

The configuration will look similar to this:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

## Step 3: Configure Environment Variables

1. Copy the `.env.example` file to create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

2. For each Firebase project, copy the configuration values to the corresponding variables in `.env.local`:
   - Development values go to `VITE_FIREBASE_DEV_*` variables
   - Staging values go to `VITE_FIREBASE_STAGING_*` variables
   - Production values go to `VITE_FIREBASE_PROD_*` variables

3. Set the appropriate environment variables:
   - `VITE_NODE_ENV` - Set to 'development', 'staging', or 'production'
   - `VITE_USE_MOCK_FIREBASE` - Set to 'false' to use real Firebase services
   - `VITE_USE_EMULATORS` - Set to 'true' if using local emulators

## Step 4: Configure Project Team Access

For each Firebase project:

1. Go to Project Settings > Users and permissions
2. Add team members with appropriate roles:
   - **Owner**: Full administrative access (limit this role)
   - **Editor**: Can modify most settings but not critical ones
   - **Viewer**: Read-only access for monitoring

Configure role-specific permissions:
- Development: More permissive access for developers
- Staging: Restricted to lead developers and testers
- Production: Highly restricted to project leads only

## Step 5: Enable Authentication

For each Firebase project:

1. Go to Authentication in the Firebase Console
2. Click "Get started"
3. Enable Email/Password authentication method
4. Optional: Enable additional authentication methods (Google, Facebook)
5. Configure authentication templates:
   - Customize email verification template
   - Set up password reset emails
   - Configure multi-factor authentication settings

6. Set authentication session duration appropriate for each environment:
   - Development: Longer session times for ease of testing
   - Production: More secure, shorter session times

## Step 6: Configure Firestore Database

For each Firebase project:

1. Go to Firestore Database in the Firebase Console
2. Click "Create database"
3. Select the security mode:
   - Development: Start in test mode
   - Staging: Start in production mode
   - Production: Start in production mode
4. Choose location: us-central (same as project)
5. Create the following collections for initial setup:
   - `users` - User profiles
   - `lawn_profiles` - Lawn information
   - `tasks` - Scheduled tasks
   - `watering_schedules` - Watering configurations
   - `photos` - Lawn progress photos
   - `plant_identifications` - Plant ID records

6. Set up database rules by uploading the `firestore.rules` file:
   ```bash
   firebase use <project-id>  # Select the appropriate project
   firebase deploy --only firestore:rules
   ```

## Step 7: Set Up Firebase Storage

For each Firebase project:

1. Go to Storage in the Firebase Console
2. Click "Get started"
3. Choose the same location (us-central)
4. Configure storage rules (start with default rules)
5. Create folder structure:
   - `/profile-photos/`
   - `/lawn-photos/`
   - `/plant-identification/`

6. Upload storage rules:
   ```bash
   firebase use <project-id>  # Select the appropriate project
   firebase deploy --only storage:rules
   ```

## Step 8: Enable Firebase Analytics

For each Firebase project:

1. Go to Analytics in Firebase Console
2. Configure Analytics settings
3. Set up events to track:
   - User registration
   - Feature usage
   - Session duration
   - Custom events for lawn care activities

4. For the Production environment, set up conversion tracking.

## Step 9: Configure Firebase Cloud Messaging (FCM)

For each Firebase project:

1. Go to Project Settings > Cloud Messaging
2. Generate and note your VAPID key for web push notifications
3. Update the `.env.local` file with the VAPID key:
   - Development: `VITE_FIREBASE_DEV_VAPID_KEY`
   - Staging: `VITE_FIREBASE_STAGING_VAPID_KEY`
   - Production: `VITE_FIREBASE_PROD_VAPID_KEY`

## Step 10: Testing Firebase Integration

1. Make sure the environment variables are correctly set up in `.env.local`
2. Set `VITE_USE_MOCK_FIREBASE=false` and `VITE_NODE_ENV=development`
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Test each Firebase service:
   - Authentication: Register/login
   - Firestore: Create/read documents
   - Storage: Upload files
   - Analytics: Verify events are logged (check Firebase console)
   - Cloud Messaging: Test notifications

## Firebase Emulator Suite (Recommended for Development)

For local development without using actual Firebase resources:

1. Install the Firebase CLI if not already installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in the project:
   ```bash
   firebase init emulators
   ```
   
   Select the emulators you want to use (Auth, Firestore, Storage)

4. Start the emulators:
   ```bash
   firebase emulators:start
   ```

5. Configure the app to use emulators by setting:
   ```
   VITE_USE_EMULATORS=true
   ```

## Security Considerations

- Never commit `.env` files containing actual Firebase credentials to version control
- Use different Firebase projects for different environments
- Regularly review and update security rules
- Set up Firebase budget alerts to avoid unexpected charges
- Implement proper data validation in your application
- Use Firebase App Check for production to prevent abuse
- Regularly backup Firestore data
- Limit Firebase Admin SDK access to secure environments

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)