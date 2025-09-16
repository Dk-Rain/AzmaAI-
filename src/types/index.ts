
import type { ManageReferencesOutput } from '@/ai/flows/manage-references';
import { z } from 'zod';
import { academicTaskTypes } from './academic-task-types';

export const TextBlockSchema = z.object({
    type: z.literal('text'),
    text: z.string().describe('The text content.'),
});

export const ImageBlockSchema = z.object({
    type: z.literal('image'),
    url: z.string().url().describe('The URL of the generated image.'),
    caption: z.string().optional().describe('A caption for the image.'),
});

export const ImagePlaceholderBlockSchema = z.object({
    type: z.literal('image_placeholder'),
    prompt: z.string().describe('The prompt for the image to be generated.'),
    caption: z.string().optional().describe('A caption for the image.'),
});

export const TableBlockSchema = z.object({
    type: z.literal('table'),
    caption: z.string().optional().describe('A caption for the table.'),
    headers: z.array(z.string()).describe('The table headers.'),
    rows: z.array(z.array(z.string())).describe('The table rows, where each inner array is a row.'),
});

export const ListBlockSchema = z.object({
    type: z.literal('list'),
    style: z.enum(['ordered', 'unordered']).describe('The style of the list.'),
    items: z.array(z.string()).describe('The items in the list.'),
});

export const ContentBlockSchema = z.union([TextBlockSchema, ImageBlockSchema, TableBlockSchema, ListBlockSchema, ImagePlaceholderBlockSchema]);


export const SubSectionSchema = z.object({
  title: z.string().describe('The title of the sub-section. It must be between 5 and 10 words.'),
  content: z.array(ContentBlockSchema).describe('The content of the sub-section, which can be text, images, tables, or lists.'),
});

export const SectionSchema = z.object({
  title: z.string().describe('The title of the section. It must be between 5 and 10 words.'),
  content: z.array(ContentBlockSchema).describe('The content of the section, which can be text, images, tables, or lists.'),
  subSections: z.array(SubSectionSchema).optional().describe('The sub-sections within the section.'),
});

export const GenerateAcademicContentOutputSchema = z.object({
  title: z.string().describe('The title of the generated academic content. It must be between 5 and 10 words.'),
  sections: z.array(SectionSchema).describe('The sections of the generated academic content.'),
});
export type GenerateAcademicContentOutput = z.infer<typeof GenerateAcademicContentOutputSchema>;


export type DocumentContent = GenerateAcademicContentOutput;
export type Section = DocumentContent['sections'][0];
export type SubSection = NonNullable<Section['subSections']>[0];


export type TextBlock = z.infer<typeof TextBlockSchema>;
export type ImageBlock = z.infer<typeof ImageBlockSchema>;
export type ImagePlaceholderBlock = z.infer<typeof ImagePlaceholderBlockSchema>;
export type TableBlock = z.infer<typeof TableBlockSchema>;
export type ListBlock = z.infer<typeof ListBlockSchema>;
export type ContentBlock = z.infer<typeof ContentBlockSchema>;


export const availableFonts = [
  'Literata',
  'Calibri',
  'Times New Roman',
  'Arial',
  'Lato',
  'Georgia',
] as const;
export type FontType = (typeof availableFonts)[number];


export type StyleOptions = {
  fontSize: number;
  lineHeight: number;
  margin: number; // in cm
  fontFamily: FontType;
};

export type References = ManageReferencesOutput['references'];
export type Reference = References[0];

// Re-create the schema here since it cannot be exported from the 'use server' file.
export const GenerationSchema = z.object({
  taskType: z.enum(academicTaskTypes),
  topic: z.string().min(1, 'Topic is required.'),
  numPages: z.coerce.number().optional(),
  parameters: z.string().optional(),
  includeImages: z.boolean().optional(),
  includeTables: z.boolean().optional(),
  includeLists: z.boolean().optional(),
});

export type GenerationFormValues = z.infer<typeof GenerationSchema>;

export type DocumentItem = {
  id: string;
  title: string;
  content: DocumentContent;
  references: References;
  timestamp: string;
  isShared?: boolean;
  publicId?: string;
}

export type Project = {
  id: string;
  name: string;
  documents: DocumentItem[];
  timestamp: string;
}

export type ArchivedItem = (DocumentItem & { itemType: 'document' }) | (Project & { itemType: 'project' });

export type SharedDocument = {
    id: string;
    publicId: string;
    title: string;
    sharedAt: string;
}

export type Workspace = {
  projects: Project[];
  standaloneDocuments: DocumentItem[];
  archivedItems: ArchivedItem[];
  sharedDocuments: SharedDocument[];
}
