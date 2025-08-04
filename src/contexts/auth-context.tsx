
"use client";

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { docToUserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


const LOCAL_STORAGE_READ_KEY = 'firstlook_read_stories';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
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
  const router = useRouter();

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return docToUserProfile(userDocSnap.data(), userId);
      }
      return null;
    } catch (error) {
        // This error is critical for developers but not for users.
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
          purchaseHistory: [],
          preferences: { subgenres: [] },
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };
        await setDoc(userDocRef, newUserProfileData);
        const finalDocSnap = await getDoc(userDocRef);
        if (!finalDocSnap.exists()) {
            throw new Error("Failed to create and fetch user profile.");
        }
        return docToUserProfile(finalDocSnap.data(), user.uid);
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
        // Silently fail on sync error, not critical for user experience
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
                // Also update email and name in Firestore if they have changed in Auth
                email: user.email,
                displayName: user.displayName 
            });
            // Refetch after update to get the latest data
            profile = await fetchUserProfile(user.uid);
          } else {
            profile = await createUserProfile(user);
          }
          setUserProfile(profile);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
          // Ensure user state is cleared on error
          setUser(null);
          setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserProfile, createUserProfile, syncLocalReadHistory]);
  
  const refreshUserProfile = useCallback(async () => {
    if (user) {
        setLoading(true);
        const profile = await fetchUserProfile(user.uid);
        setUserProfile(profile);
        setLoading(false);
    }
  }, [user, fetchUserProfile]);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, updates);
    } else {
      throw new Error("User must be logged in to update profile.");
    }
  }, [user]);

  const toggleFavoriteStory = useCallback(async (storyId: string) => {
      if (user && userProfile) {
          const userDocRef = doc(db, 'users', user.uid);
          const isFavorited = userProfile.favoriteStories.includes(storyId);
          await updateDoc(userDocRef, {
              favoriteStories: isFavorited ? arrayRemove(storyId) : arrayUnion(storyId)
          });
          // Optimistically update UI
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
            title: "Sign in to Favorite",
            description: "You need an account to save your favorite stories.",
          });
          router.push('/login?reason=favorite');
      }
  }, [user, userProfile, toast, router]);

  const markStoryAsRead = useCallback((storyId: string) => {
    if (user && userProfile) {
      if (!userProfile.readStories.includes(storyId)) {
        const userDocRef = doc(db, 'users', user.uid);
        updateDoc(userDocRef, { readStories: arrayUnion(storyId) });
        // Optimistically update UI
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
        // Silently fail on local storage error
      }
    }
  }, [user, userProfile]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
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
