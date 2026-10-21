"use server"

import { z } from "zod"
import { adminAction, parse } from "@/lib/admin/action"
import { createSignedUpload } from "@/lib/admin/storage"
import { UPLOAD_KINDS, type UploadKind } from "@/lib/admin/upload-kinds"

const schema = z.object({
  kind: z.enum(Object.keys(UPLOAD_KINDS) as [UploadKind, ...UploadKind[]]),
  fileName: z.string().min(1).max(300),
  size: z.number().int().positive(),
  scope: z.string().max(64).optional(),
})

export async function createUploadUrl(input: z.input<typeof schema>) {
  return adminAction(async () => {
    const { kind, fileName, size, scope } = parse(schema, input)
    return createSignedUpload(kind, fileName, size, scope)
  })
}
