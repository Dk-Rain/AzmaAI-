
'use server';
/**
 * @fileOverview A flow to generate an image for a document section.
 *
 * - generateImageForSection - A function that creates an image from a prompt.
 * - GenerateImageInput - The input type for the generateImageForSection function.
 * - GenerateImageOutput - The return type for the generateImageForSection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('A detailed, descriptive prompt for the image to be generated.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;


const GenerateImageOutputSchema = z.object({
    url: z.string().url().describe('The data URI of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;


export async function generateImageForSection(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async ({ prompt }) => {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `academic illustration, clean vector style, infographic, ${prompt}`,
        config: {
            responseMimeType: 'image/png',
        },
    });

    if (!media) {
        throw new Error('Image generation failed to return media.');
    }

    return { url: media.url };
  }
);
