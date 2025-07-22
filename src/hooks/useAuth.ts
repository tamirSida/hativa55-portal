'use client';

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/models/User';
import { UserService } from '@/services/UserService';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  identityId: string;
  university?: string;
  field?: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null
  });

  const userService = new UserService();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let user = await userService.getUserByEmail(firebaseUser.email!);
          
          if (!user) {
            const userId = await userService.createUser({
              email: firebaseUser.email!,
              name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
              identityId: '', // This should not happen in normal flow
              contactInfo: {},
              tags: { canOffer: [], lookingFor: [], interests: [] },
              businesses: []
            });
            
            user = await userService.getById(userId);
          }

          setAuthState({
            user,
            firebaseUser,
            loading: false,
            error: null
          });
        } catch (error) {
          setAuthState({
            user: null,
            firebaseUser: null,
            loading: false,
            error: `Failed to load user profile: ${error}`
          });
        }
      } else {
        setAuthState({
          user: null,
          firebaseUser: null,
          loading: false,
          error: null
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async ({ email, password }: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      throw new Error(errorMessage);
    }
  };

  const register = async ({ email, password, name, identityId, university, field }: RegisterData): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Check if identity ID is already taken
      const isIdentityAvailable = await userService.isIdentityIdAvailable(identityId);
      if (!isIdentityAvailable) {
        throw new Error('תעודת הזהות כבר קיימת במערכת');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: name
      });

      const userId = await userService.createUser({
        email,
        name,
        identityId,
        university,
        field,
        contactInfo: {},
        tags: { canOffer: [], lookingFor: [], interests: [] },
        businesses: []
      });

      const user = await userService.getById(userId);

      setAuthState({
        user,
        firebaseUser: userCredential.user,
        loading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.message.includes('תעודת הזהות') ? 
        error.message : 
        getAuthErrorMessage(error.code);
      
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      throw new Error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      const errorMessage = 'התרחשה שגיאה בעת ההתנתקות';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    if (!authState.user) throw new Error('User not authenticated');

    try {
      await userService.updateUserProfile(authState.user.id, updates);
      
      const updatedUser = await userService.getById(authState.user.id);
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
    } catch (error) {
      throw new Error(`Failed to update profile: ${error}`);
    }
  };

  const refreshUserProfile = async (): Promise<void> => {
    if (!authState.user) return;

    try {
      const refreshedUser = await userService.getById(authState.user.id);
      setAuthState(prev => ({
        ...prev,
        user: refreshedUser
      }));
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  const clearError = (): void => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    user: authState.user,
    firebaseUser: authState.firebaseUser,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    login,
    register,
    logout,
    updateUserProfile,
    refreshUserProfile,
    clearError
  };
};

const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'לא נמצא משתמש עם כתובת אימייל זו';
    case 'auth/wrong-password':
      return 'סיסמה שגויה';
    case 'auth/email-already-in-use':
      return 'כתובת האימייל כבר קיימת במערכת';
    case 'auth/weak-password':
      return 'הסיסמה חלשה מדי';
    case 'auth/invalid-email':
      return 'כתובת אימייל לא תקינה';
    case 'auth/too-many-requests':
      return 'יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר';
    case 'auth/network-request-failed':
      return 'שגיאת רשת. בדוק את החיבור לאינטרנט';
    default:
      return 'התרחשה שגיאה. נסה שוב';
  }
};