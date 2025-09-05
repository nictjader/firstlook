
import { type DocumentData } from 'firebase-admin/firestore';
import type { UserProfile, UnlockedStoryInfo } from '../types';

// This helper function robustly handles Timestamps from both client and server,
// as well as already-serialized date strings.
function safeToISOString(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    // Handle Firestore Timestamps (both client and admin)
    if (typeof timestamp === 'object' && timestamp !== null && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    }
    // Handle JS Date objects
    if (timestamp instanceof Date) {
        return timestamp.toISOString();
    }
    // Handle ISO date strings (pass them through)
    if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    // Fallback for unexpected types
    console.warn("Unsupported timestamp format:", timestamp, "Returning current date as fallback.");
    return new Date().toISOString();
}


// Server-side helper for converting Firestore Admin doc to UserProfile
export function docToUserProfileAdmin(docData: DocumentData, userId: string): UserProfile {
    const data = docData;
    return {
      userId: userId,
      email: data.email,
      displayName: data.displayName,
      coins: data.coins || 0,
      unlockedStories: (data.unlockedStories || []).map((s: any): UnlockedStoryInfo => {
          if (typeof s === 'string') {
              return { storyId: s, unlockedAt: new Date(0).toISOString() }; 
          }
          return { storyId: s.storyId, unlockedAt: safeToISOString(s.unlockedAt) };
      }),
      readStories: data.readStories || [],
      favoriteStories: data.favoriteStories || [],
      preferences: data.preferences || { subgenres: [] },
      createdAt: safeToISOString(data.createdAt),
      lastLogin: safeToISOString(data.lastLogin),
    };
}
