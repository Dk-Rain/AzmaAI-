'use server';
/**
 * @fileOverview A flow to arrange generated content into a structured academic format.
 *
 * - arrangeContentIntoAcademicFormat - A function that arranges content into an academic format.
 * - ArrangeContentInput - The input type for the arrangeContentIntoAcademicFormat function.
 * - ArrangeContentOutput - The return type for the arrangeContentIntoAcademicFormat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ArrangeContentInputSchema = z.object({
  topic: z.string().describe('The topic of the academic content.'),
  content: z.string().describe('The generated academic content.'),
});
export type ArrangeContentInput = z.infer<typeof ArrangeContentInputSchema>;

const ArrangeContentOutputSchema = z.object({
  title: z.string().describe('The title of the academic document.'),
  abstract: z.string().describe('A concise summary of the academic document.'),
  sections: z.array(
    z.object({
      title: z.string().describe('The title of the section.'),
      content: z.string().describe('The content of the section.'),
      subSections: z.array(
        z.object({
          title: z.string().describe('The title of the sub-section.'),
          content: z.string().describe('The content of the sub-section.'),
        })
      ).optional().describe('The sub-sections within the section.'),
    })
  ).describe('The sections of the academic document.'),
});
export type ArrangeContentOutput = z.infer<typeof ArrangeContentOutputSchema>;

export async function arrangeContentIntoAcademicFormat(input: ArrangeContentInput): Promise<ArrangeContentOutput> {
  return arrangeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'arrangeContentPrompt',
  input: {schema: ArrangeContentInputSchema},
  output: {schema: ArrangeContentOutputSchema},
  prompt: `You are an expert in structuring academic content. Given the topic and content below, arrange the content into a well-structured academic format, including a title, abstract, sections, and sub-sections where appropriate.

Topic: {{{topic}}}
Content: {{{content}}}

Ensure the output is a valid JSON object that conforms to the ArrangeContentOutputSchema.

Considerations for structuring the content:

*   The title should be concise and accurately reflect the document's topic.
*   The abstract should provide a brief overview of the entire document.
*   Sections should be organized logically and cover distinct aspects of the topic.
*   Sub-sections should provide more detailed information within each section, where relevant.

Follow this format strictly, the section and subsection titles should be informative:

Title: [Title]
Abstract: [Abstract]
Sections:
[
    {
        title: [Section Title],
        content: [Section Content],
        subSections: [
            {
                title: [Subsection Title],
                content: [Subsection Content]
            }
        ]
    }
]
`,
});

const arrangeContentFlow = ai.defineFlow(
  {
    name: 'arrangeContentFlow',
    inputSchema: ArrangeContentInputSchema,
    outputSchema: ArrangeContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
