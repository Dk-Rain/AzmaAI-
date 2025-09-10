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
  prompt: `You are an expert academic reference generator. Generate {{numReferences}} references for the topic: {{{topic}}}. All references must be formatted according to the APA 7th edition style guide. Return just the references.  Do not include any additional information.  Each reference should be on a new line.

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
    const references = generatedReferencesOutput!.references;

    const verifiedReferences: ManageReferencesOutput['references'] = [];
    const unverifiedReferences: string[] = [];

    for (const referenceText of references) {
      // Extract DOI from the reference text
      const doiRegex = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i;
      const doiMatch = referenceText.match(doiRegex);
      const doi = doiMatch ? doiMatch[0] : undefined;

      let isVerified = false;
      if (doi) {
        try {
          // Call CrossRef API to verify DOI
          const crossrefApiResponse = await fetch(`https://api.crossref.org/works/${doi}`);
          if (crossrefApiResponse.ok) {
            const result = await crossrefApiResponse.json();
            if (result.status === 'ok') {
              isVerified = true;
            }
          }
        } catch (error) {
          console.error(`Error verifying DOI ${doi}:`, error);
        }
      }
      
      if(isVerified) {
        verifiedReferences.push({
          referenceText,
          doi,
          isVerified,
        });
      } else {
        unverifiedReferences.push(referenceText);
        // Also add to verifiedReferences with isVerified: false
        verifiedReferences.push({
          referenceText,
          doi,
          isVerified: false,
        });
      }
    }

    // Sort references alphabetically
    verifiedReferences.sort((a, b) => a.referenceText.localeCompare(b.referenceText));

    return {
      references: verifiedReferences,
      unverifiedReferences,
    };
  }
);
