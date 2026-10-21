import Link from "next/link"
import { MarkdownAsync, type Components } from "react-markdown"
import { rehypePlugins, remarkPlugins } from "@/lib/blog/markdown"
import { sanitizeBlogHtml } from "@/lib/sanitize"
import { cn } from "@/lib/utils"
import { CodeBlock } from "./code-block"
import { PROSE } from "./prose"

// react-markdown passes the hast node to every component; it must not reach the DOM.
const components: Components = {
  // The page title is the post's only h1.
  h1: ({ node: _node, ...props }) => <h2 {...props} />,
  a: ({ node: _node, href = "", ...props }) => {
    if (href.startsWith("/")) return <Link href={href} {...props} />
    if (href.startsWith("#")) return <a href={href} {...props} />
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
  },
  pre: ({ node: _node, ...props }) => (
    <CodeBlock language={(props as Record<string, unknown>)["data-language"] as string | undefined}>
      <pre {...props} />
    </CodeBlock>
  ),
  // eslint-disable-next-line @next/next/no-img-element -- post images come from any host with unknown sizes
  img: ({ node: _node, alt = "", ...props }) => <img alt={alt} loading="lazy" decoding="async" {...props} />,
  table: ({ node: _node, ...props }) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
}

// Markdown is rendered on the server; raw HTML in it is ignored (no rehype-raw) and unsafe URLs are dropped.
export async function PostBody({ markdown, html, className }: { markdown: string | null; html: string | null; className?: string }) {
  if (!markdown) {
    return <div className={cn(PROSE, className)} dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(html ?? "") }} />
  }

  const content = await MarkdownAsync({ children: markdown, remarkPlugins, rehypePlugins, components })
  return <div className={cn(PROSE, className)}>{content}</div>
}
