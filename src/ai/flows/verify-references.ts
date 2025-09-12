
'use server';

/**
 * @fileOverview Verifies references using the CrossRef API.
 *
 * - verifyReferences - A function that verifies a list of references.
 * - VerifyReferencesInput - The input type for the verifyReferences function.
 * - VerifyReferencesOutput - The return type for the verifyReferences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyReferencesInputSchema = z.object({
  referencesToVerify: z.string().describe('A string containing a list of references, separated by newlines.'),
});
export type VerifyReferencesInput = z.infer<typeof VerifyReferencesInputSchema>;

const VerifyReferencesOutputSchema = z.object({
  references: z.array(
    z.object({
      referenceText: z.string().describe('The original reference text that was checked.'),
      doi: z.string().optional().describe('The DOI extracted from the reference, if any.'),
      isVerified: z.boolean().describe('Whether the reference was successfully verified via the CrossRef API.'),
      verificationNotes: z.string().describe('Notes on the verification status (e.g., "Verified via DOI," "No DOI found," "DOI not found on CrossRef").')
    })
  ).describe('An array of reference verification results.'),
});
export type VerifyReferencesOutput = z.infer<typeof VerifyReferencesOutputSchema>;

export async function verifyReferences(input: VerifyReferencesInput): Promise<VerifyReferencesOutput> {
  return verifyReferencesFlow(input);
}


const verifyReferencesFlow = ai.defineFlow(
  {
    name: 'verifyReferencesFlow',
    inputSchema: VerifyReferencesInputSchema,
    outputSchema: VerifyReferencesOutputSchema,
  },
  async ({ referencesToVerify }) => {
    // Split the input string into an array of reference strings
    const references = referencesToVerify.split('\n').filter(ref => ref.trim() !== '');

    const verifiedReferences: VerifyReferencesOutput['references'] = [];

    for (const referenceText of references) {
      // Extract DOI from the reference text
      const doiRegex = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i;
      const doiMatch = referenceText.match(doiRegex);
      const doi = doiMatch ? doiMatch[0] : undefined;

      let isVerified = false;
      let verificationNotes = '';
      
      if (doi) {
        try {
          // Call CrossRef API to verify DOI
          const crossrefApiResponse = await fetch(`https://api.crossref.org/works/${doi}`);
          if (crossrefApiResponse.ok) {
            const result = await crossrefApiResponse.json();
            if (result.status === 'ok') {
              isVerified = true;
              verificationNotes = 'Verified via DOI on CrossRef.';
            } else {
               verificationNotes = 'DOI found but could not be verified on CrossRef.';
            }
          } else {
            verificationNotes = 'DOI not found on CrossRef.';
          }
        } catch (error) {
          console.error(`Error verifying DOI ${doi}:`, error);
          verificationNotes = 'An error occurred during verification.';
        }
      } else {
        verificationNotes = 'No DOI found in the reference text.';
      }
      
      verifiedReferences.push({
        referenceText,
        doi,
        isVerified,
        verificationNotes,
      });
    }

    return {
      references: verifiedReferences
    };
  }
);
