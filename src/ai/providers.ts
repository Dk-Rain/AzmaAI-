
import { googleAI } from '@genkit-ai/googleai';
import { openAI } from 'genkitx-openai';
import { defineModel } from 'genkit/models';

// Define standard models
const gpt4o = defineModel(
  {
    name: 'openai/gpt-4o',
    label: 'OpenAI - GPT-4o',
    version: '4o',
    vendor: 'OpenAI',
  },
  async (request) => {
    // Note: The 'openAI' plugin handles the actual API call logic.
    // This definition is primarily for metadata and registration.
    return request as any; // This is a placeholder, actual logic is in the plugin
  }
);

// Array to hold provider plugins that are initialized
const providerPlugins: any[] = [];

// Google AI Provider (always included)
if (process.env.GEMINI_API_KEY) {
  providerPlugins.push(googleAI({ apiKey: process.env.GEMINI_API_KEY }));
}

// OpenAI Provider (for both OpenAI and DeepSeek)
// This single plugin can be configured for different OpenAI-compatible APIs.
if (process.env.OPENAI_API_KEY) {
  providerPlugins.push(openAI({
    apiKey: process.env.OPENAI_API_KEY,
  }));
}
if (process.env.DEEPSEEK_API_KEY) {
    providerPlugins.push(openAI({
        name: 'deepseek',
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com/v1',
    }));
}


// Export all configured plugins
export { providerPlugins };


// A map of all potential models for use in the UI
export const allModels = {
  'googleai/gemini-2.5-pro': 'googleai/gemini-2.5-pro',
  'googleai/gemini-2.5-flash': 'googleai/gemini-2.5-flash',
  'openai/gpt-4o': 'openai/gpt-4o',
  'deepseek/deepseek-chat': 'deepseek/deepseek-chat',
};
