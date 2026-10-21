import { ImageResponse } from "next/og"
import { OG_BACKGROUND, OG_SIZE, loadOgFonts } from "@/lib/og"

export const alt = "Piyush Choudhary, full-stack developer"
export const size = OG_SIZE
export const contentType = "image/png"

const SITE = "thedevpiyush.com"
const TAGLINE = "Full-stack developer · Projects, writing & more"

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          fontFamily: "Hellix",
          ...OG_BACKGROUND,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#a1a1aa" }}>
          <div style={{ width: 14, height: 14, borderRadius: 14, background: "#a78bfa" }} />
          {SITE}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 120, letterSpacing: -4, lineHeight: 0.95, display: "flex" }}>
            Piyush&nbsp;<span style={{ color: "#a1a1aa" }}>Choudhary</span>
          </div>
          <div style={{ fontSize: 36, color: "#a1a1aa" }}>{TAGLINE}</div>
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  )
}
