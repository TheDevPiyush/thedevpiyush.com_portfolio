// Upload rules shared by the admin UI (file pickers) and the server (signed upload URLs).

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "avif", "svg"]
const MB = 1024 * 1024

export const UPLOAD_KINDS = {
  "post-image": { label: "Image", folder: "posts", extensions: IMAGE_EXTENSIONS, maxBytes: 10 * MB, accept: "image/*" },
  avatar: { label: "Image", folder: "profile", extensions: IMAGE_EXTENSIONS, maxBytes: 10 * MB, accept: "image/*" },
  resume: { label: "Resume", folder: "resume", extensions: ["pdf"], maxBytes: 10 * MB, accept: "application/pdf" },
  "project-image": { label: "Image", folder: "images", extensions: IMAGE_EXTENSIONS, maxBytes: 10 * MB, accept: "image/*" },
  // Supabase's free plan caps a single file at 50 MB.
  "project-zip": { label: "Project file", folder: "files", extensions: ["zip"], maxBytes: 500 * MB, accept: ".zip,application/zip" },
  "setup-guide": { label: "Setup guide", folder: "setup-guide", extensions: ["md", "markdown"], maxBytes: 2 * MB, accept: ".md,.markdown,text/markdown" },
} as const

export type UploadKind = keyof typeof UPLOAD_KINDS
