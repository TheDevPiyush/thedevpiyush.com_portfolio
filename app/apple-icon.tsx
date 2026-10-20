import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          color: "#fafafa",
          fontSize: 120,
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
        }}
      >
        p
        <div style={{ width: 22, height: 22, borderRadius: 22, background: "#a78bfa", marginLeft: 6, marginTop: 52 }} />
      </div>
    ),
    size,
  )
}
