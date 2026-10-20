"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Check, Copy } from "lucide-react"

export function SetupGuideMarkdown({ markdown }: { markdown: string }) {
  return (
    <article className="prose prose-sm max-w-none dark:prose-invert sm:prose-base prose-headings:tracking-tight prose-a:text-brand prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: MarkdownCode }}>
        {markdown}
      </ReactMarkdown>
    </article>
  )
}

function MarkdownCode({ className, children, ...rest }: React.ComponentProps<"code">) {
  const language = /language-(\w+)/.exec(className || "")?.[1]
  if (!language) {
    return (
      <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em] before:content-none after:content-none" {...rest}>
        {children}
      </code>
    )
  }
  return <CodeBlock language={language} code={String(children).replace(/\n$/, "")} />
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <span className="not-prose my-4 block overflow-hidden rounded-xl border">
      <span className="flex items-center justify-between border-b bg-muted/60 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {language}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 normal-case tracking-normal transition-colors hover:text-foreground"
          onClick={async () => {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </span>
      <code className="block overflow-x-auto whitespace-pre bg-card p-4 font-mono text-[13px] leading-relaxed">{code}</code>
    </span>
  )
}
