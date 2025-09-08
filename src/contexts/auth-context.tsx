
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import type { UserProfile } from '../lib/types';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase/client';
import { docToUserProfileClient } from '../lib/types';
import { useToast } from '../hooks/use-toast';

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

  const syncLocalReadHistory = useCallback(async (userId: string) => {
    if (typeof window === 'undefined') return;
    try {
      const localReadJson = localStorage.getItem(LOCAL_STORAGE_READ_KEY);
      if (localReadJson) {
          const localReadStories: string[] = JSON.parse(localReadJson);
          if (localReadStories.length > 0) {
              const userDocRef = doc(db, "users", userId);
              await updateDoc(userDocRef, { readStories: arrayUnion(...localReadStories) });
              localStorage.removeItem(LOCAL_STORAGE_READ_KEY);
          }
      }
    } catch (error) {
        console.error("Error syncing local read history:", error);
    }
  }, []);

  const handleUser = useCallback(async (user: User | null) => {
    if (user) {
      await syncLocalReadHistory(user.uid);
      const userDocRef = doc(db, "users", user.uid);
      let userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        // Create profile if it doesn't exist
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
        await setDoc(userDocRef, newUserProfileData, { merge: true });
        userDocSnap = await getDoc(userDocRef);
      } else {
        // Update last login time
        await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
      }
      setUser(user);
      setUserProfile(docToUserProfileClient(userDocSnap.data()!, user.uid));
    } else {
      setUser(null);
      setUserProfile(null);
    }
    setLoading(false);
  }, [syncLocalReadHistory]);

  useEffect(() => {
    // This effect runs once on mount
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // If there's a redirect result, a sign-in happened.
          // The onAuthStateChanged listener will handle the user state update.
          toast({
            title: "Signed In Successfully!",
            description: `Welcome, ${result.user.displayName || result.user.email}!`,
            variant: "success",
          });
        }
      } catch (error) {
        console.error("Error processing redirect result:", error);
      }
      
      // After processing any potential redirect, set up the permanent auth state listener.
      const unsubscribe = onAuthStateChanged(auth, handleUser);
      return unsubscribe;
    };

    const unsubscribePromise = checkRedirect();
    
    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, [handleUser, toast]);

  const signInWithGoogle = useCallback(() => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  }, []);

  const refreshUserProfile = useCallback(async () => {
    if (user) {
        const profile = await docToUserProfileClient((await getDoc(doc(db, "users", user.uid))).data()!, user.uid);
        setUserProfile(profile);
    }
  }, [user]);
  
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
       if (typeof window === 'undefined') return;
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

  const value = { user, userProfile, loading, signInWithGoogle, updateUserProfile, refreshUserProfile, toggleFavoriteStory, markStoryAsRead };

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
