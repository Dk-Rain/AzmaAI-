
'use server';

/**
 * @fileOverview Verifies references using the CrossRef, PubMed, and arXiv APIs.
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
      isVerified: z.boolean().describe('Whether the reference was successfully verified via an API call.'),
      verificationNotes: z.string().describe('Notes on the verification status (e.g., "Verified via DOI," "No DOI found," "Not found on any database").')
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
      
      // 1. Try verifying with DOI via CrossRef
      if (doi) {
        try {
          const crossrefApiResponse = await fetch(`https://api.crossref.org/works/${doi}`);
          if (crossrefApiResponse.ok) {
            const result = await crossrefApiResponse.json();
            if (result.status === 'ok') {
              isVerified = true;
              verificationNotes = 'Verified via DOI on CrossRef.';
            }
          }
        } catch (error) {
          console.error(`Error verifying DOI ${doi}:`, error);
        }
      }
      
      // 2. If not verified, try searching on PubMed
      if (!isVerified) {
         try {
            const searchResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(referenceText)}&retmax=1&format=json`);
            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                if (searchData.esearchresult.idlist.length > 0) {
                    isVerified = true;
                    verificationNotes = 'Found a likely match on PubMed.';
                }
            }
         } catch (error) {
            console.error(`Error searching PubMed for "${referenceText}":`, error);
         }
      }

      // 3. If still not verified, try searching on arXiv
      if (!isVerified) {
         try {
            const response = await fetch(`https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(referenceText)}&start=0&max_results=1`);
            if (response.ok) {
                const xmlText = await response.text();
                if (xmlText.includes('<entry>')) {
                    isVerified = true;
                    verificationNotes = 'Found a likely match on arXiv.';
                }
            }
         } catch (error) {
            console.error(`Error searching arXiv for "${referenceText}":`, error);
         }
      }

      // 4. Final verification notes if nothing was found
      if (!isVerified) {
          verificationNotes = doi ? 'DOI found but could not be verified.' : 'Could not find a match on PubMed or arXiv.';
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
