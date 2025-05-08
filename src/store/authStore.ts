import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  type User
} from 'firebase/auth';
import { auth } from '../lib/firebase';

// Configuration for mock mode (for local testing without Firebase)
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_FIREBASE === 'true';

// Mock Firebase user interface
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  sendEmailVerification: () => Promise<void>;
}

// Mock user for local testing
let mockUser: MockUser | null = null;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isEmailVerified: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isEmailVerified: false,

  signUp: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      if (USE_MOCK_AUTH) {
        // Mock implementation for local testing
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!email.includes('@')) {
          throw new Error('Invalid email format');
        }
        
        if (password.length < 6) {
          throw new Error('Password should be at least 6 characters');
        }
        
        mockUser = {
          uid: 'mock-user-' + Math.random().toString(36).substr(2, 9),
          email: email,
          displayName: null,
          emailVerified: false,
          sendEmailVerification: async () => {
            console.log('Mock email verification sent to', email);
            // Simulate email verification after 2 seconds
            setTimeout(() => {
              if (mockUser) {
                mockUser.emailVerified = true;
                set({ isEmailVerified: true });
                console.log('Mock email verified for', email);
              }
            }, 2000);
          }
        };
        
        console.log('Mock signup successful:', mockUser);
        
        set({
          user: mockUser as any as User,
          isAuthenticated: true,
          isLoading: false,
          isEmailVerified: false
        });
        
        // Send verification email automatically after signup
        await get().sendVerificationEmail();
      } else {
        // Real Firebase implementation
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Send email verification
        await sendEmailVerification(userCredential.user);
        
        set({
          user: userCredential.user,
          isAuthenticated: true,
          isLoading: false,
          isEmailVerified: userCredential.user.emailVerified
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false
      });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      if (USE_MOCK_AUTH) {
        // Mock implementation for local testing
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For testing purposes, accept any email with valid format and password length
        if (!email.includes('@')) {
          throw new Error('Invalid email format');
        }
        
        if (password.length < 6) {
          throw new Error('Password should be at least 6 characters');
        }
        
        // Create a mock user for testing
        mockUser = {
          uid: 'mock-user-123',
          email: email,
          displayName: email.split('@')[0], // Use part of email as display name
          emailVerified: true,
          sendEmailVerification: async () => {
            console.log('Mock email verification sent to', email);
            setTimeout(() => {
              if (mockUser) {
                mockUser.emailVerified = true;
                set({ isEmailVerified: true });
                console.log('Mock email verified for', email);
              }
            }, 2000);
          }
        };
        
        console.log('Mock login successful:', mockUser);
        
        set({
          user: mockUser as any as User,
          isAuthenticated: true,
          isLoading: false,
          isEmailVerified: mockUser.emailVerified
        });
      } else {
        // Real Firebase implementation
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        set({
          user: userCredential.user,
          isAuthenticated: true,
          isLoading: false,
          isEmailVerified: userCredential.user.emailVerified
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false
      });
      throw error;
    }
  },

  logOut: async () => {
    try {
      set({ isLoading: true, error: null });
      
      if (USE_MOCK_AUTH) {
        // Mock implementation for local testing
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Reset mock user
        mockUser = null;
        
        console.log('Mock logout successful');
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isEmailVerified: false
        });
      } else {
        // Real Firebase implementation
        await signOut(auth);
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isEmailVerified: false
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false
      });
      throw error;
    }
  },

  sendVerificationEmail: async () => {
    try {
      const { user } = get();
      
      if (!user) {
        throw new Error('No user is currently logged in');
      }
      
      if (USE_MOCK_AUTH) {
        // For mock implementation
        if (mockUser) {
          await mockUser.sendEmailVerification();
        }
      } else {
        // For real Firebase implementation
        await sendEmailVerification(user);
      }
      
      set({ error: null });
    } catch (error) {
      set({
        error: (error as Error).message
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

// Initialize auth state listener
if (USE_MOCK_AUTH) {
  // For mock mode, we don't need a real auth state listener
  // The auth state is managed directly in the store functions
  console.log('Using mock authentication - no auth state listener needed');
  
  // Initialize with no user
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isEmailVerified: false
  });
} else {
  // Real Firebase auth state listener
  onAuthStateChanged(auth, (user) => {
    useAuthStore.setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      isEmailVerified: user ? user.emailVerified : false
    });
  });
}

export default useAuthStore;