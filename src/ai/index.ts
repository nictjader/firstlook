
import { genkit } from 'genkit';
import { googleAI as googleAIPlugin } from '@genkit-ai/googleai';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
// This is required for @genkit-ai/firebase features to work
initializeApp();

// Export the googleAI plugin directly for model referencing
export const googleAI = googleAIPlugin();

// Initialize Genkit with the plugin
const ai = genkit({
  plugins: [googleAI],
});

// Re-export the initialized ai object for use in other parts of the application
export { ai };
