import "server-only"
import GithubSlugger from "github-slugger"
import { toString } from "mdast-util-to-string"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import { unified } from "unified"
import { visit } from "unist-util-visit"
import type { Heading } from "mdast"
import type { PluggableList } from "unified"

export interface TocHeading {
  id: string
  text: string
  depth: 2 | 3
}

// Same ids rehype-slug gives the rendered headings: one slugger per document, every heading in order.
export function extractHeadings(markdown: string): TocHeading[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown)
  const slugger = new GithubSlugger()
  const headings: TocHeading[] = []

  visit(tree, "heading", (node: Heading) => {
    const text = toString(node, { includeImageAlt: false }).trim()
    const id = slugger.slug(text)
    // Post bodies render h1 as h2 (the page title is the only h1).
    if (node.depth <= 3 && text) headings.push({ id, text, depth: node.depth === 3 ? 3 : 2 })
  })

  return headings
}

const prettyCode: PrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark-dimmed" },
  keepBackground: false,
  defaultLang: { block: "plaintext" },
}

export const remarkPlugins: PluggableList = [remarkGfm]

export const rehypePlugins: PluggableList = [
  rehypeSlug,
  [rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["heading-anchor"] } }],
  [rehypePrettyCode, prettyCode],
]
