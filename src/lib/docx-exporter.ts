
'use server';

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
  PageBreak,
} from 'docx';
import type { DocumentContent, References, StyleOptions } from '@/types';


export async function exportToDocx(
  content: DocumentContent,
  references: References,
  styles: StyleOptions
) {
  if (!content) {
    throw new Error('Content is not defined');
  }
  
  const hasReferencesSection = content.sections.some(
    (section) => section.title.toLowerCase().includes('references')
  );

  const uniqueId = `AZMA-DOC-${Date.now()}-${content.title.slice(0,10).replace(/\s/g, '')}`;

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'default',
          name: 'Default',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: styles.fontFamily,
            size: styles.fontSize * 2,
          },
          paragraph: {
            spacing: { line: styles.lineHeight * 240 },
          },
        },
        {
          id: 'h1',
          name: 'Heading 1',
          basedOn: 'Default',
          next: 'Default',
          run: {
            size: (styles.fontSize + 4) * 2,
            bold: true,
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
          }
        },
        {
          id: 'h2',
          name: 'Heading 2',
          basedOn: 'Default',
          next: 'Default',
          run: {
            size: (styles.fontSize + 2) * 2,
            bold: true,
          },
           paragraph: {
            spacing: { before: 200, after: 100 },
          }
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(styles.margin / 2.54),
              right: convertInchesToTwip(styles.margin / 2.54),
              bottom: convertInchesToTwip(styles.margin / 2.54),
              left: convertInchesToTwip(styles.margin / 2.54),
            },
          },
        },
        children: [
            // Verification Page
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "Document Verification",
                        bold: true,
                        size: 28,
                    }),
                ],
                spacing: { after: 400 },
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "Generated and Verified by AzmaAI",
                        size: 24,
                        italics: true,
                    }),
                ],
                spacing: { after: 800 },
            }),
             new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                    new TextRun({
                        text: "Document ID:",
                        bold: true,
                        size: 24,
                    }),
                ],
                spacing: { after: 200 },
            }),
             new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                    new TextRun({
                        text: uniqueId,
                        size: 22,
                    }),
                ],
                style: 'default',
            }),
            new Paragraph({
                children: [new PageBreak()]
            }),

          // Original Content
          new Paragraph({
            text: content.title || '',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            style: 'default',
          }),
          new Paragraph({ text: '' }), // Spacer
          ...(content.sections || []).flatMap((section) => [
            new Paragraph({
              text: section.title || '',
              heading: HeadingLevel.HEADING_1,
              style: 'h1',
            }),
            ...Array.isArray(section.content) ? section.content.map(block => new Paragraph({
                text: block.type === 'text' ? block.text : `[Unsupported Block: ${block.type}]`,
                style: 'default',
            })) : [new Paragraph({ text: '', style: 'default'})],
            ...(section.subSections || []).flatMap((subSection) => [
                  new Paragraph({ text: '' }), // Spacer
                  new Paragraph({
                    text: subSection.title || '',
                    heading: HeadingLevel.HEADING_2,
                    style: 'h2',
                  }),
                  ...Array.isArray(subSection.content) ? subSection.content.map(block => new Paragraph({
                      text: block.type === 'text' ? block.text : `[Unsupported Block: ${block.type}]`,
                      style: 'default',
                  })) : [new Paragraph({ text: '', style: 'default'})],
                ])
          ]),
          // Conditionally add the references section
          ...(!hasReferencesSection && (references || []).length > 0
            ? [
                new Paragraph({ text: '' }), // Spacer
                new Paragraph({
                  text: 'References',
                  heading: HeadingLevel.HEADING_1,
                  style: 'h1',
                }),
                ...references.map(
                  (ref) =>
                    new Paragraph({
                      text: ref.referenceText,
                      style: 'default',
                      bullet: {
                        level: 0,
                      },
                    })
                ),
              ]
            : []),
        ],
      },
    ],
  });

  return doc;
}
