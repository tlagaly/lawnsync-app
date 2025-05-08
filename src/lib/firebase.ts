import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getMessaging, isSupported, getToken } from 'firebase/messaging';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Environment detection
const ENV = import.meta.env.VITE_NODE_ENV || import.meta.env.MODE || 'development';
const USE_MOCK_FIREBASE = import.meta.env.VITE_USE_MOCK_FIREBASE === 'true';
const USE_EMULATORS = import.meta.env.VITE_USE_EMULATORS === 'true';

console.log(`Firebase initializing in ${ENV} environment. Mock: ${USE_MOCK_FIREBASE}, Emulators: ${USE_EMULATORS}`);

// Get environment-specific Firebase configuration
const getFirebaseConfig = () => {
  // Always fallback to dev if configuration is missing
  switch(ENV) {
    case 'production':
      return {
        apiKey: import.meta.env.VITE_FIREBASE_PROD_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_PROD_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROD_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_PROD_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_PROD_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_PROD_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_PROD_MEASUREMENT_ID
      };
    case 'staging':
      return {
        apiKey: import.meta.env.VITE_FIREBASE_STAGING_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_STAGING_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_STAGING_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STAGING_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_STAGING_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_STAGING_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_STAGING_MEASUREMENT_ID
      };
    case 'development':
    default:
      return {
        apiKey: import.meta.env.VITE_FIREBASE_DEV_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_DEV_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_DEV_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_DEV_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_DEV_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_DEV_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_DEV_MEASUREMENT_ID
      };
  }
};

// Use mock configuration for development if mock flag is enabled
const firebaseConfig = USE_MOCK_FIREBASE ? {
  apiKey: "demo-api-key-for-testing",
  authDomain: "lawnsync-app-dev.firebaseapp.com",
  projectId: "lawnsync-app-dev",
  storageBucket: "lawnsync-app-dev.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
} : getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get auth, firestore, and storage instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firebase Cloud Messaging setup
export let messaging: any = null;

// Initialize Firebase Cloud Messaging and handle token retrieval
export const initializeMessaging = async (): Promise<string | null> => {
  try {
    // Check if browser supports FCM
    const isMessagingSupported = await isSupported();
    
    if (!isMessagingSupported) {
      console.log('Firebase Cloud Messaging is not supported in this browser');
      return null;
    }
    
    // If FCM is supported, initialize it
    messaging = getMessaging(app);
    
    // Get FCM registration token
    const vapidKey = ENV === 'production'
      ? import.meta.env.VITE_FIREBASE_PROD_VAPID_KEY
      : (ENV === 'staging'
          ? import.meta.env.VITE_FIREBASE_STAGING_VAPID_KEY
          : import.meta.env.VITE_FIREBASE_DEV_VAPID_KEY);
    
    const token = await getToken(messaging, {
      vapidKey: vapidKey || 'YOUR-VAPID-KEY-HERE'
    });
    
    if (token) {
      console.log('FCM registration token:', token);
      return token;
    } else {
      console.log('No FCM registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error initializing Firebase Cloud Messaging:', error);
    return null;
  }
};

// Set up emulators for local testing
if (USE_EMULATORS) {
  // Local Auth Emulator
  const authEmulatorUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || "http://localhost:9099";
  connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
  
  // Local Firestore Emulator
  const firestoreHost = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost';
  const firestorePort = parseInt(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || '8080');
  connectFirestoreEmulator(db, firestoreHost, firestorePort);
  
  // Local Storage Emulator
  const storageHost = import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST || 'localhost';
  const storagePort = parseInt(import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_PORT || '9199');
  connectStorageEmulator(storage, storageHost, storagePort);
  
  console.log('Using Firebase local emulators for testing');
}

export default app;