"use client";

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    signInWithCredential,
} from 'firebase/auth';
import type { UserProfile } from '../lib/types';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase/client';
import { docToUserProfileClient } from '../lib/types';
import { useToast } from '../hooks/use-toast';

declare global {
  interface Window {
    google: any;
  }
}

const LOCAL_STORAGE_READ_KEY = 'firstlook_read_stories';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  toggleFavoriteStory: (storyId: string) => Promise<void>;
  markStoryAsRead: (storyId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectProcessed, setRedirectProcessed] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return docToUserProfileClient(userDocSnap.data(), userId);
      }
      return null;
    } catch (error) {
        return null;
    }
  }, []);

  const createUserProfile = useCallback(async (user: User): Promise<UserProfile | null> => {
    try {
        const userDocRef = doc(db, "users", user.uid);
        const newUserProfileData = {
          userId: user.uid,
          email: user.email,
          displayName: user.displayName,
          coins: 0, 
          unlockedStories: [],
          readStories: [],
          favoriteStories: [],
          preferences: { subgenres: [] },
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };
        await setDoc(userDocRef, newUserProfileData);
        const finalDocSnap = await getDoc(userDocRef);
        if (!finalDocSnap.exists()) {
            throw new Error("Failed to create and fetch user profile.");
        }
        return docToUserProfileClient(finalDocSnap.data(), user.uid);
    } catch (error) {
        return null;
    }
  }, []);

  const syncLocalReadHistory = useCallback(async (userId: string) => {
    try {
      const localReadJson = localStorage.getItem(LOCAL_STORAGE_READ_KEY);
      if (localReadJson) {
          const localReadStories: string[] = JSON.parse(localReadJson);
          if (localReadStories.length > 0) {
              const userDocRef = doc(db, "users", userId);
              await updateDoc(userDocRef, {
                  readStories: arrayUnion(...localReadStories)
              });
              localStorage.removeItem(LOCAL_STORAGE_READ_KEY);
          }
      }
    } catch (error) {
        // Silently fail
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    if (user) {
        const profile = await fetchUserProfile(user.uid);
        setUserProfile(profile);
    }
  }, [user, fetchUserProfile]);

  const handleCredentialResponse = useCallback(async (response: any) => {
    setLoading(true);
    try {
      const credential = GoogleAuthProvider.credential(response.credential);
      await signInWithCredential(auth, credential);
    } catch (error: any) {
       console.error('One Tap sign-in error:', error);
       toast({ 
         title: "Google Sign-In Failed", 
         description: "Could not sign in with One Tap. Please try the standard sign-in button.", 
         variant: "destructive" 
       });
    }
    // Don't set loading to false here - let the auth state change handle it
  }, [toast]);
  
  const initializeOneTap = useCallback(() => {
    // Only initialize One Tap if:
    // 1. Google API is available
    // 2. Client ID is configured
    // 3. We're not on the login page (to avoid conflicts)
    // 4. No redirect has been processed recently
    if (
      typeof window.google === 'undefined' || 
      !process.env.NEXT_PUBLIC_FIREBASE_OAUTH_CLIENT_ID ||
      window.location.pathname === '/login' ||
      redirectProcessed
    ) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_FIREBASE_OAUTH_CLIENT_ID,
          callback: handleCredentialResponse,
          cancel_on_tap_outside: false,
          auto_select: false, // Changed to false to avoid conflicts
          context: 'signin',
      });
      
      window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              console.log('One Tap UI was not displayed or was skipped.');
          }
      });
    } catch (error) {
      console.error('One Tap initialization error:', error);
    }
  }, [handleCredentialResponse, redirectProcessed]);

  useEffect(() => {
    let mounted = true;

    const handleRedirect = async () => {
      if (!mounted) return;
      
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
            setRedirectProcessed(true);
            toast({ 
              title: "Signed In Successfully!", 
              description: `Welcome back, ${result.user.displayName || result.user.email}!`, 
              variant: 'success' 
            });
            
            // Redirect to home page or dashboard
            if (window.location.pathname === '/login') {
              window.location.href = '/';
            }
        }
      } catch (error: any) {
        console.error('Redirect result error:', error);
        setRedirectProcessed(true);
        toast({ 
          title: "Sign-In Failed", 
          description: "Could not complete sign-in. Please try again.", 
          variant: "destructive" 
        });
      }
    }

    // Handle redirect result first
    handleRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      
      setLoading(true);
      try {
        if (user) {
          await syncLocalReadHistory(user.uid);
          setUser(user);
          let profile = await fetchUserProfile(user.uid);
          if (profile) {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, { 
                lastLogin: serverTimestamp(),
                email: user.email,
                displayName: user.displayName 
            });
            profile = await fetchUserProfile(user.uid);
          } else {
            profile = await createUserProfile(user);
          }
          setUserProfile(profile);
        } else {
          setUser(null);
          setUserProfile(null);
          
          // Only initialize One Tap if no redirect was processed
          // and we've waited a bit for things to settle
          setTimeout(() => {
            if (mounted && !redirectProcessed) {
              initializeOneTap();
            }
          }, 1000);
        }
      } catch (error) {
          console.error('Auth state change error:', error);
          setUser(null);
          setUserProfile(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [fetchUserProfile, createUserProfile, syncLocalReadHistory, initializeOneTap, toast, redirectProcessed]);
  
  const signInWithGoogle = useCallback(() => {
    setLoading(true);
    
    // Cancel any One Tap prompts to avoid conflicts
    if (typeof window.google !== 'undefined') {
      try {
        window.google.accounts.id.cancel();
      } catch (error) {
        // Ignore errors from canceling
      }
    }
    
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    signInWithRedirect(auth, provider);
  }, []);
  
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
          setUserProfile(prevProfile => {
              if (!prevProfile) return null;
              const newFavorites = isFavorited
                  ? prevProfile.favoriteStories.filter(id => id !== storyId)
                  : [...prevProfile.favoriteStories, storyId];
              return { ...prevProfile, favoriteStories: newFavorites };
          });
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
  }, [user, userProfile, toast]);

  const markStoryAsRead = useCallback((storyId: string) => {
    if (user && userProfile) {
      if (!userProfile.readStories.includes(storyId)) {
        const userDocRef = doc(db, 'users', user.uid);
        updateDoc(userDocRef, { readStories: arrayUnion(storyId) });
        setUserProfile(prev => prev ? { ...prev, readStories: [...prev.readStories, storyId] } : null);
      }
    } else {
      try {
        const localReadJson = localStorage.getItem(LOCAL_STORAGE_READ_KEY);
        const localReadStories: string[] = localReadJson ? JSON.parse(localReadJson) : [];
        if (!localReadStories.includes(storyId)) {
          localReadStories.push(storyId);
          localStorage.setItem(LOCAL_STORAGE_READ_KEY, JSON.stringify(localReadStories));
        }
      } catch (error) {
        // silent fail
      }
    }
  }, [user, userProfile]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    updateUserProfile,
    refreshUserProfile,
    toggleFavoriteStory,
    markStoryAsRead,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

    