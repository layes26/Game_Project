'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { isAuthAvailable } from '@/lib/firebase';

// Types
interface UserProfile {
  id: string;
  uid: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
}

interface AuthState {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirebaseReady: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
  }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  clearAuth: () => void;
  resetPassword: (email: string) => Promise<void>;
  checkFirebaseStatus: () => boolean;
}

// Helper to convert Firebase user to UserProfile
const convertToUserProfile = (firebaseUser: FirebaseUser, username?: string): UserProfile => {
  const nameParts = firebaseUser.displayName?.split(' ') || ['User'];
  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    username: username || nameParts[0] || firebaseUser.email?.split('@')[0] || 'user',
    firstName: nameParts[0] || 'User',
    lastName: nameParts.slice(1).join(' ') || '',
    avatar: firebaseUser.photoURL || undefined,
    role: 'USER',
    createdAt: new Date(),
  };
};

// Check if Firebase is available
const checkFirebase = (): boolean => {
  if (typeof window === 'undefined') return false;
  return isAuthAvailable();
};

// Get Firebase auth instance safely
async function getAuth() {
  if (!isAuthAvailable()) {
    return null;
  }
  const { auth } = await import('@/lib/firebase');
  return auth;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      isLoading: false,
      isFirebaseReady: checkFirebase(),

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          if (!email || !password) {
            throw new Error('Please fill in all fields');
          }

          const auth = await getAuth();
          if (!auth) {
            throw new Error('Firebase is not configured');
          }

          // Step 1: Authenticate with Firebase
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          // Step 2: Get ID token
          const token = await userCredential.user.getIdToken();
          
          // Step 3: Sync with backend
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Backend authentication failed');
          }

          const userProfile = convertToUserProfile(userCredential.user);

          localStorage.setItem('firebaseToken', token);

          set({
            user: userProfile,
            firebaseUser: userCredential.user,
            isAuthenticated: true,
            isLoading: false,
          });
          
          toast.success('Login successful!');
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.message || 'Login failed';
          toast.error(errorMessage);
          throw error;
        }
      },

      loginWithGoogle: async () => {
        try {
          set({ isLoading: true });
          
          const auth = await getAuth();
          if (!auth) {
            throw new Error('Firebase is not configured');
          }

          const provider = new GoogleAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          
          // Step 1: Get ID token
          const token = await userCredential.user.getIdToken();
          
          // Step 2: Sync with backend
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
          await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }).catch(err => {
            // Backend sync is non-blocking for existing users
            console.warn('Backend sync failed:', err);
          });
          
          const userProfile = convertToUserProfile(userCredential.user);

          localStorage.setItem('firebaseToken', token);

          set({
            user: userProfile,
            firebaseUser: userCredential.user,
            isAuthenticated: true,
            isLoading: false,
          });
          
          toast.success('Google login successful!');
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.message || 'Google login failed';
          toast.error(errorMessage);
          throw error;
        }
      },

      register: async (data: {
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        password: string;
      }) => {
        try {
          set({ isLoading: true });
          
          if (!data.email || !data.password || !data.username) {
            throw new Error('Please fill in all fields');
          }

          if (data.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }

          const auth = await getAuth();
          if (!auth) {
            throw new Error('Firebase is not configured');
          }

          // Step 1: Create user with Firebase
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            data.email, 
            data.password
          );
          
          // Step 2: Get ID token from Firebase
          const token = await userCredential.user.getIdToken();
          
          // Step 3: Call backend to create user profile in MongoDB
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: data.email,
              username: data.username,
              firstName: data.firstName,
              lastName: data.lastName,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create user profile');
          }

          const userProfile: UserProfile = {
            id: userCredential.user.uid,
            uid: userCredential.user.uid,
            email: data.email,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'USER',
            createdAt: new Date(),
          };

          localStorage.setItem('firebaseToken', token);
          
          set({
            user: userProfile,
            firebaseUser: userCredential.user,
            isAuthenticated: true,
            isLoading: false,
          });
          
          toast.success('Registration successful!');
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.message || 'Registration failed';
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: async () => {
        try {
          const auth = await getAuth();
          if (auth) {
            await signOut(auth);
          }
        } catch (error) {
          console.error('Firebase logout error:', error);
        }
        
        localStorage.removeItem('firebaseToken');
        
        set({
          user: null,
          firebaseUser: null,
          isAuthenticated: false,
        });
        
        toast.success('Logged out successfully');
      },

      refreshUser: async () => {
        const firebaseUser = get().firebaseUser;
        if (!firebaseUser) return;
        
        try {
          const token = await firebaseUser.getIdToken(true);
          localStorage.setItem('firebaseToken', token);
        } catch (error) {
          console.error('Token refresh error:', error);
        }
      },

      setFirebaseUser: (user: FirebaseUser | null) => {
        set({ firebaseUser: user });
        
        if (user) {
          const userProfile = convertToUserProfile(user);
          set({ 
            user: userProfile,
            isAuthenticated: true 
          });
          
          user.getIdToken().then(token => {
            localStorage.setItem('firebaseToken', token);
          });
        } else {
          set({ 
            user: null, 
            isAuthenticated: false 
          });
        }
      },

      clearAuth: () => {
        localStorage.removeItem('firebaseToken');
        
        set({
          user: null,
          firebaseUser: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      resetPassword: async (email: string) => {
        try {
          if (!email) {
            throw new Error('Please enter your email');
          }
          
          const auth = await getAuth();
          if (!auth) {
            throw new Error('Firebase is not configured');
          }
          
          await sendPasswordResetEmail(auth, email);
          toast.success('Password reset email sent!');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to send reset email';
          toast.error(errorMessage);
          throw error;
        }
      },

      checkFirebaseStatus: () => {
        return checkFirebase();
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

function get() {
  return useAuthStore.getState();
}

export function initializeAuthListener() {
  if (typeof window === 'undefined') return;

  // Skip if Firebase is not configured
  if (!isAuthAvailable()) {
    console.log('Firebase not configured - skipping auth listener');
    return;
  }

  import('@/lib/firebase').then(({ auth }) => {
    if (!auth) return;
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      if (!auth) return;
      onAuthStateChanged(auth, (user) => {
        useAuthStore.getState().setFirebaseUser(user);
      });
    });
  });
}

