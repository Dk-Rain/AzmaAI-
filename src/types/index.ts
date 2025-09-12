
import type { GenerateAcademicContentOutput } from '@/ai/flows/generate-academic-content';
import type { ManageReferencesOutput } from '@/ai/flows/manage-references';
import { z } from 'zod';
import { academicTaskTypes } from './academic-task-types';
import type { GenerateAcademicContentInput } from '@/ai/flows/generate-academic-content';

export type DocumentContent = GenerateAcademicContentOutput;
export type Section = DocumentContent['sections'][0];
export type SubSection = NonNullable<Section['subSections']>[0];


export type TextBlock = {
    type: 'text';
    text: string;
};

export type ImageBlock = {
    type: 'image';
    url: string;
    caption?: string;
};

export type TableBlock = {
    type: 'table';
    caption?: string;
    headers: string[];
    rows: string[][];
};

export type ListBlock = {
    type: 'list';
    style: 'ordered' | 'unordered';
    items: string[];
};

export type ContentBlock = TextBlock | ImageBlock | TableBlock | ListBlock;


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
});

export type GenerationFormValues = z.infer<typeof GenerationSchema>;

    