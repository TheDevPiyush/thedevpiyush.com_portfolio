// Helpers for next/og share images.

export const OG_SIZE = { width: 1200, height: 630 }

export const OG_BACKGROUND = {
  background: "#09090b",
  color: "#fafafa",
  backgroundImage:
    "radial-gradient(circle at 85% 0%, rgba(167,139,250,0.35), transparent 45%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "100% 100%, 64px 64px, 64px 64px",
} as const

// Fetches a Google Font subset with only the glyphs in `text`. Returns null when offline so the
// image still renders with the default font.
async function loadGoogleFont(family: string, text: string, style = "") {
  try {
    const params = new URLSearchParams({ family: `${family}${style}`, text })
    const css = await (await fetch(`https://fonts.googleapis.com/css2?${params}`)).text()
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1]
    if (!src) return null
    const response = await fetch(src)
    return response.ok ? await response.arrayBuffer() : null
  } catch {
    return null
  }
}

type OgFont = { name: string; data: ArrayBuffer; style: "normal" | "italic"; weight: 400 }

/**
 * Instrument Serif (regular + italic) for `serifText` and Geist for `sansText`, subset to those glyphs.
 * Custom fonts replace next/og's default font, so this returns undefined unless every font loaded.
 */
export async function loadOgFonts(serifText: string, sansText: string): Promise<OgFont[] | undefined> {
  const [regular, italic, sans] = await Promise.all([
    loadGoogleFont("Instrument Serif", serifText),
    loadGoogleFont("Instrument Serif", serifText, ":ital@1"),
    loadGoogleFont("Geist", sansText),
  ])
  if (!regular || !italic || !sans) return undefined
  return [
    { name: "Instrument Serif", data: regular, style: "normal", weight: 400 },
    { name: "Instrument Serif", data: italic, style: "italic", weight: 400 },
    { name: "Geist", data: sans, style: "normal", weight: 400 },
  ]
}
