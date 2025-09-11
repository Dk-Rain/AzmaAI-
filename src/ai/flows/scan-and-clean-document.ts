
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
import type { DocumentContent } from '@/types';

const DocumentContentSchema = z.object({
  title: z.string(),
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      subSections: z.array(
        z.object({
          title: z.string(),
          content: z.string(),
        })
      ).optional(),
    })
  ),
});

const ScanAndCleanDocumentInputSchema = z.object({
  document: DocumentContentSchema.describe('The document content to be cleaned.'),
});
export type ScanAndCleanDocumentInput = z.infer<typeof ScanAndCleanDocumentInputSchema>;

export type ScanAndCleanDocumentOutput = DocumentContent;


export async function scanAndCleanDocument(input: ScanAndCleanDocumentInput): Promise<ScanAndCleanDocumentOutput> {
  return scanAndCleanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanAndCleanDocumentPrompt',
  input: {schema: z.object({ document: z.string() })},
  output: {schema: DocumentContentSchema},
  prompt: `You are an expert document editor. Your task is to scan the provided document content for formatting errors, artifacts, and grammatical mistakes, and then return a cleaned version of the document.

You must remove any of the following characters or patterns if they appear inappropriately in the text:
- Unwanted asterisks (*)
- Unwanted hyphens or em-dashes (—) used as list markers instead of proper formatting.
- Any other stray formatting markers that are not part of the academic text.

Additionally, please correct any obvious grammatical errors, spelling mistakes, or typos you find.

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
    outputSchema: DocumentContentSchema,
  },
  async ({document}) => {
    const {output} = await prompt({document: JSON.stringify(document)});
    return output!;
  }
);
