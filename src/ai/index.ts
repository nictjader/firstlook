'use server';
/**
 * @fileOverview This file initializes the Genkit AI and Google AI plugins.
 * It exports the configured `ai` and `googleAI` instances for use throughout
 * the application, ensuring that model references and flow definitions
 * are handled correctly.
 */

import { genkit } from 'genkit';
import { googleAI as googleAIPlugin } from '@genkit-ai/googleai';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already done.
// This is required for @genkit-ai/firebase features to work.
if (!initializeApp.length) {
  initializeApp();
}

// Initialize the Google AI plugin.
// This instance is exported so other files can reference models like `googleAI.model(...)`.
export const googleAI = googleAIPlugin();

// Initialize Genkit with all plugins.
// This `ai` instance is used to define flows, prompts, etc.
export const ai = genkit({
  plugins: [googleAI],
});
