
import { googleAI } from '@genkit-ai/googleai';

// Array to hold provider plugins that are initialized
const providerPlugins: any[] = [];

// Google AI Provider (always included)
if (process.env.GEMINI_API_KEY) {
  providerPlugins.push(googleAI({ apiKey: process.env.GEMINI_API_KEY }));
}

// Export all configured plugins
export { providerPlugins };


// A map of all potential models for use in the UI
export const allModels = {
  'googleai/gemini-2.5-pro': 'googleai/gemini-2.5-pro',
  'googleai/gemini-2.5-flash': 'googleai/gemini-2.5-flash',
};
