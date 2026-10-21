"use client"

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Search, X } from "lucide-react"
import { PostRow, type PostRowData } from "@/components/sections/writing-list"
import { cn } from "@/lib/utils"

export interface BrowsablePost extends PostRowData {
  tags: string[]
}

function matches(post: BrowsablePost, terms: string[]) {
  const haystack = `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase()
  return terms.every((term) => haystack.includes(term))
}

// Instant search and tag filter over every post. Press "/" to jump to the search box.
export function BlogBrowser({ posts, tags }: { posts: BrowsablePost[]; tags: string[] }) {
  const [query, setQuery] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const deferredQuery = useDeferredValue(query)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (event.key !== "/" || target.isContentEditable || /input|textarea|select/i.test(target.tagName)) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const results = useMemo(() => {
    const terms = deferredQuery.toLowerCase().split(/\s+/).filter(Boolean)
    return posts.filter((post) => (!activeTag || post.tags.includes(activeTag)) && matches(post, terms))
  }, [posts, deferredQuery, activeTag])

  const isFiltered = Boolean(query || activeTag)
  const clear = () => {
    setQuery("")
    setActiveTag(null)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <label className="relative block">
          <span className="sr-only">Search posts</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Escape" && setQuery("")}
            placeholder="Search posts"
            className="h-12 w-full rounded-full border bg-background pl-11 pr-12 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30 [&::-webkit-search-cancel-button]:hidden"
          />
          <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border px-1.5 font-mono text-[11px] text-muted-foreground sm:block">
            /
          </kbd>
        </label>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by tag">
            {tags.map((tag) => {
              const active = activeTag === tag
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveTag(active ? null : tag)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground" aria-live="polite">
        <span>
          {results.length} {results.length === 1 ? "post" : "posts"}
          {activeTag && <> · {activeTag}</>}
        </span>
        {isFiltered && (
          <button type="button" onClick={clear} className="inline-flex items-center gap-1 hover:text-foreground">
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <ul className="border-t">
        <AnimatePresence initial={false} mode="popLayout">
          {results.map((post) => (
            <motion.li
              key={post.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-b"
            >
              <PostRow post={post} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {results.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          Nothing matches that.{" "}
          <button type="button" onClick={clear} className="text-foreground underline underline-offset-4">
            Show all posts
          </button>
        </p>
      )}
    </div>
  )
}
