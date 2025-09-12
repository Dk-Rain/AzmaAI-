
'use server';
/**
 * @fileOverview A flow to edit a specific section of a document.
 *
 * - editSection - A function that modifies a section based on instructions.
 * - EditSectionInput - The input type for the editSection function.
 * - EditSectionOutput - The return type for the editSection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateAcademicContentOutputSchema } from '@/types';

const EditSectionInputSchema = z.object({
  document: GenerateAcademicContentOutputSchema.describe('The full existing document content.'),
  sectionTitle: z.string().describe('The title of the section to be edited.'),
  instructions: z.string().describe('The user\'s instructions for what to change.'),
});
export type EditSectionInput = z.infer<typeof EditSectionInputSchema>;

// The output is the entire updated document
export type EditSectionOutput = z.infer<typeof GenerateAcademicContentOutputSchema>;

export async function editSection(input: EditSectionInput): Promise<EditSectionOutput> {
  return editSectionFlow(input);
}

const generateImageTool = ai.defineTool(
    {
        name: 'generateImage',
        description: 'Generates an image from a text prompt. Use this to create diagrams, charts, or illustrations that visually explain a concept.',
        inputSchema: z.object({
            prompt: z.string().describe('A detailed, descriptive prompt for the image to be generated.'),
        }),
        outputSchema: z.object({
            url: z.string().url().describe('The data URI of the generated image.'),
        }),
    },
    async ({ prompt }) => {
        const { media } = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: `academic illustration, clean vector style, infographic, ${prompt}`,
            config: {
                responseMimeType: 'image/png',
            },
        });
        if (!media) {
            throw new Error('Image generation failed to return media.');
        }
        return { url: media.url };
    }
);

const editSectionPrompt = ai.definePrompt({
  name: 'editSectionPrompt',
  input: {schema: z.object({
      document: z.string(),
      sectionTitle: z.string(),
      instructions: z.string(),
  })},
  output: {schema: GenerateAcademicContentOutputSchema},
  tools: [generateImageTool],
  prompt: `You are an expert academic editor. Your task is to modify a specific section of an existing document based on the user's instructions.

**Instructions:**

1.  **Identify the Target Section**: Find the section in the document with the title matching "{{sectionTitle}}".
2.  **Apply Edits**: Modify **only that section** according to the following instruction: "{{instructions}}".
    *   If the instruction is to add a visual, use the \`generateImage\` tool to create it and insert an 'image' block.
    *   If the instruction is to add a table or list, create a 'table' or 'list' block.
    *   If the instruction is to change the text, modify the existing 'text' blocks or add new ones.
3.  **Maintain Structure**: Do not change any other sections of the document. Return the entire document, with only the target section modified.
4.  **Preserve IDs and Metadata**: The underlying structure and any IDs should be preserved. You are only changing the content of one section.
5.  **Title Rules**: All titles (document, section, sub-section) must be concise, between 5 and 10 words.
6.  **Output**: Your output must be the complete, updated document as a single, valid JSON object that strictly adheres to the provided schema.

**Original Document:**
\`\`\`json
{{{document}}}
\`\`\`
`,
});

const editSectionFlow = ai.defineFlow(
  {
    name: 'editSectionFlow',
    inputSchema: EditSectionInputSchema,
    outputSchema: GenerateAcademicContentOutputSchema,
  },
  async ({ document, sectionTitle, instructions }) => {
    const {output} = await editSectionPrompt({
        document: JSON.stringify(document),
        sectionTitle,
        instructions
    });
    return output!;
  }
);
