"use client"

import { supabaseBrowser } from "@/lib/supabase/browser"
import { createUploadUrl } from "@/app/admin/_actions/uploads"
import type { UploadKind } from "./upload-kinds"

export interface UploadedFile {
  /** Public URL (null for private files such as paid ZIPs). */
  url: string | null
  path: string
  bucket: string
  name: string
}

// Asks the server for a signed upload URL, then sends the file straight to Supabase Storage.
export async function uploadFile(file: File, kind: UploadKind, scope?: string): Promise<UploadedFile> {
  const signed = await createUploadUrl({ kind, fileName: file.name, size: file.size, scope })
  if (!signed.ok) throw new Error(signed.error)

  const { bucket, path, token, publicUrl } = signed.data
  const { error } = await supabaseBrowser.storage.from(bucket).uploadToSignedUrl(path, token, file, {
    contentType: file.type || undefined,
  })
  if (error) throw new Error(`Upload failed: ${error.message}`)

  return { url: publicUrl, path, bucket, name: file.name }
}
