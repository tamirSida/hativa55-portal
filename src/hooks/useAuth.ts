'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { AdminService } from '@/services/AdminService';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAdmin: boolean;
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
  phone?: string;
  city?: string;
  gdud?: string;
  bio?: string;
}

export const useAuth = () => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    isAdmin: false,
    loading: true,
    error: null
  });

  const userService = new UserService();
  const adminService = new AdminService();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if user is an admin
          let isAdmin = false;
          
          try {
            const adminDoc = await adminService.getAdminByUserId(firebaseUser.uid);
            isAdmin = !!adminDoc && adminDoc.isActive;
          } catch (adminError) {
            // User is not an admin, which is normal
            isAdmin = false;
          }
          
          if (isAdmin) {
            // Admin user - don't create/load User document
            setAuthState({
              user: null,
              firebaseUser,
              isAdmin: true,
              loading: false,
              error: null
            });
          } else {
            // Regular user - handle User document
            let user = null;
            try {
              user = await userService.getById(firebaseUser.uid);
            } catch (userError) {
              // If user document doesn't exist, that's ok - we'll handle it below
              console.log('User document not found, user may be newly registered');
            }

            setAuthState({
              user,
              firebaseUser,
              isAdmin: false,
              loading: false,
              error: null
            });
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setAuthState({
            user: null,
            firebaseUser,
            isAdmin: false,
            loading: false,
            error: null // Don't show error to user for auth state loading
          });
        }
      } else {
        setAuthState({
          user: null,
          firebaseUser: null,
          isAdmin: false,
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

  const register = async ({ email, password, name, identityId, phone, city, gdud, bio }: RegisterData): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    let userCredential: any = null;
    
    try {
      // STEP 1: Validate all data BEFORE creating Firebase Auth user
      const isIdentityAvailable = await userService.isIdentityIdAvailable(identityId);
      if (!isIdentityAvailable) {
        throw new Error('תעודת הזהות כבר קיימת במערכת');
      }

      // STEP 2: Prepare user data
      const userData = {
        email,
        name,
        identityId,
        phone: phone || '',
        city: city || '',
        gdud: gdud || '',
        bio: bio || '',
        hobbyTags: [],
        mentorTags: [],
        businessId: '',
        educationIds: []
      };

      // STEP 3: Only NOW create Firebase Auth user
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // STEP 4: Create Firestore document (if this fails, we'll cleanup the auth user)
      await userService.createUserWithId(userCredential.user.uid, userData);

      const user = await userService.getById(userCredential.user.uid);

      setAuthState({
        user,
        firebaseUser: userCredential.user,
        isAdmin: false,
        loading: false,
        error: null
      });
      
    } catch (error: any) {
      // CLEANUP: If we created a Firebase Auth user but something failed after,
      // we need to delete the Firebase Auth user to maintain consistency
      if (userCredential?.user) {
        try {
          await userCredential.user.delete();
        } catch (cleanupError) {
          console.error('Failed to cleanup Firebase Auth user:', cleanupError);
        }
      }
      
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
      // Auto-redirect to homepage after logout
      router.push('/');
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
    isAdmin: authState.isAdmin,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.firebaseUser, // Changed to check Firebase auth, not User document
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