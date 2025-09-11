
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
  prompt: `You are an expert text editor. Your task is to scan the provided text for specific formatting artifacts and return a cleaned version.

You must remove any of the following characters or patterns if they appear inappropriately in the text:
- Unwanted asterisks (*)
- Unwanted hyphens or em-dashes (—) used as list markers instead of proper formatting.

Do not correct grammar or spelling. Only remove the specified formatting artifacts and return only the cleaned text.

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
    return output!;
  }
);
