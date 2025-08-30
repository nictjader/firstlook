import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase';

// This file is now ONLY for AI-related initialization.
// The firebase() plugin is required for Genkit to properly integrate with Firebase services.
export const ai = genkit({
  plugins: [googleAI(), firebase()],
});
