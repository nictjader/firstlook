
"use client";

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { UserProfile, Purchase } from '@/lib/types';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, type DocumentData, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';

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

function safeToISOString(timestamp: any): string {
  if (!timestamp) return new Date().toISOString();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate().toISOString();
  }
  const date = new Date(timestamp);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }
  console.warn("Unsupported timestamp format:", timestamp);
  return new Date().toISOString();
}

function docToUserProfile(doc: DocumentData, userId: string): UserProfile {
    const data = doc;
    return {
      userId: userId,
      email: data.email,
      displayName: data.displayName,
      coins: data.coins || 0,
      unlockedStories: data.unlockedStories || [],
      readStories: data.readStories || [],
      favoriteStories: data.favoriteStories || [],
      purchaseHistory: (data.purchaseHistory || []).map((p: any): Purchase => ({
          ...p,
          purchasedAt: safeToISOString(p.purchasedAt),
      })),
      preferences: data.preferences || { subgenres: [] },
      createdAt: safeToISOString(data.createdAt),
      lastLogin: safeToISOString(data.lastLogin),
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return docToUserProfile(userDocSnap.data(), userId);
    }
    return null;
  }, []);

  const createUserProfile = useCallback(async (user: User): Promise<UserProfile> => {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return docToUserProfile(userDocSnap.data(), user.uid);
    }
    const newUserProfileData = {
      userId: user.uid,
      email: user.email,
      displayName: user.displayName,
      coins: 100, 
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
  }, []);

  const syncLocalReadHistory = useCallback(async (userId: string) => {
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
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        await syncLocalReadHistory(user.uid);
        setUser(user);
        let profile = await fetchUserProfile(user.uid);
        if (profile) {
          const userDocRef = doc(db, "users", user.uid);
          await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
          profile = await fetchUserProfile(user.uid);
        } else {
          profile = await createUserProfile(user);
        }
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile, createUserProfile, syncLocalReadHistory]);
  
  const refreshUserProfile = useCallback(async () => {
    if (user) {
        const profile = await fetchUserProfile(user.uid);
        setUserProfile(profile);
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
          setUserProfile(prevProfile => {
              if (!prevProfile) return null;
              const newFavorites = isFavorited
                  ? prevProfile.favoriteStories.filter(id => id !== storyId)
                  : [...prevProfile.favoriteStories, storyId];
              return { ...prevProfile, favoriteStories: newFavorites };
          });
      } else {
          console.warn("User not logged in, cannot favorite story.");
      }
  }, [user, userProfile]);

  const markStoryAsRead = useCallback((storyId: string) => {
    if (user && userProfile) {
      if (!userProfile.readStories.includes(storyId)) {
        const userDocRef = doc(db, 'users', user.uid);
        updateDoc(userDocRef, { readStories: arrayUnion(storyId) });
        setUserProfile(prev => prev ? { ...prev, readStories: [...prev.readStories, storyId] } : null);
      }
    } else {
      const localReadJson = localStorage.getItem(LOCAL_STORAGE_READ_KEY);
      const localReadStories: string[] = localReadJson ? JSON.parse(localReadJson) : [];
      if (!localReadStories.includes(storyId)) {
        localReadStories.push(storyId);
        localStorage.setItem(LOCAL_STORAGE_READ_KEY, JSON.stringify(localReadStories));
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
