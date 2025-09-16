
'use server';

import { generateAcademicContent } from '@/ai/flows/generate-academic-content';
import { editSection } from '@/ai/flows/edit-section';
import { paraphraseText } from '@/ai/flows/paraphrase-text';
import { scanTextSnippet } from '@/ai/flows/scan-text-snippet';
import { checkPlagiarism } from '@/ai/flows/check-plagiarism';
import { verifyReferences } from '@/ai/flows/verify-references';
import { generateImageForSection } from '@/ai/flows/generate-image-for-section';
import { exportToDocx as buildDocx } from '@/lib/docx-exporter';
import { Packer } from 'docx';
import type { DocumentContent, References, StyleOptions, Section, ContentBlock } from '@/types';


type GenerationFormValuesWithTemplate = {
    taskType: "Research Paper" | "Assignment" | "Term Paper" | "Project Work" | "Essay Writing" | "Thesis" | "Dissertation" | "Coursework" | "Group Project" | "Book/Article Review" | "Annotated Bibliography" | "Literature Review" | "Field Work Report" | "Seminar Paper" | "Internship Report" | "Position Paper" | "Concept Note / Proposal Writing" | "Abstract Writing" | "Business Plan / Feasibility Study" | "Academic Debate Preparation" | "Mock/ Exam Questions setup" | "Custom";
    topic: string;
    numPages?: number | undefined;
    parameters?: string | undefined;
    customTemplate?: string | undefined;
    includeImages?: boolean;
    includeTables?: boolean;
    includeLists?: boolean;
};


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


export async function generateContentAction(values: GenerationFormValuesWithTemplate) {
  try {
    const generatedContent = await generateAcademicContent(values);
    
    const referencesSection = generatedContent.sections.find(s => s.title.toLowerCase() === 'references');
    const references: References = referencesSection ? referencesSection.content.map(c => {
        if (c.type === 'text') {
            return { referenceText: c.text, isVerified: false, verificationNotes: '' }; // We can't verify here, but we can format
        }
        return null;
    }).filter((r): r is { referenceText: string; isVerified: boolean; verificationNotes: string } => r !== null) : [];

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
    const result = await editSection({
      document,
      sectionTitle,
      instructions,
    });
    
    // The result of editSection is the entire updated document.
    // We just need to find the updated section content to return.
    const newSection = result.sections.find((s) => s.title === sectionTitle);

    if (!newSection) {
      throw new Error('AI did not return the edited section in the document.');
    }

    return { data: newSection.content, error: null };
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

async function cleanContentBlock(block: ContentBlock): Promise<ContentBlock> {
    if (block.type === 'text' && block.text.trim()) {
        const result = await scanTextSnippet({ text: block.text });
        return { ...block, text: result.cleanedText };
    }
    return block;
}

export async function scanAndCleanAction(document: DocumentContent) {
    try {
        const newSections: Section[] = await Promise.all(
            document.sections.map(async (section) => {
                const cleanedContent = await Promise.all(section.content.map(cleanContentBlock));
                
                const cleanedSubSections = section.subSections ? await Promise.all(
                    section.subSections.map(async (subSection) => {
                        const cleanedSubContent = await Promise.all(subSection.content.map(cleanContentBlock));
                        return { ...subSection, content: cleanedSubContent };
                    })
                ) : undefined;

                return { ...section, content: cleanedContent, subSections: cleanedSubSections };
            })
        );
        
        const newDocument: DocumentContent = { ...document, sections: newSections };
        return { data: newDocument, error: null };

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

export async function verifyReferencesAction(referencesToVerify: string) {
    try {
        const result = await verifyReferences({ referencesToVerify });
        return { data: result, error: null };
    } catch (error) {
        console.error(error);
        return { data: null, error: 'Failed to verify references.' };
    }
}


export async function exportDocxAction(
  content: DocumentContent,
  references: References,
  styles: StyleOptions,
  userId: string
) {
  try {
    const { doc } = await buildDocx(content, references, styles, userId);
    const buffer = await Packer.toBuffer(doc);
    const base64 = buffer.toString('base64');
    return { data: { file: base64 }, error: null };
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return { data: null, error: `Failed to export document. Details: ${message}` };
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

export async function generateImageForSectionAction(prompt: string) {
    try {
        const result = await generateImageForSection({ prompt });
        return { data: result.url, error: null };
    } catch (error) {
        console.error(error);
        return { data: null, error: 'Failed to generate image.' };
    }
}
