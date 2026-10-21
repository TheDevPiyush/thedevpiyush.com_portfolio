import "server-only"
import crypto from "crypto"
import { supabaseServer } from "@/lib/supabase/server"
import { getProjectFilesBucket, getProjectsPublicBucket } from "@/lib/supabase/storage"
import { ActionError } from "./action"
import { UPLOAD_KINDS, type UploadKind } from "./upload-kinds"

export function getMediaBucket() {
  return process.env.SUPABASE_MEDIA_BUCKET || "media"
}

function getSetupGuidesBucket() {
  return process.env.SUPABASE_PROJECTS_SETUP_GUIDES_BUCKET || getProjectsPublicBucket()
}

// Where each kind of upload lives. Paid ZIPs go to the private bucket; everything else is public.
function bucketFor(kind: UploadKind) {
  switch (kind) {
    case "project-zip":
      return getProjectFilesBucket()
    case "setup-guide":
      return getSetupGuidesBucket()
    case "project-image":
      return getProjectsPublicBucket()
    default:
      return getMediaBucket()
  }
}

function safeFileName(name: string) {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9_.-]+/g, "-").replace(/-+/g, "-")
  return cleaned.slice(-80) || "file"
}

export interface SignedUpload {
  bucket: string
  path: string
  token: string
  /** Set for public buckets; private files are referenced by path. */
  publicUrl: string | null
}

// The browser uploads straight to Storage with this token, so large files never pass through
// a serverless function (Vercel caps request bodies at 4.5 MB).
export async function createSignedUpload(kind: UploadKind, fileName: string, size: number, scope?: string): Promise<SignedUpload> {
  const rules = UPLOAD_KINDS[kind]
  const extension = fileName.split(".").pop()?.toLowerCase() ?? ""
  if (!(rules.extensions as readonly string[]).includes(extension)) {
    throw new ActionError(`${rules.label} must be one of: ${rules.extensions.map((ext) => `.${ext}`).join(", ")}`)
  }
  if (size > rules.maxBytes) {
    throw new ActionError(`${rules.label} must be under ${Math.round(rules.maxBytes / 1024 / 1024)} MB`)
  }

  const bucket = bucketFor(kind)
  const folder = scope?.replace(/[^a-zA-Z0-9-]/g, "") || rules.folder
  const path = `${folder}/${rules.folder === folder ? "" : `${rules.folder}/`}${Date.now()}-${crypto.randomBytes(3).toString("hex")}-${safeFileName(fileName)}`

  const { data, error } = await supabaseServer.storage.from(bucket).createSignedUploadUrl(path)
  if (error || !data) throw new ActionError(`Couldn't start the upload: ${error?.message ?? "unknown error"}`)

  const publicUrl = kind === "project-zip" ? null : supabaseServer.storage.from(bucket).getPublicUrl(path).data.publicUrl
  return { bucket, path, token: data.token, publicUrl }
}

// Maps a public Storage URL from this project back to its bucket and path.
export function parseStorageUrl(url: string): { bucket: string; path: string } | null {
  const base = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base || !url.startsWith(base)) return null
  const match = url.slice(base.length).match(/^\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
  return match ? { bucket: match[1], path: decodeURIComponent(match[2]) } : null
}

/** Best-effort cleanup of replaced files. Never throws: a stray file is better than a failed save. */
export async function removeStoredFiles(files: ({ bucket: string; path: string } | null | undefined)[]) {
  const byBucket = new Map<string, string[]>()
  for (const file of files) {
    if (!file) continue
    byBucket.set(file.bucket, [...(byBucket.get(file.bucket) ?? []), file.path])
  }
  await Promise.all(
    [...byBucket].map(async ([bucket, paths]) => {
      const { error } = await supabaseServer.storage.from(bucket).remove(paths)
      if (error) console.warn(`Couldn't remove ${paths.length} file(s) from ${bucket}:`, error.message)
    }),
  )
}

export function removePublicUrls(urls: (string | null | undefined)[]) {
  return removeStoredFiles(urls.map((url) => (url ? parseStorageUrl(url) : null)))
}

export function projectFileRef(path: string | null | undefined) {
  return path ? { bucket: getProjectFilesBucket(), path } : null
}

export function setupGuideRef(path: string | null | undefined) {
  return path ? { bucket: getSetupGuidesBucket(), path } : null
}
