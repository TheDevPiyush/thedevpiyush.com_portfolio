import { ImageResponse } from "next/og"
import { getPost } from "@/lib/blog/posts"
import { formatDate } from "@/lib/formatters/date"
import { OG_BACKGROUND, OG_SIZE, loadOgFonts } from "@/lib/og"

export const alt = "Blog post by Piyush Choudhary"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function PostOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = (await getPost(slug))?.post
  const title = post?.title ?? "Writing"
  const meta = post ? `${formatDate(post.publishDate)} · ${post.readTime}` : ""
  const tags = post?.tags.slice(0, 3) ?? []
  const titleSize = title.length > 70 ? 64 : title.length > 40 ? 80 : 96
  const label = "thedevpiyush.com / writing"

  return new ImageResponse(
    (
      <div
        style={{
          ...OG_BACKGROUND,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          fontFamily: "Hellix",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#a1a1aa" }}>
          <div style={{ width: 14, height: 14, borderRadius: 14, background: "#a78bfa" }} />
          {label}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            lineHeight: 1.02,
            letterSpacing: -2,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 26, color: "#a1a1aa" }}>
          <div style={{ display: "flex" }}>{meta}</div>
          <div style={{ display: "flex", gap: 12 }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{ display: "flex", border: "1px solid #3f3f46", borderRadius: 999, padding: "6px 18px", fontSize: 22 }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  )
}
