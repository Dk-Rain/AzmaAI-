
'use server';
/**
 * @fileOverview A flow to scan and clean a document for errors and formatting issues.
 *
 * - scanAndCleanDocument - A function that scans and cleans document content.
 * - ScanAndCleanDocumentInput - The input type for the scanAndCleanDocument function.
 * - ScanAndCleanDocumentOutput - The return type for the scanAndCleanDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateAcademicContentOutputSchema, GenerateAcademicContentOutput } from '@/types';


const ScanAndCleanDocumentInputSchema = z.object({
  document: GenerateAcademicContentOutputSchema.describe('The document content to be cleaned.'),
});
export type ScanAndCleanDocumentInput = z.infer<typeof ScanAndCleanDocumentInputSchema>;

export type ScanAndCleanDocumentOutput = GenerateAcademicContentOutput;


export async function scanAndCleanDocument(input: ScanAndCleanDocumentInput): Promise<ScanAndCleanDocumentOutput> {
  return scanAndCleanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanAndCleanDocumentPrompt',
  input: {schema: z.object({ document: z.string() })},
  output: {schema: GenerateAcademicContentOutputSchema},
  prompt: `You are an expert document editor. Your task is to scan the provided document content for specific formatting artifacts and return a cleaned version of the document.

The document is structured with sections and sub-sections, where the 'content' field is an array of blocks (e.g., { "type": "text", "text": "..." }).

You must iterate through every section and sub-section, and within each one, iterate through every 'text' block in the 'content' array.

You must remove any of the following characters or patterns if they appear inappropriately in the text of these 'text' blocks:
- Unwanted asterisks (*)
- Unwanted hyphens or em-dashes (—) used as list markers instead of proper formatting.

Do not correct grammar or spelling. Only remove the specified formatting artifacts from the 'text' fields.
Do not modify 'image', 'table', or 'list' blocks.

Return only the cleaned document content in the same JSON structure as the input. Do not add or remove any sections or change the overall structure.

Original Document:
\`\`\`json
{{{document}}}
\`\`\`
`,
});

const scanAndCleanFlow = ai.defineFlow(
  {
    name: 'scanAndCleanFlow',
    inputSchema: ScanAndCleanDocumentInputSchema,
    outputSchema: GenerateAcademicContentOutputSchema,
  },
  async ({document}) => {
    const {output} = await prompt({document: JSON.stringify(document)});
    return output!;
  }
);
