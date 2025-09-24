
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
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ISectionOptions,
} from 'docx';
import type { DocumentContent, References, StyleOptions, ContentBlock } from '@/types';
import type { DocumentHistoryEntry } from '@/types/admin';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';


async function renderBlockToDocx(block: ContentBlock, styles: StyleOptions): Promise<(Paragraph | Table)[]> {
  switch (block.type) {
    case 'text':
      return [new Paragraph({ text: block.text, style: 'default' })];
    
    case 'image':
      try {
        const response = await fetch(block.url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const imageBuffer = await response.arrayBuffer();
        return [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 500,
                  height: 300,
                },
              }),
            ],
          }),
          block.caption ? new Paragraph({ text: block.caption, alignment: AlignmentType.CENTER, style: 'default' }) : new Paragraph({}),
        ];
      } catch (error) {
        console.error('Failed to fetch image for DOCX:', error);
        return [new Paragraph({ text: `[Image could not be loaded: ${block.url}]`, style: 'default' })];
      }
    
    case 'image_placeholder':
        return [new Paragraph({ text: `[Image placeholder: "${block.prompt}"]`, style: 'default' })];

    case 'list':
      return block.items.map(item => new Paragraph({
        text: item,
        bullet: { level: 0 },
        style: 'default',
      }));

    case 'table':
      const table = new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            children: block.headers.map(header => new TableCell({
              children: [new Paragraph({ text: header, style: 'default', alignment: AlignmentType.CENTER })],
            })),
          }),
          ...block.rows.map(row => new TableRow({
            children: row.map(cell => new TableCell({
              children: [new Paragraph({ text: cell, style: 'default' })],
            })),
          })),
        ],
      });
      // A table must be followed by a paragraph to avoid issues in some word processors
      return [table, new Paragraph({ text: block.caption || '', alignment: AlignmentType.CENTER, style: 'default' })];

    default:
      // This will cause a compile-time error if a new block type is added but not handled here.
      const exhaustiveCheck: never = block;
      return [new Paragraph({ text: `[Unsupported Block]`, style: 'default' })];
  }
}

export async function exportToDocx(
  content: DocumentContent,
  references: References,
  styles: StyleOptions,
  userId: string,
): Promise<Document> {
  if (!content) {
    throw new Error('Content is not defined');
  }
  
  const hasReferencesSection = content.sections.some(
    (section) => section.title.toLowerCase().includes('references')
  );

  const uniqueId = `AZMA-DOC-${Date.now()}-${(content.title || 'untitled').slice(0,10).replace(/\s/g, '')}`;

  const exportEntry: DocumentHistoryEntry = {
    docId: uniqueId,
    title: content.title,
    generatedAt: new Date().toISOString(),
    generatedBy: userId,
  };

  // Save export record to Firestore
  try {
      const exportDocRef = doc(db, 'export', uniqueId);
      await setDoc(exportDocRef, exportEntry);
  } catch (error) {
      console.error("Failed to save export record to Firestore:", error);
      // We can decide if this should be a critical error or not.
      // For now, we'll just log it and continue with document generation.
  }
  
  const processSection = async (section: DocumentContent['sections'][0]) => {
    const sectionChildren: (Paragraph | Table)[] = [];
    
    sectionChildren.push(new Paragraph({
        text: section.title || '',
        heading: HeadingLevel.HEADING_1,
        style: 'h1',
    }));

    for (const block of (section.content || [])) {
        const renderedBlocks = await renderBlockToDocx(block, styles);
        sectionChildren.push(...renderedBlocks);
    }
    
    if(section.subSections) {
        for (const subSection of section.subSections) {
            sectionChildren.push(new Paragraph({
                text: subSection.title || '',
                heading: HeadingLevel.HEADING_2,
                style: 'h2',
            }));
            for (const block of (subSection.content || [])) {
                const renderedBlocks = await renderBlockToDocx(block, styles);
                sectionChildren.push(...renderedBlocks);
            }
        }
    }
    return sectionChildren;
  }
  
  const docChildren: (Paragraph | Table)[] = [
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
  ];

  for (const section of (content.sections || [])) {
      const sectionBlocks = await processSection(section);
      docChildren.push(...sectionBlocks);
  }
  
  // Conditionally add the references section
  if (!hasReferencesSection && (references || []).length > 0) {
    docChildren.push(new Paragraph({ text: '' })); // Spacer
    docChildren.push(new Paragraph({
        text: 'References',
        heading: HeadingLevel.HEADING_1,
        style: 'h1',
    }));
    references.forEach(ref => {
        docChildren.push(new Paragraph({
            text: ref.referenceText,
            style: 'default',
            bullet: { level: 0 },
        }));
    });
  }


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
        children: docChildren,
      },
    ],
  });

  return doc;
}
