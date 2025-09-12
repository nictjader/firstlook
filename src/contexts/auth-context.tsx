"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut, sendSignInLinkToEmail as firebaseSendSignInLink, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { docToUserProfileClient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => void;
  signInWithGoogle: () => void;
  sendSignInLinkToEmail: (email: string) => Promise<void>;
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

  const handleUser = useCallback(async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUser(firebaseUser);
        setUserProfile(docToUserProfileClient(userDocSnap.data()!, firebaseUser.uid));
      } else {
        // This case handles user creation on first login
        try {
            const newUserProfile: UserProfile = {
                userId: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                coins: 0,
                unlockedStories: [],
                readStories: [],
                favoriteStories: [],
                preferences: { subgenres: [] },
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
            };
            await doc(db, "users", firebaseUser.uid).set(newUserProfile);
            setUser(firebaseUser);
            setUserProfile(newUserProfile);
        } catch (error) {
            console.error("Error creating user profile:", error);
            setUser(null);
            setUserProfile(null);
        }
      }
    } else {
      setUser(null);
      setUserProfile(null);
    }
    setLoading(false);
  }, []);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleUser);
    return () => unsubscribe();
  }, [handleUser]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Google sign-in error", error);
      toast({ title: "Sign-In Failed", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (error) {
      console.error("Sign out error", error);
      toast({ title: "Error", description: "Failed to sign out.", variant: "destructive" });
    }
  }, [toast]);

  const sendSignInLinkToEmail = useCallback(async (email: string) => {
    const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
    };
    await firebaseSendSignInLink(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    toast({
        title: 'Sign-in Link Sent',
        description: `A sign-in link has been sent to ${email}.`,
        variant: 'success'
    });
  }, [toast]);
  
  const refreshUserProfile = useCallback(async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
          setUserProfile(docToUserProfileClient(userDocSnap.data()!, user.uid));
      }
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

  const value = { user, userProfile, loading, signOut, signInWithGoogle, sendSignInLinkToEmail, updateUserProfile, refreshUserProfile, toggleFavoriteStory, markStoryAsRead };

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
