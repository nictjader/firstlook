
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithCustomToken, signOut as firebaseSignOut, sendSignInLinkToEmail } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { docToUserProfileClient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Define the Google credential response callback on the window object
declare global {
  interface Window {
    google?: any;
    handleCredentialResponse?: (response: any) => void;
  }
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  toggleFavoriteStory: (storyId: string) => Promise<void>;
  markStoryAsRead: (storyId: string) => void;
  sendEmailSignInLink: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (firebaseUser: User) => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setUserProfile(docToUserProfileClient(userDocSnap.data()!, firebaseUser.uid));
    }
  }, []);

  useEffect(() => {
    // This is the callback function that the Google Sign-In library will call
    // with the user's credential after a successful sign-in.
    window.handleCredentialResponse = async (response: any) => {
      setLoading(true);
      try {
        // Send the Google credential to our backend API
        const res = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.details || 'Failed to exchange token.');
        }

        // Get the custom Firebase token from our backend
        const { token } = await res.json();
        
        // Sign in to Firebase with the custom token
        await signInWithCustomToken(auth, token);
        
        toast({
            variant: 'success',
            title: 'Sign In Successful',
            description: 'Welcome back!',
        });

      } catch (error: any) {
        console.error("Manual sign-in failed:", error);
        toast({ title: "Sign-In Failed", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        fetchUserProfile(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      delete window.handleCredentialResponse;
    };
  }, [toast, fetchUserProfile]);

  const signOut = useCallback(async () => {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    await firebaseSignOut(auth);
    toast({ title: "Signed Out", description: "You have been successfully signed out." });
  }, [toast]);
  
  const refreshUserProfile = useCallback(async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  }, [user, fetchUserProfile]);
  
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, updates);
      await refreshUserProfile();
    } else {
      throw new Error("User must be logged in to update profile.");
    }
  }, [user, refreshUserProfile]);

  const toggleFavoriteStory = useCallback(async (storyId: string) => {
      if (user && userProfile) {
          const userDocRef = doc(db, 'users', user.uid);
          const isFavorited = userProfile.favoriteStories.includes(storyId);
          await updateDoc(userDocRef, {
              favoriteStories: isFavorited ? arrayRemove(storyId) : arrayUnion(storyId)
          });
          await refreshUserProfile();
           toast({
              variant: 'success',
              title: isFavorited ? 'Removed from Favorites' : 'Added to Favorites',
           });
      } else {
          toast({
            variant: "default",
            title: "Please sign in",
            description: "You need an account to save your favorite stories.",
          });
      }
  }, [user, userProfile, toast, refreshUserProfile]);

  const markStoryAsRead = useCallback((storyId: string) => {
    if (user && userProfile) {
      if (!userProfile.readStories.includes(storyId)) {
        const userDocRef = doc(db, 'users', user.uid);
        updateDoc(userDocRef, { readStories: arrayUnion(storyId) });
        setUserProfile(prev => prev ? { ...prev, readStories: [...prev.readStories, storyId] } : null);
      }
    }
  }, [user, userProfile]);
  
  const sendEmailSignInLink = useCallback(async (email: string) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/login?finishSignUp=1`,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
  }, []);


  const value = { user, userProfile, loading, signOut, updateUserProfile, refreshUserProfile, toggleFavoriteStory, markStoryAsRead, sendEmailSignInLink };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
