// One-off: moves paid project ZIPs out of the public bucket into a private one.
// Usage: node --env-file=.env.local scripts/move-paid-files-to-private-bucket.mjs [--dry-run]
import { createClient } from "@supabase/supabase-js"

const dryRun = process.argv.includes("--dry-run")
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const publicBucket = process.env.SUPABASE_PROJECTS_BUCKET || "projects"
const privateBucket = process.env.SUPABASE_PROJECT_FILES_BUCKET || "project-files"

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
if (bucketsError) throw bucketsError

const existing = buckets.find((b) => b.name === privateBucket)
if (existing?.public) {
  console.error(`Bucket "${privateBucket}" is public. Make it private first.`)
  process.exit(1)
}
if (!existing) {
  console.log(`Creating private bucket "${privateBucket}"`)
  if (!dryRun) {
    const { error } = await supabase.storage.createBucket(privateBucket, { public: false })
    if (error) throw error
  }
}

const { data: projects, error } = await supabase
  .from("projects")
  .select("id,title,download_file_path")
  .not("download_file_path", "is", null)
if (error) throw error

for (const project of projects) {
  const path = project.download_file_path
  const { data: alreadyMoved } = await supabase.storage.from(privateBucket).createSignedUrl(path, 10)
  if (alreadyMoved?.signedUrl) {
    console.log(`skip   ${project.title}: already private`)
    continue
  }

  const { data: file, error: downloadError } = await supabase.storage.from(publicBucket).download(path)
  if (downloadError || !file) {
    console.error(`FAIL   ${project.title}: cannot read ${publicBucket}/${path}`)
    continue
  }

  console.log(`move   ${project.title}: ${path} (${file.size} bytes)`)
  if (dryRun) continue

  const { error: uploadError } = await supabase.storage
    .from(privateBucket)
    .upload(path, file, { contentType: "application/zip", upsert: true })
  if (uploadError) {
    console.error(`FAIL   ${project.title}: upload failed: ${uploadError.message}`)
    continue
  }

  const { error: removeError } = await supabase.storage.from(publicBucket).remove([path])
  if (removeError) console.error(`WARN   ${project.title}: copied but not removed from public bucket: ${removeError.message}`)
}

console.log(dryRun ? "Dry run complete." : "Done.")
