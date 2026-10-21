"use client"

import { useRef, useState, type ReactNode } from "react"
import { Check, Copy } from "lucide-react"

// Wraps a highlighted <pre> with a language label and a copy button.
export function CodeBlock({ language, children }: { language?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const text = ref.current?.querySelector("code")?.textContent ?? ""
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked (insecure context, permissions); nothing useful to show.
    }
  }

  return (
    <div ref={ref} className="group/code relative">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
        {language && language !== "plaintext" && (
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-opacity group-hover/code:opacity-0">
            {language}
          </span>
        )}
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="absolute right-0 grid h-7 w-7 place-items-center rounded-md border bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/code:opacity-100"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      {children}
    </div>
  )
}
