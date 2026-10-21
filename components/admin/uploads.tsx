"use client"

import { useRef, useState, type DragEvent, type ReactNode } from "react"
import { FileArchive, FileText, ImagePlus, Link2, Loader2, Trash2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SortableList } from "./sortable-list"
import { uploadFile } from "@/lib/admin/upload-client"
import { UPLOAD_KINDS, type UploadKind } from "@/lib/admin/upload-kinds"
import { cn } from "@/lib/utils"

function useUploader(kind: UploadKind, scope?: string) {
  const [busy, setBusy] = useState(false)
  const upload = async (files: File[]) => {
    setBusy(true)
    try {
      const uploaded = []
      for (const file of files) uploaded.push(await uploadFile(file, kind, scope))
      return uploaded
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
      return []
    } finally {
      setBusy(false)
    }
  }
  return { busy, upload }
}

function DropZone({
  accept,
  multiple,
  disabled,
  onFiles,
  className,
  children,
}: {
  accept: string
  multiple?: boolean
  disabled?: boolean
  onFiles: (files: File[]) => void
  className?: string
  children: ReactNode
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    if (disabled) return
    const files = Array.from(event.dataTransfer.files)
    if (files.length) onFiles(multiple ? files : files.slice(0, 1))
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none",
        dragging && "border-brand bg-brand/5 text-foreground",
        className,
      )}
    >
      {children}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          event.target.value = ""
          if (files.length) onFiles(files)
        }}
      />
    </button>
  )
}

/** One public image (cover, avatar). Stores its public URL; a URL can also be pasted. */
export function ImageUpload({
  value,
  onChange,
  kind,
  scope,
  className,
  aspect = "aspect-[16/9]",
}: {
  value: string
  onChange: (url: string) => void
  kind: UploadKind
  scope?: string
  className?: string
  aspect?: string
}) {
  const { busy, upload } = useUploader(kind, scope)
  const [pasting, setPasting] = useState(false)

  const onFiles = async (files: File[]) => {
    const [file] = await upload(files)
    if (file?.url) onChange(file.url)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className={cn("group relative overflow-hidden rounded-xl border bg-muted", aspect)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of any host */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 opacity-0 backdrop-blur-sm transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <DropZone accept={UPLOAD_KINDS[kind].accept} onFiles={onFiles} disabled={busy} className="h-9 border-solid bg-background px-3">
              <span className="flex items-center gap-2">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Replace
              </span>
            </DropZone>
            <Button type="button" size="sm" variant="outline" onClick={() => onChange("")}>
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <DropZone accept={UPLOAD_KINDS[kind].accept} onFiles={onFiles} disabled={busy} className={cn("w-full", aspect)}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          <span>{busy ? "Uploading…" : "Drop an image or click to upload"}</span>
        </DropZone>
      )}

      {pasting ? (
        <div className="flex gap-2">
          <Input
            autoFocus
            placeholder="https://…"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                onChange(event.currentTarget.value.trim())
                setPasting(false)
              }
              if (event.key === "Escape") setPasting(false)
            }}
          />
          <Button type="button" size="icon" variant="ghost" onClick={() => setPasting(false)} aria-label="Cancel">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPasting(true)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Link2 className="h-3 w-3" /> Use an image URL instead
        </button>
      )}
    </div>
  )
}

/** One file referenced by its storage path (paid ZIP, setup guide, resume). */
export function FileUpload({
  value,
  onChange,
  kind,
  scope,
  useUrl,
}: {
  value: string
  onChange: (value: string) => void
  kind: UploadKind
  scope?: string
  /** Store the public URL instead of the storage path. */
  useUrl?: boolean
}) {
  const { busy, upload } = useUploader(kind, scope)
  const Icon = kind === "project-zip" ? FileArchive : FileText
  const name = value ? decodeURIComponent(value.split("/").pop() ?? value).replace(/^\d+-[a-f0-9]{6}-/, "") : null

  const onFiles = async (files: File[]) => {
    const [file] = await upload(files)
    if (file) onChange(useUrl ? (file.url ?? "") : file.path)
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{busy ? "Uploading…" : (name ?? "No file yet")}</p>
        <p className="text-xs text-muted-foreground">
          {UPLOAD_KINDS[kind].extensions.map((ext) => `.${ext}`).join(", ")} · up to {UPLOAD_KINDS[kind].maxBytes / 1024 / 1024} MB
        </p>
      </div>
      <DropZone accept={UPLOAD_KINDS[kind].accept} onFiles={onFiles} disabled={busy} className="h-9 shrink-0 border-solid px-3">
        <span className="flex items-center gap-2">
          <Upload className="h-4 w-4" /> {value ? "Replace" : "Upload"}
        </span>
      </DropZone>
      {value && (
        <Button type="button" size="icon" variant="ghost" onClick={() => onChange("")} aria-label="Remove file">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

/** Ordered image gallery (project screenshots): upload several, drag to reorder, remove. */
export function GalleryUpload({
  value,
  onChange,
  kind,
  scope,
  max = 12,
}: {
  value: string[]
  onChange: (urls: string[]) => void
  kind: UploadKind
  scope?: string
  max?: number
}) {
  const { busy, upload } = useUploader(kind, scope)

  const onFiles = async (files: File[]) => {
    const room = max - value.length
    if (files.length > room) toast(`Only the first ${room} image${room === 1 ? "" : "s"} will be added (max ${max}).`)
    const uploaded = await upload(files.slice(0, room))
    const urls = uploaded.map((file) => file.url).filter((url): url is string => Boolean(url))
    if (urls.length) onChange([...value, ...urls])
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <SortableList
          items={value}
          getId={(url) => url}
          onReorder={onChange}
          layout="grid"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          renderItem={(url, handle) => (
            <div className="group relative aspect-video overflow-hidden rounded-xl border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of any host */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-1.5 top-1.5 flex justify-between">
                <span className="rounded bg-background/80 backdrop-blur">{handle}</span>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((existing) => existing !== url))}
                  className="rounded bg-background/80 p-1 text-muted-foreground backdrop-blur hover:text-destructive"
                  aria-label="Remove screenshot"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        />
      )}
      {value.length < max && (
        <DropZone accept={UPLOAD_KINDS[kind].accept} multiple onFiles={onFiles} disabled={busy} className="h-24 w-full">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          <span>{busy ? "Uploading…" : "Drop screenshots or click to add"}</span>
        </DropZone>
      )}
    </div>
  )
}
