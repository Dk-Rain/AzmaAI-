
'use server';
/**
 * @fileOverview A flow to paraphrase a given text.
 *
 * - paraphraseText - A function that paraphrases text to sound more natural and human.
 * - ParaphraseTextInput - The input type for the paraphraseText function.
 * - ParaphraseTextOutput - The return type for the paraphraseText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParaphraseTextInputSchema = z.object({
  text: z.string().describe('The text to be paraphrased.'),
});
export type ParaphraseTextInput = z.infer<typeof ParaphraseTextInputSchema>;

const ParaphraseTextOutputSchema = z.object({
  paraphrasedText: z.string().describe('The paraphrased text.'),
});
export type ParaphraseTextOutput = z.infer<typeof ParaphraseTextOutputSchema>;

export async function paraphraseText(input: ParaphraseTextInput): Promise<ParaphraseTextOutput> {
  return paraphraseTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'paraphraseTextPrompt',
  input: {schema: ParaphraseTextInputSchema},
  output: {schema: ParaphraseTextOutputSchema},
  prompt: `You are an expert at rewriting text to sound more natural and human. 
Please paraphrase the following text. Maintain the original meaning, but change the vocabulary and sentence structure.
Do not add any extra information or introductory phrases. Only return the paraphrased text.

Original text:
"{{{text}}}"

Paraphrased text:
`,
});

const paraphraseTextFlow = ai.defineFlow(
  {
    name: 'paraphraseTextFlow',
    inputSchema: ParaphraseTextInputSchema,
    outputSchema: ParaphraseTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to return paraphrased text.");
    }
    return output;
  }
);
