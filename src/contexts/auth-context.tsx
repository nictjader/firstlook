"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut, sendSignInLinkToEmail, signInWithCustomToken } from 'firebase/auth';
import type { UserProfile } from '../lib/types';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../lib/firebase/client';
import { docToUserProfileClient } from '../lib/types';
import { useToast } from '../hooks/use-toast';

// CORRECTED: Add this block to tell TypeScript about window.google
declare global {
  interface Window {
    google: any;
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

  const handleCredentialResponse = useCallback(async (response: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody.error || 'Failed to authenticate with the server.');
      }
      
      const { token } = await res.json();
      await signInWithCustomToken(auth, token);
      // onAuthStateChanged will handle the rest
      
    } catch (error: any) {
      console.error("Sign-in process failed:", error);
      toast({
        title: "Sign-In Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  }, [toast]);

  const handleUser = useCallback(async (firebaseUser: User | null) => {
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser(firebaseUser);
          setUserProfile(docToUserProfileClient(userDocSnap.data()!, firebaseUser.uid));
        } else {
          await firebaseSignOut(auth);
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
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
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
      if (window.google && clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
        setIsGsiScriptLoaded(true);
      } else {
        console.error("Google GSI script loaded but window.google is not available or Client ID is missing.");
      }
    };
    document.body.appendChild(script);

    const unsubscribe = onAuthStateChanged(auth, handleUser);

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {
        // ignore if script is already gone
      }
      unsubscribe();
    };
  }, [handleCredentialResponse, handleUser]);


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
      const profile = docToUserProfileClient((await getDoc(doc(db, "users", user.uid))).data()!, user.uid);
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
    }
  }, [user, userProfile]);

  const value = { 
    user, 
    userProfile, 
    loading, 
    signOut, 
    updateUserProfile, 
    refreshUserProfile, 
    toggleFavoriteStory, 
    markStoryAsRead, 
    isGsiScriptLoaded,
    sendSignInLinkToEmail: handleSendSignInLink,
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
