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
            bold: true,
          },
        },
        {
          id: 'h2',
          name: 'Heading 2',
          basedOn: 'Default',
          next: 'Default',
          run: {
            bold: true,
          },
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
            children: [new TextRun(content.title || '')],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            style: 'default',
          }),
          new Paragraph({
            children: [new TextRun('Abstract')],
            heading: HeadingLevel.HEADING_1,
            style: 'h1',
          }),
          new Paragraph({
            children: [new TextRun({ text: content.abstract || '', italics: true })],
            style: 'default',
          }),
          ...(content.sections || []).flatMap((section) => [
            new Paragraph({
              children: [new TextRun(section.title || '')],
              heading: HeadingLevel.HEADING_1,
              style: 'h1',
            }),
            new Paragraph({
              children: [new TextRun(section.content || '')],
              style: 'default',
            }),
            ...(section.subSections
              ? section.subSections.flatMap((subSection) => [
                  new Paragraph({
                    children: [new TextRun(subSection.title || '')],
                    heading: HeadingLevel.HEADING_2,
                    style: 'h2',
                  }),
                  new Paragraph({
                    children: [new TextRun(subSection.content || '')],
                    style: 'default',
                  }),
                ])
              : []),
          ]),
          new Paragraph({
            children: [new TextRun('References')],
            heading: HeadingLevel.HEADING_1,
            style: 'h1',
          }),
          ...references.map(
            (ref) =>
              new Paragraph({
                children: [new TextRun(ref.referenceText)],
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
