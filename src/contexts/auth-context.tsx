
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
        console.error("Error fetching user profile:", error);
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
        console.error("Error creating user profile:", error);
        return null;
    }
  }, []);

  const syncLocalReadHistory = useCallback(async (userId: string) => {
    if (typeof window === 'undefined') return;
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
        console.error("Error syncing local read history:", error);
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
       setLoading(false);
    }
  }, [toast]);
  
  const initializeOneTap = useCallback(() => {
    if (typeof window === 'undefined' || typeof window.google === 'undefined') {
      return;
    }
    
    const googleAuthClientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;

    if (!googleAuthClientId) {
        console.error("Google OAuth Client ID is not configured in your .env file.");
        return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: googleAuthClientId,
        callback: handleCredentialResponse,
        cancel_on_tap_outside: false,
        auto_select: false,
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
  }, [handleCredentialResponse]);

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          toast({
            title: "Signed In Successfully!",
            description: `Welcome, ${result.user.displayName || result.user.email}!`,
            variant: "success",
          });
        }
      })
      .catch((error) => {
        console.error("Error handling redirect result:", error);
        toast({
          title: "Sign-In Error",
          description: "Could not complete sign-in with Google. Please try again.",
          variant: "destructive",
        });
      });
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
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
        initializeOneTap();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile, createUserProfile, initializeOneTap, syncLocalReadHistory, toast]);
  
  const signInWithGoogle = useCallback(() => {
    if (typeof window !== 'undefined' && typeof window.google !== 'undefined') {
      try {
        window.google.accounts.id.cancel();
      } catch (error) {
        // Ignore errors from canceling
      }
    }

    const provider = new GoogleAuthProvider();
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
    if (typeof window === 'undefined') return;
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
