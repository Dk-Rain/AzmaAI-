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

const FONT_FAMILY = 'Literata';

export async function exportToDocx(
  content: DocumentContent,
  references: References,
  styles: StyleOptions
) {
  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'default',
          name: 'Default',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: FONT_FAMILY,
            size: styles.fontSize * 2,
          },
          paragraph: {
            spacing: { line: styles.lineHeight * 240 },
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
            text: content.title,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            style: 'default',
          }),
          new Paragraph({
            text: 'Abstract',
            heading: HeadingLevel.HEADING_1,
            style: 'default',
          }),
          new Paragraph({
            text: content.abstract,
            style: 'default',
          }),
          ...content.sections.flatMap((section) => [
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_1,
              style: 'default',
            }),
            new Paragraph({
              text: section.content,
              style: 'default',
            }),
            ...(section.subSections
              ? section.subSections.flatMap((subSection) => [
                  new Paragraph({
                    text: subSection.title,
                    heading: HeadingLevel.HEADING_2,
                    style: 'default',
                  }),
                  new Paragraph({
                    text: subSection.content,
                    style: 'default',
                  }),
                ])
              : []),
          ]),
          new Paragraph({
            text: 'References',
            heading: HeadingLevel.HEADING_1,
            style: 'default',
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
        ],
      },
    ],
  });

  const base64 = await Packer.toBase64(doc);
  return base64;
}
