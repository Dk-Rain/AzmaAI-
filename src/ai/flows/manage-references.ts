'use server';

/**
 * @fileOverview Manages reference generation and verification using the CrossRef API.
 *
 * - manageReferences - A function that generates and verifies references.
 * - ManageReferencesInput - The input type for the manageReferences function.
 * - ManageReferencesOutput - The return type for the manageReferences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ManageReferencesInputSchema = z.object({
  topic: z.string().describe('The topic for which references are to be generated.'),
  numReferences: z.number().describe('The number of references to generate.'),
});
export type ManageReferencesInput = z.infer<typeof ManageReferencesInputSchema>;

const ManageReferencesOutputSchema = z.object({
  references: z.array(
    z.object({
      referenceText: z.string().describe('The generated reference text.'),
      doi: z.string().optional().describe('The DOI of the reference, if available.'),
      isVerified: z.boolean().describe('Whether the reference was successfully verified via the CrossRef API.'),
    })
  ).describe('An array of generated and verified references.'),
  unverifiedReferences: z.array(z.string()).describe('References that could not be verified.'),
});
export type ManageReferencesOutput = z.infer<typeof ManageReferencesOutputSchema>;

export async function manageReferences(input: ManageReferencesInput): Promise<ManageReferencesOutput> {
  return manageReferencesFlow(input);
}

const generateReferencesPrompt = ai.definePrompt({
  name: 'generateReferencesPrompt',
  input: {schema: ManageReferencesInputSchema},
  output: {schema: z.object({references: z.array(z.string()).describe('An array of references.')})},
  prompt: `You are an expert academic reference generator. Generate {{numReferences}} references for the topic: {{{topic}}}. Return just the references.  Do not include any additional information.  Each reference should be on a new line.

References: `,
});

const manageReferencesFlow = ai.defineFlow(
  {
    name: 'manageReferencesFlow',
    inputSchema: ManageReferencesInputSchema,
    outputSchema: ManageReferencesOutputSchema,
  },
  async input => {
    const {output: generatedReferencesOutput} = await generateReferencesPrompt(input);
    const references = generatedReferencesOutput.references;

    const verifiedReferences: ManageReferencesOutputSchema['references'] = [];
    const unverifiedReferences: string[] = [];

    for (const referenceText of references) {
      // Extract DOI from the reference text (this is a simplified approach; more robust DOI extraction might be needed)
      const doiRegex = /10.\w+\/\w+/g;
      const doiMatch = referenceText.match(doiRegex);
      const doi = doiMatch ? doiMatch[0] : undefined;

      let isVerified = false;
      if (doi) {
        try {
          // Call CrossRef API to verify DOI
          const crossrefApiResponse = await fetch(`https://api.crossref.org/works/${doi}`);
          if (crossrefApiResponse.ok) {
            isVerified = true;
          } else {
            unverifiedReferences.push(referenceText);
          }
        } catch (error) {
          console.error(`Error verifying DOI ${doi}:`, error);
          unverifiedReferences.push(referenceText);
        }
      } else {
        unverifiedReferences.push(referenceText);
      }

      verifiedReferences.push({
        referenceText,
        doi,
        isVerified,
      });
    }

    return {
      references: verifiedReferences,
      unverifiedReferences,
    };
  }
);
