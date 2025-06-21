"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

interface AuthContextType {
  user: any;
  userProfile: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, displayName: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  logout: () => Promise<any>;
  refreshUserProfile: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Update online status
  useEffect(() => {
    if (!user) return

    // Update user's online status and last seen
    const updateOnlineStatus = async (isOnline: boolean) => {
      try {
        const userRef = doc(db, 'users', user.uid)
        await setDoc(userRef, {
          isOnline,
          lastSeen: serverTimestamp()
        }, { merge: true })
      } catch (error) {
        console.error('Error updating online status:', error)
      }
    }

    // Set online when component mounts
    updateOnlineStatus(true)

    // Set up visibility change listener
    const handleVisibilityChange = () => {
      updateOnlineStatus(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Set up beforeunload listener
    const handleBeforeUnload = () => {
      updateOnlineStatus(false)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Set up focus/blur listeners
    const handleFocus = () => updateOnlineStatus(true)
    const handleBlur = () => updateOnlineStatus(false)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      updateOnlineStatus(false)
    }
  }, [user])

  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 