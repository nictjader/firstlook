'use server';
/**
 * @fileOverview This file initializes the Genkit AI and Google AI plugins.
 * It exports the configured `ai` instance for use throughout the application.
 */

import { genkit } from 'genkit';
import { googleAI as googleAIPlugin } from '@genkit-ai/googleai';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already done.
if (!initializeApp.length) {
  initializeApp();
}

// This instance is used to define flows, prompts, etc.
// It is NOT exported to prevent module resolution issues in Next.js builds.
export const ai = genkit({
  plugins: [googleAIPlugin()],
});
