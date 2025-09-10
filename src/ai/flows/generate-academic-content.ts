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

const GenerateAcademicContentInputSchema = z.object({
  topic: z.string().describe('The topic of the academic content to generate.'),
  parameters: z
    .string()
    .describe(
      'Specific parameters or instructions for generating the content, such as desired sections, focus areas, or specific arguments to include.'
    ),
});
export type GenerateAcademicContentInput = z.infer<
  typeof GenerateAcademicContentInputSchema
>;

const GenerateAcademicContentOutputSchema = z.object({
  title: z.string().describe('The title of the generated academic content.'),
  abstract: z.string().describe('A brief summary of the generated content.'),
  sections: z
    .array(z.object({title: z.string(), content: z.string()}))
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
content on the following topic, according to the given parameters.

Topic: {{{topic}}}
Parameters: {{{parameters}}}

Ensure that the generated content is well-structured and academically sound.

Output the title, abstract and the sections. Each section consists of a title and content.
`,
});

const generateAcademicContentFlow = ai.defineFlow(
  {
    name: 'generateAcademicContentFlow',
    inputSchema: GenerateAcademicContentInputSchema,
    outputSchema: GenerateAcademicContentOutputSchema,
  },
  async input => {
    const {output} = await generateAcademicContentPrompt(input);
    return output!;
  }
);
