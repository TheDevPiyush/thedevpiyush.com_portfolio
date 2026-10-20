import { NextRequest, NextResponse } from "next/server"

const GOOGLE_DOC_EXPORT = "https://docs.google.com/document/d/1Cij4dF4ypgcdA3MEenqk1BkI3_nM2hqJ5uHoEm0bzqk/export?format=pdf"

// Serves the resume PDF inline (for the /resume viewer) or as a download with ?download=1.
// The source is RESUME_PDF_URL when set, otherwise the Google Doc export. Fetched at most once an hour.
export async function GET(request: NextRequest) {
  const source = process.env.RESUME_PDF_URL || GOOGLE_DOC_EXPORT
  const response = await fetch(source, { next: { revalidate: 3600 } })

  if (!response.ok) {
    return NextResponse.json({ error: "Resume is unavailable right now" }, { status: 502 })
  }

  const disposition = request.nextUrl.searchParams.has("download") ? "attachment" : "inline"
  return new NextResponse(await response.arrayBuffer(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="Piyush_Choudhary_Resume.pdf"`,
    },
  })
}
