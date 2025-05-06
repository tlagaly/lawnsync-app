import { create } from 'zustand';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './authStore';

// Configuration for mock mode (for local testing without Firebase)
const USE_MOCK_DB = true;

// In-memory mock database
let mockUserProfiles: Record<string, any> = {};

// Types for lawn profile data
export interface LawnProfile {
  location: string;
  lawnType: string;
  goals: string[];
  createdAt: number;
  updatedAt: number;
}

interface UserProfileState {
  userProfile: {
    uid: string;
    displayName: string | null;
    email: string | null;
    lawnProfiles: LawnProfile[];
    preferredLawnProfileId: string | null;
  } | null;
  isLoading: boolean;
  error: string | null;
  initializeUserProfile: (uid: string, email: string | null) => Promise<void>;
  addLawnProfile: (lawnProfile: Omit<LawnProfile, 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfileState['userProfile']>) => Promise<void>;
  setPreferredLawnProfile: (lawnProfileId: string) => Promise<void>;
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  userProfile: null,
  isLoading: false,
  error: null,

  initializeUserProfile: async (uid: string, email: string | null) => {
    try {
      set({ isLoading: true, error: null });
      
      if (USE_MOCK_DB) {
        console.log('Initializing mock user profile for:', uid, email);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Check if user profile exists in mock DB
        if (mockUserProfiles[uid]) {
          console.log('Found existing mock user profile:', mockUserProfiles[uid]);
          set({
            userProfile: mockUserProfiles[uid],
            isLoading: false
          });
        } else {
          // Create new user profile
          const newUserProfile = {
            uid,
            email,
            displayName: email ? email.split('@')[0] : 'User',
            lawnProfiles: [],
            preferredLawnProfileId: null
          };
          
          // Store in mock DB
          mockUserProfiles[uid] = newUserProfile;
          
          console.log('Created new mock user profile:', newUserProfile);
          set({ userProfile: newUserProfile, isLoading: false });
        }
      } else {
        // Real Firestore implementation
        // Check if user profile exists
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          // User profile exists, load it
          set({
            userProfile: userDocSnap.data() as UserProfileState['userProfile'],
            isLoading: false
          });
        } else {
          // Create new user profile
          const newUserProfile = {
            uid,
            email,
            displayName: null,
            lawnProfiles: [],
            preferredLawnProfileId: null
          };
          
          await setDoc(userDocRef, newUserProfile);
          set({ userProfile: newUserProfile, isLoading: false });
        }
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addLawnProfile: async (lawnProfile) => {
    try {
      set({ isLoading: true, error: null });
      const { userProfile } = get();
      const auth = useAuthStore.getState();
      
      if (!userProfile || !auth.user) {
        throw new Error('User not authenticated');
      }
      
      // Create a new lawn profile with timestamps
      const newLawnProfile: LawnProfile = {
        ...lawnProfile,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // Add to user's lawn profiles
      const updatedLawnProfiles = [...userProfile.lawnProfiles, newLawnProfile];
      
      // Check if this is the first lawn profile and set as preferred if it is
      const preferredLawnProfileId = userProfile.preferredLawnProfileId ||
        (updatedLawnProfiles.length === 1 ? '0' : null);
      
      if (USE_MOCK_DB) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Update mock user profile
        const updatedUserProfile = {
          ...userProfile,
          lawnProfiles: updatedLawnProfiles,
          preferredLawnProfileId
        };
        
        // Store in mock DB
        mockUserProfiles[userProfile.uid] = updatedUserProfile;
        
        console.log('Added lawn profile to mock DB:', newLawnProfile);
        console.log('Updated user profile:', updatedUserProfile);
        
        // Update local state
        set({
          userProfile: updatedUserProfile,
          isLoading: false
        });
      } else {
        // Update user profile in Firestore
        const userDocRef = doc(db, 'users', userProfile.uid);
        await setDoc(userDocRef, {
          ...userProfile,
          lawnProfiles: updatedLawnProfiles,
          preferredLawnProfileId,
          updatedAt: Date.now()
        }, { merge: true });
        
        // Update local state
        set({
          userProfile: {
            ...userProfile,
            lawnProfiles: updatedLawnProfiles,
            preferredLawnProfileId
          },
          isLoading: false
        });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateUserProfile: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const { userProfile } = get();
      
      if (!userProfile) {
        throw new Error('User profile not initialized');
      }
      
      if (USE_MOCK_DB) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Update mock user profile
        const updatedUserProfile = {
          ...userProfile,
          ...data,
          updatedAt: Date.now()
        };
        
        // Store in mock DB
        mockUserProfiles[userProfile.uid] = updatedUserProfile;
        
        console.log('Updated user profile in mock DB:', updatedUserProfile);
        
        // Update local state
        set({
          userProfile: updatedUserProfile,
          isLoading: false
        });
      } else {
        // Update user profile in Firestore
        const userDocRef = doc(db, 'users', userProfile.uid);
        await setDoc(userDocRef, {
          ...userProfile,
          ...data,
          updatedAt: Date.now()
        }, { merge: true });
        
        // Update local state
        set({
          userProfile: {
            ...userProfile,
            ...data
          },
          isLoading: false
        });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setPreferredLawnProfile: async (lawnProfileId) => {
    try {
      set({ isLoading: true, error: null });
      const { userProfile } = get();
      
      if (!userProfile) {
        throw new Error('User profile not initialized');
      }
      
      if (USE_MOCK_DB) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Update mock user profile
        const updatedUserProfile = {
          ...userProfile,
          preferredLawnProfileId: lawnProfileId,
          updatedAt: Date.now()
        };
        
        // Store in mock DB
        mockUserProfiles[userProfile.uid] = updatedUserProfile;
        
        console.log('Updated preferred lawn profile in mock DB:', lawnProfileId);
        
        // Update local state
        set({
          userProfile: updatedUserProfile,
          isLoading: false
        });
      } else {
        // Update user profile in Firestore
        const userDocRef = doc(db, 'users', userProfile.uid);
        await setDoc(userDocRef, {
          ...userProfile,
          preferredLawnProfileId: lawnProfileId,
          updatedAt: Date.now()
        }, { merge: true });
        
        // Update local state
        set({
          userProfile: {
            ...userProfile,
            preferredLawnProfileId: lawnProfileId
          },
          isLoading: false
        });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  }
}));

// Initialize user profile when auth state changes
useAuthStore.subscribe((state) => {
  const user = state.user;
  if (user) {
    useUserProfileStore.getState().initializeUserProfile(user.uid, user.email);
  } else {
    useUserProfileStore.setState({ userProfile: null });
  }
});

export default useUserProfileStore;