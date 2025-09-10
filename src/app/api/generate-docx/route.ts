
import { NextRequest, NextResponse } from 'next/server';
import { exportToDocx } from '@/lib/docx-exporter';
import { Packer } from 'docx';

export async function POST(req: NextRequest) {
  try {
    const { content, references, styles } = await req.json();

    if (!content || !references || !styles) {
      return NextResponse.json({ error: 'Missing required document data' }, { status: 400 });
    }

    const doc = await exportToDocx(content, references, styles);
    const buffer = await Packer.toBuffer(doc);

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    headers.set('Content-Disposition', 'attachment; filename="generated.docx"');
    
    return new NextResponse(buffer, { status: 200, headers });

  } catch (err) {
    console.error(err);
    const error = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: "Failed to generate document", details: error }, { status: 500 });
  }
}
