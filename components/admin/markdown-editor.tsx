"use client"

import { useMemo, useRef } from "react"
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror"
import { EditorView, keymap } from "@codemirror/view"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { tags } from "@lezer/highlight"
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  SquareCode,
} from "lucide-react"
import { toast } from "sonner"
import { uploadFile } from "@/lib/admin/upload-client"
import { cn } from "@/lib/utils"

// Markdown source editor for posts. Styled from the site's CSS variables so it follows light/dark.

const theme = EditorView.theme({
  "&": { backgroundColor: "transparent", color: "hsl(var(--foreground))", fontSize: "15px", height: "100%" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: "var(--font-mono), ui-monospace, monospace", lineHeight: "1.75" },
  ".cm-content": { padding: "20px 0", caretColor: "hsl(var(--brand))" },
  ".cm-line": { padding: "0 20px" },
  ".cm-cursor": { borderLeftColor: "hsl(var(--brand))", borderLeftWidth: "2px" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
    backgroundColor: "hsl(var(--brand) / 0.18) !important",
  },
  ".cm-activeLine": { backgroundColor: "hsl(var(--muted) / 0.5)" },
  ".cm-placeholder": { color: "hsl(var(--muted-foreground))" },
})

const highlight = HighlightStyle.define([
  { tag: tags.heading1, fontWeight: "700", fontSize: "1.25em" },
  { tag: tags.heading2, fontWeight: "700", fontSize: "1.15em" },
  { tag: [tags.heading3, tags.heading4, tags.heading5, tags.heading6], fontWeight: "700" },
  { tag: tags.strong, fontWeight: "700" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: [tags.link, tags.url], color: "hsl(var(--brand))" },
  { tag: tags.monospace, color: "hsl(var(--muted-foreground))" },
  { tag: tags.quote, color: "hsl(var(--muted-foreground))", fontStyle: "italic" },
  { tag: [tags.processingInstruction, tags.contentSeparator, tags.list], color: "hsl(var(--muted-foreground))" },
])

// ---------- Editing helpers ----------

function wrap(view: EditorView, before: string, after = before, placeholder = "text") {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to) || placeholder
  view.dispatch({
    changes: { from, to, insert: `${before}${selected}${after}` },
    selection: { anchor: from + before.length, head: from + before.length + selected.length },
  })
  view.focus()
  return true
}

function prefixLines(view: EditorView, prefix: string | ((index: number) => string)) {
  const { from, to } = view.state.selection.main
  const startLine = view.state.doc.lineAt(from)
  const endLine = view.state.doc.lineAt(to)
  const changes = []
  for (let number = startLine.number, index = 0; number <= endLine.number; number++, index++) {
    const line = view.state.doc.line(number)
    changes.push({ from: line.from, insert: typeof prefix === "function" ? prefix(index) : prefix })
  }
  view.dispatch({ changes })
  view.focus()
  return true
}

function insertBlock(view: EditorView, text: string, cursorOffset = text.length) {
  const { from, to } = view.state.selection.main
  const line = view.state.doc.lineAt(from)
  const needsBreak = line.text.trim().length > 0 && from === line.to
  const insert = `${needsBreak ? "\n\n" : ""}${text}`
  view.dispatch({ changes: { from, to, insert }, selection: { anchor: from + (needsBreak ? 2 : 0) + cursorOffset } })
  view.focus()
  return true
}

function insertLink(view: EditorView) {
  const { from, to } = view.state.selection.main
  const text = view.state.sliceDoc(from, to) || "link text"
  const insert = `[${text}](https://)`
  // Select the URL so it can be typed over.
  view.dispatch({ changes: { from, to, insert }, selection: { anchor: from + text.length + 3, head: from + insert.length - 1 } })
  view.focus()
  return true
}

// Uploads images to Storage, showing a placeholder in the text until each one is done.
async function insertImages(view: EditorView, files: File[], position?: number) {
  for (const file of files.filter((candidate) => candidate.type.startsWith("image/"))) {
    const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")
    const placeholder = `![Uploading ${file.name}…]()`
    const at = position ?? view.state.selection.main.head
    view.dispatch({ changes: { from: at, insert: `${placeholder}\n` } })
    try {
      const uploaded = await uploadFile(file, "post-image")
      const doc = view.state.doc.toString()
      const index = doc.indexOf(placeholder)
      if (index !== -1) view.dispatch({ changes: { from: index, to: index + placeholder.length, insert: `![${alt}](${uploaded.url})` } })
    } catch (error) {
      const index = view.state.doc.toString().indexOf(placeholder)
      if (index !== -1) view.dispatch({ changes: { from: index, to: index + placeholder.length + 1, insert: "" } })
      toast.error(error instanceof Error ? error.message : "Image upload failed")
    }
  }
}

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function MarkdownEditor({ value, onChange, className }: MarkdownEditorProps) {
  const ref = useRef<ReactCodeMirrorRef>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const extensions = useMemo(
    () => [
      markdown({ base: markdownLanguage }),
      syntaxHighlighting(highlight),
      theme,
      EditorView.lineWrapping,
      keymap.of([
        { key: "Mod-b", run: (view) => wrap(view, "**") },
        { key: "Mod-i", run: (view) => wrap(view, "_") },
        { key: "Mod-k", run: insertLink },
        { key: "Mod-e", run: (view) => wrap(view, "`", "`", "code") },
      ]),
      EditorView.domEventHandlers({
        paste(event, view) {
          const files = Array.from(event.clipboardData?.files ?? [])
          if (!files.some((file) => file.type.startsWith("image/"))) return false
          event.preventDefault()
          void insertImages(view, files)
          return true
        },
        drop(event, view) {
          const files = Array.from(event.dataTransfer?.files ?? [])
          if (!files.some((file) => file.type.startsWith("image/"))) return false
          event.preventDefault()
          const position = view.posAtCoords({ x: event.clientX, y: event.clientY }) ?? undefined
          void insertImages(view, files, position)
          return true
        },
      }),
    ],
    [],
  )

  const act = (run: (view: EditorView) => unknown) => () => {
    const view = ref.current?.view
    if (view) run(view)
  }

  const tools = [
    { label: "Heading", icon: Heading2, run: act((view) => prefixLines(view, "## ")) },
    { label: "Subheading", icon: Heading3, run: act((view) => prefixLines(view, "### ")) },
    { label: "Bold (⌘B)", icon: Bold, run: act((view) => wrap(view, "**")) },
    { label: "Italic (⌘I)", icon: Italic, run: act((view) => wrap(view, "_")) },
    { label: "Link (⌘K)", icon: Link2, run: act(insertLink) },
    { label: "Inline code (⌘E)", icon: Code, run: act((view) => wrap(view, "`", "`", "code")) },
    { label: "Code block", icon: SquareCode, run: act((view) => insertBlock(view, "```ts\n\n```\n", 6)) },
    { label: "Quote", icon: Quote, run: act((view) => prefixLines(view, "> ")) },
    { label: "Bulleted list", icon: List, run: act((view) => prefixLines(view, "- ")) },
    { label: "Numbered list", icon: ListOrdered, run: act((view) => prefixLines(view, (index) => `${index + 1}. `)) },
    { label: "Divider", icon: Minus, run: act((view) => insertBlock(view, "---\n\n")) },
    { label: "Image", icon: ImagePlus, run: () => fileInput.current?.click() },
  ]

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5" role="toolbar" aria-label="Formatting">
        {tools.map((tool) => (
          <button
            key={tool.label}
            type="button"
            onClick={tool.run}
            title={tool.label}
            aria-label={tool.label}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <tool.icon className="h-4 w-4" />
          </button>
        ))}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            const files = Array.from(event.target.files ?? [])
            event.target.value = ""
            const view = ref.current?.view
            if (view && files.length) void insertImages(view, files)
          }}
        />
      </div>
      <CodeMirror
        ref={ref}
        value={value}
        onChange={onChange}
        extensions={extensions}
        theme="none"
        placeholder="Write your post in Markdown… Paste or drop images to upload them."
        basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLineGutter: false, autocompletion: false }}
        className="min-h-0 flex-1 overflow-auto"
        height="100%"
      />
    </div>
  )
}
