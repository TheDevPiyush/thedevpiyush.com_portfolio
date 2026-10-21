import { readFile } from "fs/promises"
import { join } from "path"

// Helpers for next/og share images.

export const OG_SIZE = { width: 1200, height: 630 }

export const OG_BACKGROUND = {
  background: "#09090b",
  color: "#fafafa",
  backgroundImage:
    "radial-gradient(circle at 85% 0%, rgba(167,139,250,0.35), transparent 45%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "100% 100%, 64px 64px, 64px 64px",
} as const

type OgFont = { name: string; data: ArrayBuffer; style: "normal"; weight: 400 }

let hellix: Promise<ArrayBuffer> | null = null

/** Hellix, the site's typeface, read from the repo. Replaces next/og's default font. */
export async function loadOgFonts(): Promise<OgFont[]> {
  hellix ??= readFile(join(process.cwd(), "public/fonts/Hellix-Regular.ttf")).then((buffer) =>
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer,
  )
  return [{ name: "Hellix", data: await hellix, style: "normal", weight: 400 }]
}
