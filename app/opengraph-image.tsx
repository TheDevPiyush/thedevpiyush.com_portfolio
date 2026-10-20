import { ImageResponse } from "next/og"

export const alt = "Piyush Choudhary, full-stack developer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
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
          background: "#09090b",
          color: "#fafafa",
          backgroundImage:
            "radial-gradient(circle at 85% 0%, rgba(167,139,250,0.35), transparent 45%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 64px 64px, 64px 64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#a1a1aa" }}>
          <div style={{ width: 14, height: 14, borderRadius: 14, background: "#a78bfa" }} />
          thedevpiyush.com
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 120, fontFamily: "Georgia, serif", letterSpacing: -3, lineHeight: 0.95, display: "flex" }}>
            Piyush&nbsp;<span style={{ fontStyle: "italic", color: "#d4d4d8" }}>Choudhary</span>
          </div>
          <div style={{ fontSize: 36, color: "#a1a1aa" }}>Full-stack developer · Projects, writing & more</div>
        </div>
      </div>
    ),
    size,
  )
}
