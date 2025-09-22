
import { googleAI } from '@genkit-ai/googleai';
import { openAI } from 'genkitx-openai';

// Array to hold provider plugins that are initialized
const providerPlugins: any[] = [];

// A map of all potential models for use in the UI
export const allModels: Record<string, any> = {};


// Google AI Provider (always included)
if (process.env.GEMINI_API_KEY) {
  providerPlugins.push(googleAI({ apiKey: process.env.GEMINI_API_KEY }));
  allModels['googleai/gemini-2.5-pro'] = 'googleai/gemini-2.5-pro';
  allModels['googleai/gemini-2.5-flash'] = 'googleai/gemini-2.5-flash';
}

// OpenAI Provider
if (process.env.OPENAI_API_KEY) {
  providerPlugins.push(openAI({ apiKey: process.env.OPENAI_API_KEY }));
  allModels['openai/gpt-4o'] = 'openai/gpt-4o';
}


// Export all configured plugins
export { providerPlugins };
