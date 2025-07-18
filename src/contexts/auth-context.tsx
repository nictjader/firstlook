
"use client";

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { UserProfile, Purchase } from '@/lib/types';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, type DocumentData, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  toggleFavoriteStory: (storyId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert Firestore Timestamps to ISO strings for serialization
function safeToISOString(timestamp: any): string {
  if (!timestamp) return new Date().toISOString();
  // Handle Firestore Timestamps from both client and admin SDKs
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  // Handle serialized Timestamps
  if (timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate().toISOString();
  }
  // Handle date strings
  const date = new Date(timestamp);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }
  // Fallback for unexpected types
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

  // This function now uses the CLIENT SDK
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return docToUserProfile(userDocSnap.data(), userId);
    }
    return null;
  }, []);

  // This function now uses the CLIENT SDK
  const createUserProfile = useCallback(async (user: User): Promise<UserProfile> => {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    // Check if profile already exists to prevent race conditions
    if (userDocSnap.exists()) {
      return docToUserProfile(userDocSnap.data(), user.uid);
    }

    const newUserProfileData = {
      userId: user.uid,
      email: user.email,
      displayName: user.displayName,
      coins: 100, // Starting coins for new users
      unlockedStories: [],
      readStories: [],
      favoriteStories: [],
      purchaseHistory: [],
      preferences: { subgenres: [] },
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    };
    await setDoc(userDocRef, newUserProfileData);
    
    // Fetch again to get the server-generated timestamps correctly
    const finalDocSnap = await getDoc(userDocRef);
    if (!finalDocSnap.exists()) {
        throw new Error("Failed to create and fetch user profile.");
    }
    return docToUserProfile(finalDocSnap.data(), user.uid);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        let profile = await fetchUserProfile(user.uid);
        
        if (profile) {
          // Update lastLogin using client SDK
          const userDocRef = doc(db, "users", user.uid);
          await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
          // We need to refetch to get the updated timestamp correctly serialized
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
  }, [fetchUserProfile, createUserProfile]);
  
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

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    updateUserProfile,
    refreshUserProfile,
    toggleFavoriteStory,
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
