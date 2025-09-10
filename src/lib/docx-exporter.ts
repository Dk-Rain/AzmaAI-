'use server';

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
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
         {
          id: 'abstract',
          name: 'Abstract',
          basedOn: 'Default',
          next: 'Default',
          run: {
            italics: true,
          },
           paragraph: {
            indent: { left: 720, right: 720 }
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
          new Paragraph({
            text: content.title || '',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            style: 'default',
          }),
          new Paragraph({ text: '' }), // Spacer
          new Paragraph({
            text: 'Abstract',
            heading: HeadingLevel.HEADING_1,
            style: 'h1',
          }),
          new Paragraph({
            text: content.abstract || '',
            style: 'abstract',
          }),
          new Paragraph({ text: '' }), // Spacer
          ...(content.sections || []).flatMap((section) => [
            new Paragraph({
              text: section.title || '',
              heading: HeadingLevel.HEADING_1,
              style: 'h1',
            }),
            new Paragraph({
              text: section.content || '',
              style: 'default',
            }),
            ...(section.subSections || []).flatMap((subSection) => [
                  new Paragraph({ text: '' }), // Spacer
                  new Paragraph({
                    text: subSection.title || '',
                    heading: HeadingLevel.HEADING_2,
                    style: 'h2',
                  }),
                  new Paragraph({
                    text: subSection.content || '',
                    style: 'default',
                  }),
                ])
          ]),
          new Paragraph({ text: '' }), // Spacer
          new Paragraph({
            text: 'References',
            heading: HeadingLevel.HEADING_1,
            style: 'h1',
          }),
          ...(references || []).map(
            (ref) =>
              new Paragraph({
                text: ref.referenceText,
                style: 'default',
                bullet: {
                  level: 0,
                },
              })
          ),
        ],
      },
    ],
  });

  const base64 = await Packer.toBase64(doc);
  return base64;
}
