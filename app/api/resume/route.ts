import { NextResponse } from "next/server";

export async function GET() {
  const googleDocUrl =
    "https://docs.google.com/document/d/1Cij4dF4ypgcdA3MEenqk1BkI3_nM2hqJ5uHoEm0bzqk/export?format=pdf";

  const res = await fetch(googleDocUrl, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();

  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Piyush_Choudhary_Resume.pdf"',
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
