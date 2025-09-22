
import { googleAI } from '@genkit-ai/googleai';
// import { openAI } from 'genkitx-openai';
// import { defineModel } from 'genkit/models';

// Define standard models
// export const gpt4o = 'gpt-4o'; // The plugin resolves the string to the correct model

// export const deepseek = defineModel(
//   {
//     name: 'deepseek/deepseek-chat',
//     label: 'DeepSeek - DeepSeek-Chat',
//     supports: {
//       media: false,
//       multiturn: true,
//       tools: true,
//       systemRole: true,
//       output: ['text', 'json'],
//     },
//   },
//   async (request) => {
//     // Placeholder for DeepSeek API call
//     return {
//       candidates: [{
//         index: 0,
//         finishReason: 'stop',
//         message: {
//           role: 'model',
//           content: [{ text: 'response from DeepSeek' }]
//         }
//       }]
//     };
//   }
// );


// Array of all provider plugins
export const providerPlugins = [
  googleAI({ apiKey: process.env.GEMINI_API_KEY }),
];

// Conditionally add OpenAI if the key is provided
// if (process.env.OPENAI_API_KEY) {
//   providerPlugins.push(openAI({ apiKey: process.env.OPENAI_API_KEY }));
// }

// Conditionally add DeepSeek if the key is provided
// if (process.env.DEEPSEEK_API_KEY) {
//   providerPlugins.push(
//     openAI(
//       // The OpenAI plugin can be used for any OpenAI-compatible API
//       {
//         apiKey: process.env.DEEPSEEK_API_KEY,
//         baseUrl: 'https://api.deepseek.com/v1',
//       },
//       // Pass the custom model definition
//       [deepseek]
//     )
//   );
// }


// Array of all models
export const allModels = {
  'googleai/gemini-2.5-pro': 'googleai/gemini-2.5-pro',
  'googleai/gemini-2.5-flash': 'googleai/gemini-2.5-flash',
  // 'openai/gpt-4o': gpt4o,
  // 'deepseek/deepseek-chat': deepseek,
};
