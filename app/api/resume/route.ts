import { NextResponse } from "next/server";

export async function GET() {
  const googleDocUrl = `https://docs.google.com/document/d/1Cij4dF4ypgcdA3MEenqk1BkI3_nM2hqJ5uHoEm0bzqk/export?format=pdf&t=${Date.now()}`;

  const response = await fetch(googleDocUrl, {
    cache: "no-store",
  });

  const blob = await response.blob();
  const buffer = Buffer.from(await blob.arrayBuffer());

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Piyush_Choudhary_Resume.pdf"',
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
