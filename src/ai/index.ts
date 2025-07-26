
/**
 * @fileoverview This file provides a singleton instance of the Genkit AI object.
 * All server-side code that needs to interact with Genkit should import the `ai`
 * object from this file. This pattern ensures that Genkit is initialized only
 * once.
 *
 * This file is ONLY for AI-related initialization. Database and other Firebase
 * service initializations are handled elsewhere.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// This file is now ONLY for AI-related initialization.
// The firebase() plugin is removed to prevent conflicting initializations.
export const ai = genkit({
  plugins: [googleAI()],
  enableTracingAndMetrics: false,
});
