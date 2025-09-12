
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
import { GenerateAcademicContentOutputSchema } from '@/types';
import type { GenerateAcademicContentOutput } from '@/types';


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

export async function generateAcademicContent(
  input: GenerateAcademicContentInput
): Promise<GenerateAcademicContentOutput> {
  return generateAcademicContentFlow(input);
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
        console.log(`Generating image with prompt: ${prompt}`);
        const { media } = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: `academic illustration, clean vector style, infographic, ${prompt}`,
            config: {
                responseMimeType: 'image/png',
            },
        });
        console.log(`Image generated: ${media.url.substring(0, 50)}...`);
        return { url: media.url };
    }
);


const generateAcademicContentPrompt = ai.definePrompt({
  name: 'generateAcademicContentPrompt',
  input: {schema: GenerateAcademicContentInputSchema.extend({
    format: z.string().describe('The suggested structure or format for the document.')
  })},
  output: {schema: GenerateAcademicContentOutputSchema},
  prompt: `You are an expert academic content generator. Your primary task is to generate a comprehensive, well-structured academic document based on the user's request.

You must determine the most appropriate format for the content. For standard text, use a 'text' block. When data or comparisons are best shown visually, generate a 'table' block. For itemizations, use a 'list' block. If a concept is best explained with a visual aid, you should create a descriptive prompt for an image and the 'generateImage' tool will create it.

Your output must be a single, valid JSON object that strictly adheres to the GenerateAcademicContentOutputSchema.

**Content Generation Rules:**

1.  **Text**: For all narrative, explanatory, or argumentative content, use a text block: \`{ "type": "text", "text": "..." }\`.
2.  **Images/Diagrams**:
    *   When a visual diagram, chart, or illustration would enhance a section, do not describe it in text.
    *   Instead, call the \`generateImage\` tool with a clear, descriptive prompt for that image (e.g., "A flowchart showing the steps of photosynthesis," "A bar chart comparing the populations of New York, London, and Tokyo").
    *   The tool will return an image URL. You must place this URL into an image block: \`{ "type": "image", "url": "...", "caption": "..." }\`.
3.  **Tables**:
    *   When presenting structured data (e.g., comparisons, statistics, classifications), use a table block.
    *   Format it as: \`{ "type": "table", "caption": "...", "headers": ["Header 1", "Header 2"], "rows": [["Row 1 Col 1", "Row 1 Col 2"], ["Row 2 Col 1", "Row 2 Col 2"]] }\`.
4.  **Lists**:
    *   For sequential steps, use an ordered list. Format it as: \`{ "type": "list", "style": "ordered", "items": ["First step", "Second step"] }\`.
    *   For non-sequential items, use an unordered list. Format it as: \`{ "type": "list", "style": "unordered", "items": ["Bullet point 1", "Bullet point 2"] }\`.

**User Request:**

*   **Task Type**: {{{taskType}}}
*   **Topic**: {{{topic}}}
*   {{#if numPages}}**Number of Pages**: {{{numPages}}}{{/if}}
*   **Parameters**: {{{parameters}}}
*   **Suggested Format**: {{{format}}}

Adhere to all instructions and generate a complete, high-quality academic document in the specified JSON format. Ensure all titles (document, section, sub-section) are concise and under 10 words. Do NOT include an "Abstract" section unless explicitly requested in the parameters.
`,
});

const generateAcademicContentFlow = ai.defineFlow(
  {
    name: 'generateAcademicContentFlow',
    inputSchema: GenerateAcademicContentInputSchema,
    outputSchema: GenerateAcademicContentOutputSchema,
    tools: [generateImageTool]
  },
  async input => {
    const format = academicTaskFormats[input.taskType];
    const {output} = await generateAcademicContentPrompt({...input, format});
    return output!;
  }
);

