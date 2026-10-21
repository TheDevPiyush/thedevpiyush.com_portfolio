// One-off: converts legacy HTML posts (blog_posts.content) into Markdown (blog_posts.content_md).
// Run supabase/migrations/0003_blog.sql first.
// Usage: node --env-file=.env.local scripts/convert-blog-html-to-markdown.mjs [--write] [--force]
//   default   prints the Markdown for each post without saving
//   --write   saves content_md
//   --force   also re-converts posts that already have content_md
import { createClient } from "@supabase/supabase-js"
import TurndownService from "turndown"
import { gfm } from "turndown-plugin-gfm"

const write = process.argv.includes("--write")
const force = process.argv.includes("--force")
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "_",
  hr: "---",
})
turndown.use(gfm)
// Quill marks code blocks as <pre class="ql-syntax">; keep their text as a fenced block.
turndown.addRule("quillCode", {
  filter: (node) => node.nodeName === "PRE" && !node.querySelector("code"),
  replacement: (_content, node) => `\n\n\`\`\`\n${node.textContent.replace(/\n$/, "")}\n\`\`\`\n\n`,
})

function toMarkdown(post) {
  let html = post.content ?? ""
  // The post page already renders the title, so drop a leading <h1> that repeats it.
  html = html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>/i, "")
  return turndown
    .turndown(html)
    .replace(/ /g, " ")
    // "## 1\. Title": the escape only matters for list items, not headings.
    .replace(/^(#{1,6} \d+)\\\./gm, "$1.")
    // Lines left over from <br> are only whitespace.
    .replace(/\n[ \t]+(?=\n)/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

let query = supabase.from("blog_posts").select("id,title,url,content,content_md").not("content", "is", null)
if (!force) query = query.is("content_md", null)
const { data: posts, error } = await query
if (error) {
  if (error.message.includes("content_md")) console.error("content_md column missing: run 0003_blog.sql first.")
  throw error
}

if (!posts.length) {
  console.log("Nothing to convert.")
  process.exit(0)
}

for (const post of posts) {
  const markdown = toMarkdown(post)
  console.log(`\n=== ${post.title} (${post.url}) ===\n`)
  console.log(markdown)

  if (write) {
    const { error: updateError } = await supabase.from("blog_posts").update({ content_md: markdown }).eq("id", post.id)
    if (updateError) throw updateError
    console.log(`\n✓ saved`)
  }
}

console.log(write ? `\nConverted ${posts.length} post(s).` : `\nDry run: ${posts.length} post(s). Re-run with --write to save.`)
