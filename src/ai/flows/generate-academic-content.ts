
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

// Define search tools
const arxivSearchTool = ai.defineTool(
    {
        name: 'arxivSearch',
        description: 'Search for academic papers on arXiv. Use for topics related to physics, mathematics, computer science, quantitative biology, quantitative finance, statistics, electrical engineering, and economics.',
        inputSchema: z.object({
            query: z.string().describe('The search query, like a topic or title.'),
        }),
        outputSchema: z.string().describe('A summary of the top search results, including titles, authors, and abstracts.'),
    },
    async ({ query }) => {
        try {
            const response = await fetch(`https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=3`);
            if (!response.ok) {
                return `Error fetching from arXiv: ${response.statusText}`;
            }
            const xmlText = await response.text();
            // Basic parsing, could be improved with an XML parser
            const entries = xmlText.split('<entry>').slice(1);
            if (entries.length === 0) return "No results found on arXiv.";
            
            const results = entries.map(entry => {
                const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1].trim().replace(/\n\s*/g, ' ');
                const summary = entry.match(/<summary>([\s-S]*?)<\/summary>/)?.[1].trim().replace(/\n\s*/g, ' ');
                const authors = [...entry.matchAll(/<name>([\s\S]*?)<\/name>/g)].map(match => match[1].trim()).join(', ');
                const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1].trim();
                const doi = entry.match(/<arxiv:doi[\s\S]*?>([\s\S]*?)<\/arxiv:doi>/)?.[1].trim();
                return `Title: ${title}\nAuthors: ${authors}\nPublished: ${published}\nDOI: ${doi || 'N/A'}\nSummary: ${summary}`;
            }).join('\n\n---\n\n');

            return `arXiv Search Results for "${query}":\n${results}`;
        } catch (e: any) {
            return `Failed to query arXiv: ${e.message}`;
        }
    }
);

const pubmedSearchTool = ai.defineTool(
    {
        name: 'pubmedSearch',
        description: 'Search for biomedical and life sciences literature on PubMed. Use for topics related to medicine, nursing, dentistry, veterinary medicine, health care systems, and preclinical sciences.',
        inputSchema: z.object({
            query: z.string().describe('The search query, like a topic, gene, or author.'),
        }),
        outputSchema: z.string().describe('A summary of the top search results, including titles, authors, and abstracts.'),
    },
    async ({ query }) => {
        try {
            // Step 1: Get UIDs for the search query
            const searchResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=3&format=json`);
            if (!searchResponse.ok) return `Error searching PubMed: ${searchResponse.statusText}`;
            const searchData = await searchResponse.json();
            const ids = searchData.esearchresult.idlist;

            if (ids.length === 0) return "No results found on PubMed.";
            
            // Step 2: Get summaries for the UIDs
            const summaryResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&format=json`);
             if (!summaryResponse.ok) return `Error fetching PubMed summaries: ${summaryResponse.statusText}`;
            const summaryData = await summaryResponse.json();
            
            const results = Object.values(summaryData.result).filter((r: any) => r.uid).map((r: any) => {
                const doi = r.articleids.find((a: any) => a.idtype === 'doi')?.value || 'N/A';
                return `Title: ${r.title}\nAuthors: ${r.authors.map((a: any) => a.name).join(', ')}\nPublished: ${r.pubdate}\nDOI: ${doi}\nJournal: ${r.fulljournalname}`;
            }).join('\n\n---\n\n');

            return `PubMed Search Results for "${query}":\n${results}`;
        } catch (e: any) {
             return `Failed to query PubMed: ${e.message}`;
        }
    }
);

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


const generateAcademicContentPrompt = ai.definePrompt({
  name: 'generateAcademicContentPrompt',
  input: {schema: GenerateAcademicContentInputSchema.extend({
    format: z.string().describe('The suggested structure or format for the document.')
  })},
  output: {schema: GenerateAcademicContentOutputSchema},
  tools: [arxivSearchTool, pubmedSearchTool, generateImageTool],
  prompt: `You are an expert academic content generator. Your primary task is to generate a comprehensive, well-structured academic document based on the user's request.

**Process:**
1.  **Research**: Use the \`arxivSearch\` and \`pubmedSearch\` tools to find relevant, real academic sources for the given topic. Synthesize the information from these sources to build your content.
2.  **Structure Content**: You must determine the most appropriate format for the content. For standard text, use a 'text' block. When data or comparisons are best shown visually, generate a 'table' block. For itemizations, use a 'list' block. If a concept is best explained with a visual aid, create a descriptive prompt for an image and use the 'generateImage' tool.
3.  **Cite Sources**: Create a "References" section at the end of the document. This section must list the full citations of the articles you found and used from your tool-based research. Format these citations in APA style.

Your output must be a single, valid JSON object that strictly adheres to the GenerateAcademicContentOutputSchema.

**Content Generation Rules:**

1.  **Page Count**: If the user specifies a number of pages, you must generate content that would realistically fill that many standard pages (approximately 500 words per page).
2.  **Text**: For all narrative, explanatory, or argumentative content, use a text block: \`{ "type": "text", "text": "..." }\`.
3.  **Images/Diagrams**:
    *   When a visual diagram, chart, or illustration would enhance a section, do not describe it in text.
    *   Instead, call the \`generateImage\` tool with a clear, descriptive prompt for that image (e.g., "A flowchart showing the steps of photosynthesis," "A bar chart comparing the populations of New York, London, and Tokyo").
    *   The tool will return an image URL. You must place this URL into an image block: \`{ "type": "image", "url": "...", "caption": "..." }\`.
4.  **Tables**:
    *   When presenting structured data (e.g., comparisons, statistics, classifications), use a table block.
    *   Format it as: \`{ "type": "table", "caption": "...", "headers": ["Header 1", "Header 2"], "rows": [["Row 1 Col 1", "Row 1 Col 2"], ["Row 2 Col 1", "Row 2 Col 2"]] }\`.
5.  **Lists**:
    *   For sequential steps, use an ordered list. Format it as: \`{ "type": "list", "style": "ordered", "items": ["First step", "Second step"] }\`.
    *   For non-sequential items, use an unordered list. Format it as: \`{ "type": "list", "style": "unordered", "items": ["Bullet point 1", "Bullet point 2"] }\`.
6.  **Title Rules**: All titles (document, section, sub-section) must be concise, between 5 and 10 words.

**User Request:**

*   **Task Type**: {{{taskType}}}
*   **Topic**: {{{topic}}}
*   {{#if numPages}}**Number of Pages**: {{{numPages}}}{{/if}}
*   **Parameters**: {{{parameters}}}
*   **Suggested Format**: {{{format}}}

Adhere to all instructions and generate a complete, high-quality academic document in the specified JSON format. You MUST include a "References" section populated with the sources you used. Do NOT include an "Abstract" section unless explicitly requested in the parameters.
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
