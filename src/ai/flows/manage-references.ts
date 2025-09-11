
'use server';

/**
 * @fileOverview Verifies references using the CrossRef API.
 *
 * - manageReferences - A function that verifies a list of references.
 * - ManageReferencesInput - The input type for the manageReferences function.
 * - ManageReferencesOutput - The return type for the manageReferences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ManageReferencesInputSchema = z.object({
  referencesToVerify: z.string().describe('A string containing a list of references, separated by newlines.'),
});
export type ManageReferencesInput = z.infer<typeof ManageReferencesInputSchema>;

const ManageReferencesOutputSchema = z.object({
  references: z.array(
    z.object({
      referenceText: z.string().describe('The generated reference text.'),
      doi: z.string().optional().describe('The DOI of the reference, if available.'),
      isVerified: z.boolean().describe('Whether the reference was successfully verified via the CrossRef API.'),
    })
  ).describe('An array of verified references.'),
});
export type ManageReferencesOutput = z.infer<typeof ManageReferencesOutputSchema>;

export async function manageReferences(input: ManageReferencesInput): Promise<ManageReferencesOutput> {
  return manageReferencesFlow(input);
}


const manageReferencesFlow = ai.defineFlow(
  {
    name: 'manageReferencesFlow',
    inputSchema: ManageReferencesInputSchema,
    outputSchema: ManageReferencesOutputSchema,
  },
  async ({ referencesToVerify }) => {
    // Split the input string into an array of reference strings
    const references = referencesToVerify.split('\n').filter(ref => ref.trim() !== '');

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
      
      verifiedReferences.push({
        referenceText,
        doi,
        isVerified,
      });
    }

    // Sort references alphabetically
    verifiedReferences.sort((a, b) => a.referenceText.localeCompare(b.referenceText));

    return {
      references: verifiedReferences
    };
  }
);
