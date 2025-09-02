
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
// This is required for @genkit-ai/firebase features to work
initializeApp();

// Initialize Genkit with only the plugins that have plugin functions
export const ai = genkit({
  plugins: [googleAI()],
});
