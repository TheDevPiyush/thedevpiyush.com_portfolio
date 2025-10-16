import { NextResponse } from 'next/server';

const GOOGLE_DOC_PDF_URL = 'https://docs.google.com/document/d/1Cij4dF4ypgcdA3MEenqk1BkI3_nM2hqJ5uHoEm0bzqk/export?format=pdf';

export async function GET() {
  try {
    const res = await fetch(GOOGLE_DOC_PDF_URL);

    if (!res.ok) {
      throw new Error('Failed to fetch the latest resume PDF');
    }

    const blob = await res.blob();

    return new Response(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Piyush_Choudhary_Resume.pdf"',
        // optional: cache for 1 hour
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Resume download failed:', err);
    return NextResponse.json({ error: 'Could not fetch resume' }, { status: 500 });
  }
}
