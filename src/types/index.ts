
import type { ArrangeContentOutput } from '@/ai/flows/arrange-content-into-academic-format';
import type { ManageReferencesOutput } from '@/ai/flows/manage-references';
import { z } from 'zod';
import { academicTaskTypes } from './academic-task-types';
import type { GenerateAcademicContentInput } from '@/ai/flows/generate-academic-content';


export type DocumentContent = ArrangeContentOutput;
export type Section = ArrangeContentOutput['sections'][0];
export type SubSection = NonNullable<Section['subSections']>[0];

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
