'use server';

import { generateAcademicContent } from '@/ai/flows/generate-academic-content';
import { arrangeContentIntoAcademicFormat } from '@/ai/flows/arrange-content-into-academic-format';
import { manageReferences } from '@/ai/flows/manage-references';
import { exportToDocx } from '@/lib/docx-exporter';
import type { DocumentContent, References, StyleOptions } from '@/types';

export async function generateContentAction(topic: string, parameters: string) {
  try {
    const generatedContent = await generateAcademicContent({
      topic,
      parameters,
    });

    const arrangedContent = await arrangeContentIntoAcademicFormat({
      topic,
      content: JSON.stringify(generatedContent),
    });

    return { data: arrangedContent, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Failed to generate content.' };
  }
}

export async function regenerateSectionAction(
  document: DocumentContent,
  sectionTitle: string
) {
  try {
    const topic = document.title;
    const context = document.sections
      .filter((s) => s.title !== sectionTitle)
      .map((s) => `${s.title}: ${s.content.substring(0, 200)}...`)
      .join('\n');

    const parameters = `Regenerate the section titled "${sectionTitle}" for a paper on "${topic}". 
      The abstract is: "${document.abstract}".
      Other sections for context are:
      ${context}
      
      Please provide only the new content for the "${sectionTitle}" section. Output just the text content.`;

    const result = await generateAcademicContent({ topic, parameters });

    // Assuming the AI returns the regenerated content in the first section
    const newContent = result.sections[0]?.content;

    if (!newContent) {
      throw new Error('AI did not return content for the section.');
    }

    return { data: newContent, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Failed to regenerate section.' };
  }
}

export async function manageReferencesAction(
  topic: string,
  numReferences: number
) {
  try {
    const result = await manageReferences({ topic, numReferences });
    return { data: result.references, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Failed to manage references.' };
  }
}

export async function exportDocxAction(
  content: DocumentContent,
  references: References,
  styles: StyleOptions
) {
  try {
    const base64 = await exportToDocx(content, references, styles);
    return { data: base64, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Failed to export document.' };
  }
}
