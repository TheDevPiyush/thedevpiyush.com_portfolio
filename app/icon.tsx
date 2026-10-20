import { ImageResponse } from "next/og"

export const size = { width: 64, height: 64 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          background: "#09090b",
          color: "#fafafa",
          fontSize: 44,
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
        }}
      >
        p
        <div style={{ width: 9, height: 9, borderRadius: 9, background: "#a78bfa", marginLeft: 2, marginTop: 18 }} />
      </div>
    ),
    size,
  )
}
