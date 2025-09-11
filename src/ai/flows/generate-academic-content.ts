
'use server';

/**
 * @fileOverview An academic content generation AI agent.
 *
 * - generateAcademicContent - A function that handles the generation of academic content.
 * - GenerateAcademicContentInput - The input type for the generateAcademicContent function.
 * - GenerateAcademicContentOutput - The return type for the generateAcademicContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { academicTaskTypes } from '@/types/academic-task-types';
import { academicTaskFormats } from '@/types/academic-task-formats';


const GenerateAcademicContentInputSchema = z.object({
  taskType: z.enum(academicTaskTypes).describe('The type of academic task.'),
  topic: z.string().describe('The topic of the academic content to generate.'),
  numPages: z.coerce.number().optional().describe('The desired number of pages for the content.'),
  parameters: z
    .string().optional()
    .describe(
      'Specific parameters or instructions for generating the content, such as desired sections, focus areas, or specific arguments to include.'
    ),
});
export type GenerateAcademicContentInput = z.infer<
  typeof GenerateAcademicContentInputSchema
>;

const GenerateAcademicContentOutputSchema = z.object({
  title: z.string().describe('The title of the generated academic content. It must not be more than 5 words.'),
  sections: z
    .array(z.object({ title: z.string(), content: z.string() }))
    .describe('The sections of the generated academic content.'),
});
export type GenerateAcademicContentOutput = z.infer<
  typeof GenerateAcademicContentOutputSchema
>;

export async function generateAcademicContent(
  input: GenerateAcademicContentInput
): Promise<GenerateAcademicContentOutput> {
  return generateAcademicContentFlow(input);
}

const generateAcademicContentPrompt = ai.definePrompt({
  name: 'generateAcademicContentPrompt',
  input: {schema: GenerateAcademicContentInputSchema},
  output: {schema: GenerateAcademicContentOutputSchema},
  prompt: `You are an expert academic content generator. Please generate
content for the following task type, topic, and parameters. Structure the output
according to the standard format for the specified task type. Do NOT include an abstract.

Task Type: {{{taskType}}}
Topic: {{{topic}}}
{{#if numPages}}
Number of Pages: {{{numPages}}}
{{/if}}
Parameters: {{{parameters}}}
Format:
{{{format}}}

IMPORTANT: The title of the generated content must not be more than 5 words.
Ensure that the generated content is well-structured, academically sound, and adheres to the specified page count.
Any references included in the document or in a reference list must strictly follow the APA 7th edition style guide. The reference list must be alphabetized.

APA 7th Edition Style Guide:
- In-Text Citations: Use parenthetical citations like (Author, Year) or (Author & Author, Year). For three or more authors, use (Author et al., Year). For direct quotes, include a page number: (Author, Year, p. 25).
- Reference List: Start on a new page with the bold, centered heading "References". Apply a hanging indent to each entry.
- Capitalization: Use sentence case for the titles of articles, chapters, and books. Use title case for the titles of journals, magazines, and newspapers.
- Italics: Italicize the titles of books and journals.
- Book Example: Author, A. A., & Author, B. B. (Year). *Title of work*. Publisher.
- Journal Article Example: Author, A. A., & Author, B. B. (Year). Title of article. *Title of Journal, volume*(issue), page-numbers. DOI.
- Webpage Example: Author, A. A., & Author, B. B. (Year). *Title of specific page*. Source Name. URL.

Output the title and the sections. Each section consists of a title and content.
`,
});

const generateAcademicContentFlow = ai.defineFlow(
  {
    name: 'generateAcademicContentFlow',
    inputSchema: GenerateAcademicContentInputSchema,
    outputSchema: GenerateAcademicContentOutputSchema,
  },
  async input => {
    const format = academicTaskFormats[input.taskType];
    const {output} = await generateAcademicContentPrompt({...input, format});
    return output!;
  }
);
