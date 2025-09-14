
import { NextRequest, NextResponse } from 'next/server';
import { exportToDocx as buildDocx } from '@/lib/docx-exporter';
import { Packer } from 'docx';
import { GenerateAcademicContentOutputSchema } from '@/types';
import * as z from 'zod';

const RequestBodySchema = z.object({
  content: GenerateAcademicContentOutputSchema,
  references: z.any(), // Not strictly validating references/styles for now, just ensuring they exist
  styles: z.any(),
});


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = RequestBodySchema.safeParse(body);

    if (!validation.success) {
      console.error("Invalid request body:", validation.error.issues);
      return NextResponse.json({ error: 'Missing or invalid required document data', details: validation.error.flatten() }, { status: 400 });
    }
    
    const { content, references, styles } = validation.data;

    const { doc, historyEntry } = await buildDocx(content, references, styles);
    const buffer = await Packer.toBuffer(doc);

    // Pass historyEntry back to client to be saved in localStorage
    const responseBody = JSON.stringify({
        file: buffer.toString('base64'),
        historyEntry: historyEntry
    });

    return new NextResponse(responseBody, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error(err);
    const error = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: "Failed to generate document", details: error }, { status: 500 });
  }
}
