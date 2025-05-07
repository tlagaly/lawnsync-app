# Firebase Setup Guide for LawnSync

This document outlines the steps for setting up Firebase for the LawnSync app across different environments (development, staging, and production).

## Prerequisites

- Firebase account with admin access
- Node.js and npm installed
- LawnSync repository cloned locally

## Step 1: Create Firebase Projects

You'll need to create separate Firebase projects for each environment:

1. **Development Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Name it "lawnsync-app-dev"
   - Enable Google Analytics (recommended)
   - Choose appropriate region (US/North America recommended for lowest latency)
   - Complete the setup

2. **Staging Project** (Optional)
   - Repeat the process but name it "lawnsync-app-staging"

3. **Production Project**
   - Repeat the process but name it "lawnsync-app"

## Step 2: Register Web Applications

For each Firebase project, you need to register a web application:

1. In your Firebase project, click the web icon (</>) to add a web app
2. Register the app with an appropriate nickname (e.g., "lawnsync-web-dev")
3. (Optional) Configure Firebase Hosting 
4. Copy the Firebase configuration object for use in the next step

## Step 3: Configure Environment Variables

1. Copy the `.env.example` file to create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

2. Update the Firebase configuration variables in `.env.local` with the values from each of your Firebase projects

3. Set the appropriate environment variables:
   - `NODE_ENV` - Set to 'development', 'staging', or 'production'
   - `VITE_USE_MOCK_FIREBASE` - Set to 'false' to use real Firebase services

## Step 4: Enable Authentication

For each Firebase project:

1. Go to Authentication in the Firebase Console
2. Click "Get started"
3. Enable Email/Password authentication method
4. Optional: Enable additional authentication methods (Google, Facebook)
5. Configure authentication templates and settings as needed

## Step 5: Configure Firestore Database

1. Go to Firestore Database in the Firebase Console
2. Click "Create database"
3. Start in test mode initially, then switch to production rules later
4. Choose a database location (preferably the same region as your project)
5. Upload the `firestore.rules` file from the project:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Step 6: Set Up Firebase Storage

1. Go to Storage in the Firebase Console
2. Click "Get started"
3. Configure storage settings and location
4. Upload the `storage.rules` file from the project:
   ```bash
   firebase deploy --only storage:rules
   ```

## Step 7: Install Firebase CLI (Optional)

For additional Firebase functionality like deploying rules, Functions, or Hosting:

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in the project:
   ```bash
   firebase init
   ```
   
   Select the appropriate features (Firestore, Storage, Authentication, Hosting if needed)

## Step 8: Testing Firebase Integration

1. Make sure the Firebase configuration is correctly set up in `.env.local`
2. Set `VITE_USE_MOCK_FIREBASE=false` in your `.env.local` file
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Test authentication, Firestore operations, and Storage uploads

## Firebase Emulator Suite (Optional)

For local development without using actual Firebase resources:

1. Install the Firebase Emulator Suite:
   ```bash
   firebase init emulators
   ```
   
   Select the emulators you want to use (Auth, Firestore, Storage)

2. Start the emulators:
   ```bash
   firebase emulators:start
   ```

3. Configure the app to use emulators by setting:
   ```
   USE_EMULATORS=true
   ```

## Security Considerations

- Never commit `.env` files containing actual Firebase credentials to version control
- Use different Firebase projects for different environments
- Regularly review and update security rules
- Set up Firebase budget alerts to avoid unexpected charges
- Implement proper data validation in your application

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)