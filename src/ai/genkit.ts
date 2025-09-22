
import { genkit } from 'genkit';
import { providerPlugins, allModels } from './providers';

export const ai = genkit({
  plugins: providerPlugins,
  // The 'model' here is a fallback. The actual model used for generation
  // will be determined by the admin settings.
  model: allModels['googleai/gemini-2.5-flash'] || providerPlugins[0]?.models?.[0],
  
  // Optional: configure logging and other Genkit settings
  // logLevel: 'debug',
  // logSinks: ['file'],
});
