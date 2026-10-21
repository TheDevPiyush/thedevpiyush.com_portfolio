"use client"

import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/** Ordered list of short sentences (project features). */
export function ListEditor({
  value,
  onChange,
  placeholder,
  addLabel = "Add item",
}: {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  addLabel?: string
}) {
  const update = (index: number, text: string) => onChange(value.map((item, i) => (i === index ? text : item)))

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={item}
            placeholder={placeholder}
            onChange={(event) => update(index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                onChange([...value.slice(0, index + 1), "", ...value.slice(index + 1)])
              }
            }}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange(value.filter((_, i) => i !== index))} aria-label="Remove">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => onChange([...value, ""])}>
        <Plus /> {addLabel}
      </Button>
    </div>
  )
}

/** Label/value pairs (project stats such as "Users: 2k"). */
export function KeyValueEditor({
  value,
  onChange,
}: {
  value: { key: string; value: string }[]
  onChange: (value: { key: string; value: string }[]) => void
}) {
  const update = (index: number, patch: Partial<{ key: string; value: string }>) =>
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <Input value={item.key} placeholder="Label, e.g. Users" onChange={(event) => update(index, { key: event.target.value })} />
          <Input value={item.value} placeholder="Value, e.g. 2k+" onChange={(event) => update(index, { value: event.target.value })} />
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange(value.filter((_, i) => i !== index))} aria-label="Remove">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => onChange([...value, { key: "", value: "" }])}>
        <Plus /> Add stat
      </Button>
    </div>
  )
}
