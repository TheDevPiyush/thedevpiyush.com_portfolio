import { getPosts } from "@/lib/blog/posts"
import { AUTHOR, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site"

export const dynamic = "force-static"
export const revalidate = 300

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`)
}

export async function GET() {
  const posts = await getPosts()
  const feedUrl = absoluteUrl("/rss.xml")

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`)
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.seoDescription ?? post.excerpt)}</description>
      <pubDate>${new Date(post.publishDate).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(AUTHOR)}</dc:creator>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`${AUTHOR} · Writing`)}</title>
    <link>${SITE_URL}/blog</link>
    <description>Notes and essays on web development, backend engineering and building software, by ${escapeXml(AUTHOR)}.</description>
    <language>en-us</language>
    <generator>${SITE_NAME}</generator>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${posts[0] ? `    <lastBuildDate>${new Date(posts[0].publishDate).toUTCString()}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } })
}
