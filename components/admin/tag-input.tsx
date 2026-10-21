"use client"

import { useId, useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  suggestions?: string[]
  id?: string
  className?: string
}

// Chips for text[] columns. Enter or comma adds; Backspace on an empty input removes the last one.
export function TagInput({ value, onChange, placeholder = "Add and press Enter", suggestions = [], id, className }: TagInputProps) {
  const [draft, setDraft] = useState("")
  const listId = useId()

  const add = (raw: string) => {
    const tag = raw.trim().replace(/,$/, "").trim()
    if (tag && !value.some((existing) => existing.toLowerCase() === tag.toLowerCase())) onChange([...value, tag])
    setDraft("")
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      add(draft)
    } else if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  const remaining = suggestions.filter((suggestion) => !value.includes(suggestion))

  return (
    <div
      className={cn(
        "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className,
      )}
    >
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-muted py-0.5 pl-2.5 pr-1 text-xs">
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((existing) => existing !== tag))}
            className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        list={remaining.length ? listId : undefined}
        onChange={(event) => {
          // Picking from the datalist fills the whole value at once.
          const next = event.target.value
          if (remaining.includes(next)) add(next)
          else setDraft(next)
        }}
        onKeyDown={onKeyDown}
        onBlur={() => draft && add(draft)}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 outline-none placeholder:text-muted-foreground"
      />
      {remaining.length > 0 && (
        <datalist id={listId}>
          {remaining.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      )}
    </div>
  )
}
