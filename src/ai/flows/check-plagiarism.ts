
'use server';
/**
 * @fileOverview A flow to check a document for potential plagiarism.
 *
 * - checkPlagiarism - A function that scans document content for unoriginal text.
 * - CheckPlagiarismInput - The input type for the checkPlagiarism function.
 * - CheckPlagiarismOutput - The return type for the checkPlagiarism function.
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


const CheckPlagiarismInputSchema = z.object({
  document: DocumentContentSchema.describe('The document content to be checked for plagiarism.'),
});
export type CheckPlagiarismInput = z.infer<typeof CheckPlagiarismInputSchema>;


const PlagiarismResultSchema = z.object({
    isOriginal: z.boolean().describe('Whether the document appears to be original.'),
     flaggedSections: z.array(z.object({
        sectionTitle: z.string().describe('The title of the section containing a potential issue.'),
        text: z.string().describe('The specific text that was flagged.'),
        explanation: z.string().describe('An explanation for why this text was flagged (e.g., "Common phrase," "Direct quote without citation").'),
    })).describe('An array of sections that may contain unoriginal content.'),
    summary: z.string().describe('A brief summary of the plagiarism check findings.'),
});
export type CheckPlagiarismOutput = z.infer<typeof PlagiarismResultSchema>;


export async function checkPlagiarism(input: CheckPlagiarismInput): Promise<CheckPlagiarismOutput> {
  return checkPlagiarismFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkPlagiarismPrompt',
  input: {schema: z.object({ document: z.string() })},
  output: {schema: PlagiarismResultSchema},
  prompt: `You are an expert academic editor with a specialization in identifying potential plagiarism. Your task is to analyze the provided document and identify any text that appears to be unoriginal or lacks proper citation.

Analyze the document below and identify any sentences or paragraphs that seem to be copied from external sources, state common knowledge or data without citation, or are phrased in a non-original way.

For each issue you find, provide the specific text, the section it belongs to, and a brief explanation. If the document appears to be original, state that clearly.

Return a JSON object with your findings.

Original Document:
\`\`\`json
{{{document}}}
\`\`\`
`,
});

const checkPlagiarismFlow = ai.defineFlow(
  {
    name: 'checkPlagiarismFlow',
    inputSchema: CheckPlagiarismInputSchema,
    outputSchema: PlagiarismResultSchema,
  },
  async ({document}) => {
    const {output} = await prompt({document: JSON.stringify(document)});
    return output!;
  }
);
