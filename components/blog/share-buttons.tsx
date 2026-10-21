"use client"

import { useEffect, useState } from "react"
import { Check, Link2, Share2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function XIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}

const itemClass =
  "grid h-9 w-9 place-items-center rounded-full border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"

export function ShareButtons({ url, title, className }: { url: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => setCanShare(typeof navigator.share === "function"), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link copied")
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Couldn't copy the link")
    }
  }

  const share = () => navigator.share({ title, url }).catch(() => {})
  const encodedUrl = encodeURIComponent(url)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button type="button" onClick={copy} className={itemClass} aria-label="Copy link">
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </button>
      <a
        href={`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClass}
        aria-label="Share on X"
      >
        <XIcon className="h-3.5 w-3.5" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClass}
        aria-label="Share on LinkedIn"
      >
        <LinkedInIcon className="h-3.5 w-3.5" />
      </a>
      {canShare && (
        <button type="button" onClick={share} className={itemClass} aria-label="Share">
          <Share2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
