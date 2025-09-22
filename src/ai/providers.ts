
import { googleAI } from '@genkit-ai/googleai';

// Array of all provider plugins
export const providerPlugins = [
  googleAI({ apiKey: process.env.GEMINI_API_KEY }),
];

// Array of all models
export const allModels = {
  'googleai/gemini-2.5-pro': 'googleai/gemini-2.5-pro',
  'googleai/gemini-2.5-flash': 'googleai/gemini-2.5-flash',
};
