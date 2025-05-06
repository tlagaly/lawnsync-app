import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Mock Firebase configuration for local testing
// This allows us to test without needing to set up a real Firebase project
const USE_MOCK_FIREBASE = true;

// Your web app's Firebase configuration
// This would be replaced with actual values from your Firebase project in production
const firebaseConfig = {
  apiKey: "demo-api-key-for-testing",
  authDomain: "lawnsync-app.firebaseapp.com",
  projectId: "lawnsync-app",
  storageBucket: "lawnsync-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get auth and firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

// Set up emulators for local testing
if (USE_MOCK_FIREBASE) {
  // Local Auth Emulator
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  
  // Local Firestore Emulator
  connectFirestoreEmulator(db, 'localhost', 8080);
  
  console.log('Using Firebase local emulators for testing');
}

export default app;