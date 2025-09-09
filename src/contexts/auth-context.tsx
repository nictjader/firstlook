"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithCustomToken, signOut as firebaseSignOut, sendSignInLinkToEmail } from 'firebase/auth';
import type { UserProfile } from '../lib/types';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../lib/firebase/client';
import { docToUserProfileClient } from '../lib/types';
import { useToast } from '../hooks/use-toast';

declare global {
  interface Window {
    google?: any;
    handleCredentialResponse: (response: any) => void;
  }
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGsiScriptLoaded: boolean;
  signOut: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  toggleFavoriteStory: (storyId: string) => Promise<void>;
  markStoryAsRead: (storyId: string) => void;
  sendSignInLinkToEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGsiScriptLoaded, setIsGsiScriptLoaded] = useState(false);
  const { toast } = useToast();

  const handleUser = useCallback(async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUser(firebaseUser);
        setUserProfile(docToUserProfileClient(userDocSnap.data()!, firebaseUser.uid));
      } else {
         setUser(null);
         setUserProfile(null);
      }
    } else {
      setUser(null);
      setUserProfile(null);
    }
    setLoading(false);
  }, []);
  
  useEffect(() => {
    // Make the callback function globally accessible
    window.handleCredentialResponse = async (response: any) => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        });
        if (!res.ok) throw new Error(await res.text());
        const { token } = await res.json();
        await signInWithCustomToken(auth, token);
      } catch (error) {
        console.error("Sign-in failed:", error);
        toast({ title: "Sign-In Failed", variant: "destructive" });
        setLoading(false);
      }
    };

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGsiScriptLoaded(true);
    document.body.appendChild(script);

    const unsubscribe = onAuthStateChanged(auth, handleUser);

    return () => {
        try {
            document.body.removeChild(script);
        } catch (e) {
            // ignore if script is already gone
        }
        unsubscribe();
        delete window.handleCredentialResponse;
    };
  }, [handleUser, toast]);

  const signOut = useCallback(async () => {
    try {
      if (window.google) {
        window.google.accounts.id.disableAutoSelect();
      }
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (error) {
      console.error("Sign out error", error);
      toast({ title: "Error", description: "Failed to sign out.", variant: "destructive" });
    }
  }, [toast]);

  const handleSendSignInLink = useCallback(async (email: string) => {
    const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    toast({
        title: 'Sign-in Link Sent',
        description: `A sign-in link has been sent to ${email}. Check your inbox.`,
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

  const value = { 
    user, 
    userProfile, 
    loading, 
    isGsiScriptLoaded, 
    signOut,
    updateUserProfile,
    refreshUserProfile,
    toggleFavoriteStory,
    markStoryAsRead,
    sendSignInLinkToEmail: handleSendSignInLink
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
