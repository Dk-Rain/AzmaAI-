'use server';

import { generateAcademicContent } from '@/ai/flows/generate-academic-content';
import { arrangeContentIntoAcademicFormat } from '@/ai/flows/arrange-content-into-academic-format';
import { manageReferences } from '@/ai/flows/manage-references';
import { exportToDocx } from '@/lib/docx-exporter';
import type { DocumentContent, References, StyleOptions } from '@/types';
import type { GenerationFormValues } from '@/types';

function formatAsText(content: DocumentContent, references: References): string {
    let text = `Title: ${content.title}\n\n`;
    text += `Abstract:\n${content.abstract}\n\n`;
    text += '-----------------\n\n';

    content.sections.forEach(section => {
        text += `## ${section.title} ##\n\n`;
        text += `${section.content}\n\n`;

        if(section.subSections && section.subSections.length > 0) {
            section.subSections.forEach(sub => {
                text += `### ${sub.title} ###\n\n`;
                text += `${sub.content}\n\n`;
            });
        }
    });

    if (references.length > 0) {
        text += '-----------------\n\n';
        text += '## References ##\n\n';
        references.forEach(ref => {
            text += `- ${ref.referenceText}\n`;
        });
    }

    return text;
}

function formatAsCsv(content: DocumentContent, references: References): string {
    const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
    
    let csv = 'Type,Title,Content\n';
    csv += `Title,${escapeCsv(content.title)},""\n`;
    csv += `Abstract,${escapeCsv(content.abstract)},""\n`;

    content.sections.forEach(section => {
        csv += `Section,${escapeCsv(section.title)},${escapeCsv(section.content)}\n`;
        if (section.subSections) {
            section.subSections.forEach(sub => {
                csv += `Sub-Section,${escapeCsv(sub.title)},${escapeCsv(sub.content)}\n`;
            });
        }
    });

    if (references.length > 0) {
        csv += 'Reference,"",\n'; // Add a header for references
        references.forEach(ref => {
            csv += `Reference Item,${escapeCsv(ref.referenceText)},${escapeCsv(ref.doi || '')}\n`;
        });
    }

    return csv;
}


export async function generateContentAction(values: GenerationFormValues) {
  try {
    const generatedContent = await generateAcademicContent(values);

    const arrangedContent = await arrangeContentIntoAcademicFormat({
      topic: values.topic,
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

    // Note: taskType is not directly used here as we are regenerating a small part
    const result = await generateAcademicContent({ topic, parameters, taskType: 'Assignment' });

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

export async function exportTxtAction(
  content: DocumentContent,
  references: References,
) {
    try {
        const text = formatAsText(content, references);
        return { data: text, error: null };
    } catch(error) {
        console.error(error);
        return { data: null, error: 'Failed to export document as .txt' };
    }
}

export async function exportCsvAction(
  content: DocumentContent,
  references: References,
) {
    try {
        const csv = formatAsCsv(content, references);
        return { data: csv, error: null };
    } catch(error) {
        console.error(error);
        return { data: null, error: 'Failed to export document as .csv' };
    }
}
