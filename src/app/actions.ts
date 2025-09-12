
'use server';

import { generateAcademicContent } from '@/ai/flows/generate-academic-content';

import { paraphraseText } from '@/ai/flows/paraphrase-text';
import { scanAndCleanDocument } from '@/ai/flows/scan-and-clean-document';
import { scanTextSnippet } from '@/ai/flows/scan-text-snippet';
import { checkPlagiarism } from '@/ai/flows/check-plagiarism';
import { exportToDocx as buildDocx } from '@/lib/docx-exporter';
import { Packer } from 'docx';
import type { DocumentContent, References, StyleOptions } from '@/types';
import type { GenerationFormValues } from '@/types';

function formatAsText(content: DocumentContent, references: References): string {
    let text = `Title: ${content.title}\n\n`;
    text += '-----------------\n\n';

    const hasReferencesSection = content.sections.some(
        (section) => section.title.toLowerCase().includes('references')
    );

    content.sections.forEach(section => {
        text += `## ${section.title} ##\n\n`;
        section.content.forEach(block => {
            if (block.type === 'text') {
                text += `${block.text}\n\n`;
            }
        });

        if(section.subSections && section.subSections.length > 0) {
            section.subSections.forEach(sub => {
                text += `### ${sub.title} ###\n\n`;
                sub.content.forEach(block => {
                    if (block.type === 'text') {
                        text += `${block.text}\n\n`;
                    }
                });
            });
        }
    });

    if (!hasReferencesSection && references.length > 0) {
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

    const hasReferencesSection = content.sections.some(
        (section) => section.title.toLowerCase().includes('references')
    );

    content.sections.forEach(section => {
        const sectionContent = section.content.map(b => b.type === 'text' ? b.text : `[${b.type}]`).join(' ');
        csv += `Section,${escapeCsv(section.title)},${escapeCsv(sectionContent)}\n`;
        if (section.subSections) {
            section.subSections.forEach(sub => {
                const subContent = sub.content.map(b => b.type === 'text' ? b.text : `[${b.type}]`).join(' ');
                csv += `Sub-Section,${escapeCsv(sub.title)},${escapeCsv(subContent)}\n`;
            });
        }
    });

    if (!hasReferencesSection && references.length > 0) {
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
    
    const referencesSection = generatedContent.sections.find(s => s.title.toLowerCase() === 'references');
    const references: References = referencesSection ? referencesSection.content.map(c => {
        if (c.type === 'text') {
            return { referenceText: c.text, isVerified: false }; // We can't verify here, but we can format
        }
        return null;
    }).filter((r): r is { referenceText: string; isVerified: boolean; } => r !== null) : [];

    return { data: { content: generatedContent, references }, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Failed to generate content.' };
  }
}

export async function regenerateSectionAction(
  document: DocumentContent,
  sectionTitle: string,
  instructions: string
) {
  try {
    const topic = document.title;
    const context = document.sections
      .filter((s) => s.title !== sectionTitle)
      .map((s) => `${s.title}: ${s.content.map(b => b.type === 'text' ? b.text.substring(0, 100) : `[${b.type}]`).join(' ')}...`)
      .join('\n');

    const parameters = `You are editing a section titled "${sectionTitle}" within a larger document on "${topic}".
      
      The user has provided the following instructions for this section:
      "${instructions}"

      For context, here are the other sections in the document:
      ${context}
      
      Please provide only the new content for the "${sectionTitle}" section based on the user's instructions. Output just the text content.`;

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


export async function paraphraseTextAction(text: string) {
  try {
    const result = await paraphraseText({ text });
    return { data: result.paraphrasedText, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Failed to paraphrase text.' };
  }
}

export async function scanTextSnippetAction(text: string) {
    try {
        const result = await scanTextSnippet({ text });
        return { data: result.cleanedText, error: null };
    } catch (error) {
        console.error(error);
        return { data: null, error: 'Failed to scan text snippet.' };
    }
}

export async function scanAndCleanAction(document: DocumentContent) {
    try {
        const result = await scanAndCleanDocument({ document });
        return { data: result, error: null };
    } catch (error) {
        console.error(error);
        return { data: null, error: 'Failed to scan and clean document.' };
    }
}

export async function checkPlagiarismAction(document: DocumentContent) {
    try {
        const result = await checkPlagiarism({ document });
        return { data: result, error: null };
    } catch (error) {
        console.error(error);
        return { data: null, error: 'Failed to check for plagiarism.' };
    }
}

export async function exportDocxAction(
  content: DocumentContent,
  references: References,
  styles: StyleOptions
) {
  try {
    const doc = await buildDocx(content, references, styles);
    const base64 = await Packer.toBase64(doc);
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

export async function editSectionAction(
  document: DocumentContent,
  sectionTitle: string,
  instructions: string
) {
  try {
    const { editSection } = await import('@/ai/flows/edit-section');
    const result = await editSection({
      document,
      sectionTitle,
      instructions,
    });
    return { data: result, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Failed to edit section.' };
  }
}
