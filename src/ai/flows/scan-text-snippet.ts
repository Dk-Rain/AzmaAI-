
'use server';
/**
 * @fileOverview A flow to scan a text snippet for errors and formatting issues.
 *
 * - scanTextSnippet - A function that scans and cleans a text snippet.
 * - ScanTextSnippetInput - The input type for the scanTextSnippet function.
 * - ScanTextSnippetOutput - The return type for the scanTextSnippet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScanTextSnippetInputSchema = z.object({
  text: z.string().describe('The text snippet to be cleaned.'),
});
export type ScanTextSnippetInput = z.infer<typeof ScanTextSnippetInputSchema>;

const ScanTextSnippetOutputSchema = z.object({
    cleanedText: z.string().describe('The cleaned text snippet.'),
});
export type ScanTextSnippetOutput = z.infer<typeof ScanTextSnippetOutputSchema>;

export async function scanTextSnippet(input: ScanTextSnippetInput): Promise<ScanTextSnippetOutput> {
  return scanTextSnippetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanTextSnippetPrompt',
  input: {schema: ScanTextSnippetInputSchema},
  output: {schema: ScanTextSnippetOutputSchema},
  prompt: `You are an expert text editor. Your task is to scan the provided text for common formatting artifacts and return a cleaned version.

You must perform the following actions:
- Remove any unwanted Markdown-like characters that are not part of proper sentence structure (e.g., stray asterisks '*', hashes '#', or hyphens '-' at the beginning of lines that are not lists).
- Correct awkward spacing, such as removing extra spaces between words or before punctuation.
- Remove any extraneous characters or formatting artifacts that appear to be remnants of a copy-paste or conversion process.
- Standardize punctuation where appropriate (e.g., converting '--' to an em-dash '—').

Do NOT change the grammar, spelling, or core meaning of the text. Your only job is to clean up the formatting. Return only the cleaned text.

Original Text:
"{{{text}}}"
`,
});

const scanTextSnippetFlow = ai.defineFlow(
  {
    name: 'scanTextSnippetFlow',
    inputSchema: ScanTextSnippetInputSchema,
    outputSchema: ScanTextSnippetOutputSchema,
  },
  async ({text}) => {
    const {output} = await prompt({text});
    if (!output) {
      throw new Error("The AI failed to return cleaned text.");
    }
    return output;
  }
);
