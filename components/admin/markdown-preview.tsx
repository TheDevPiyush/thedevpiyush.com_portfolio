"use client"

import { memo } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import { PROSE } from "@/components/blog/prose"
import { cn } from "@/lib/utils"

// Live preview while editing. Same Markdown features and typography as the site, without the
// server-side code highlighting (use "Preview" for the exact rendering).
export const MarkdownPreview = memo(function MarkdownPreview({ markdown, className }: { markdown: string; className?: string }) {
  if (!markdown.trim()) {
    return <p className={cn("text-sm text-muted-foreground", className)}>Nothing to preview yet.</p>
  }
  return (
    <div className={cn(PROSE, "prose-base sm:prose-lg", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          h1: ({ node: _node, ...props }) => <h2 {...props} />,
          // eslint-disable-next-line @next/next/no-img-element -- preview of any host
          img: ({ node: _node, alt = "", ...props }) => <img alt={alt} {...props} />,
          a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        }}
      >
        {markdown}
      </Markdown>
    </div>
  )
})
