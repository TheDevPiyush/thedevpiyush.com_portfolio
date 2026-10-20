import { supabaseServer } from "./server"

// Private bucket for paid ZIPs. Never served through public URLs.
export function getProjectFilesBucket() {
  return process.env.SUPABASE_PROJECT_FILES_BUCKET || "project-files"
}

// Legacy public bucket that also holds cover images, screenshots and older ZIPs.
export function getProjectsPublicBucket() {
  return process.env.SUPABASE_PROJECTS_BUCKET || "projects"
}

// Signs a paid file from the private bucket, falling back to the legacy public bucket
// for ZIPs uploaded before scripts/move-paid-files-to-private-bucket.mjs has run.
export async function createProjectFileSignedUrl(path: string, expiresInSeconds: number): Promise<string | null> {
  for (const bucket of [getProjectFilesBucket(), getProjectsPublicBucket()]) {
    const { data } = await supabaseServer.storage.from(bucket).createSignedUrl(path, expiresInSeconds)
    if (data?.signedUrl) return data.signedUrl
  }
  return null
}
