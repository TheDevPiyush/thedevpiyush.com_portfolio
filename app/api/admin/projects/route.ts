import { NextRequest, NextResponse } from "next/server"
import { ensureAdmin, getUserIdFromAuthHeader } from "@/lib/auth/server-auth"
import { supabaseServer } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

function toBoolean(value: FormDataEntryValue | null): boolean {
  return value === "true" || value === "1" || value === "on"
}

async function ensureAdminFromRequest(request: NextRequest) {
  const userId = getUserIdFromAuthHeader(request.headers.get("authorization"))
  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const isAdmin = await ensureAdmin(userId)
  if (!isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { error: null }
}

function parseStringArrayField(value: FormDataEntryValue | null): string[] {
  const parsed = JSON.parse(String(value || "[]"))
  if (!Array.isArray(parsed)) return []
  return parsed.map((item) => String(item).trim()).filter(Boolean)
}

async function uploadFileAndGetPublicUrl(params: {
  bucket: string
  projectId: string
  folder: string
  file: File
  timestamp: number
  contentType: string
}) {
  const { bucket, projectId, folder, file, timestamp, contentType } = params
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")
  const storagePath = `${projectId}/${folder}/${timestamp}-${sanitizedName}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseServer.storage
    .from(bucket)
    .upload(storagePath, buffer, { contentType, upsert: false })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabaseServer.storage.from(bucket).getPublicUrl(storagePath)
  return { storagePath, publicUrl: data.publicUrl }
}

async function uploadZipFile(bucket: string, projectId: string, zipFile: File, timestamp: number) {
  const sanitizedName = zipFile.name.replace(/[^a-zA-Z0-9_.-]/g, "_")
  const storagePath = `${projectId}/${timestamp}-${sanitizedName}`
  const buffer = Buffer.from(await zipFile.arrayBuffer())
  const { error } = await supabaseServer.storage
    .from(bucket)
    .upload(storagePath, buffer, { contentType: "application/zip", upsert: false })

  if (error) {
    throw new Error(error.message)
  }

  return storagePath
}

async function uploadSetupGuideFile(
  setupBucket: string,
  projectId: string,
  setupGuideFile: File,
  timestamp: number,
) {
  const normalizedName = setupGuideFile.name.toLowerCase()
  const isPdfMime = setupGuideFile.type === "application/pdf"
  const isPdfName = normalizedName.endsWith(".pdf")
  if (!isPdfMime && !isPdfName) {
    throw new Error("setupGuideFile must be a PDF")
  }

  const sanitizedPdfName = setupGuideFile.name.replace(/[^a-zA-Z0-9_.-]/g, "_")
  const setupGuidePath = `${projectId}/setup-guide/${timestamp}-${sanitizedPdfName}`
  const setupBuffer = Buffer.from(await setupGuideFile.arrayBuffer())
  const { error } = await supabaseServer.storage
    .from(setupBucket)
    .upload(setupGuidePath, setupBuffer, { contentType: "application/pdf", upsert: false })

  if (error) {
    throw new Error(error.message)
  }

  return setupGuidePath
}

export async function GET(request: NextRequest) {
  try {
    const { error } = await ensureAdminFromRequest(request)
    if (error) return error

    const { data, error: listError } = await supabaseServer
      .from("projects")
      .select(
        "id,title,description,long_description,tech_stack,features,price_inr,image_url,screenshot_urls,is_featured,is_active,is_sellable,github_url,live_url,demo_url,download_file_path,setup_guide_file_path,category,updated_at",
      )
      .order("updated_at", { ascending: false })

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    return NextResponse.json({ projects: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch projects" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error: adminError } = await ensureAdminFromRequest(request)
    if (adminError) return adminError

    const formData = await request.formData()
    const zipFile = formData.get("zipFile")
    const setupGuideFile = formData.get("setupGuideFile")
    const imageFile = formData.get("imageFile")
    const screenshotFiles = formData.getAll("screenshotFiles")

    if (!zipFile || !(zipFile instanceof File)) {
      return NextResponse.json({ error: "zipFile is required" }, { status: 400 })
    }
    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json({ error: "imageFile is required" }, { status: 400 })
    }

    const title = String(formData.get("title") || "").trim()
    const description = String(formData.get("description") || "").trim()
    const longDescription = String(formData.get("longDescription") || "").trim()
    const category = String(formData.get("category") || "paid").trim()
    const priceInr = Number(formData.get("priceInr") || 0)
    const githubUrl = String(formData.get("githubUrl") || "").trim()
    const liveUrl = String(formData.get("liveUrl") || "").trim()
    const demoUrl = String(formData.get("demoUrl") || "").trim()

    if (!title || !description || !longDescription || !priceInr) {
      return NextResponse.json(
        { error: "title, description, longDescription and priceInr are required" },
        { status: 400 },
      )
    }

    const techStack = parseStringArrayField(formData.get("techStack"))
    const features = parseStringArrayField(formData.get("features"))

    const projectId = crypto.randomUUID()
    const timestamp = Date.now()
    const bucket = process.env.SUPABASE_PROJECTS_BUCKET || "projects"
    const setupBucket = process.env.SUPABASE_PROJECTS_SETUP_GUIDES_BUCKET || bucket

    let storagePath = ""
    let imageUrl = ""
    const screenshotUrls: string[] = []
    let setupGuidePath: string | null = null

    try {
      storagePath = await uploadZipFile(bucket, projectId, zipFile, timestamp)
      const imageUpload = await uploadFileAndGetPublicUrl({
        bucket,
        projectId,
        folder: "cover-image",
        file: imageFile,
        timestamp,
        contentType: imageFile.type || "image/*",
      })
      imageUrl = imageUpload.publicUrl

      for (const screenshotFile of screenshotFiles) {
        if (!(screenshotFile instanceof File) || !screenshotFile.name) continue
        const uploaded = await uploadFileAndGetPublicUrl({
          bucket,
          projectId,
          folder: "screenshots",
          file: screenshotFile,
          timestamp: Date.now(),
          contentType: screenshotFile.type || "image/*",
        })
        screenshotUrls.push(uploaded.publicUrl)
      }

      if (setupGuideFile instanceof File) {
        setupGuidePath = await uploadSetupGuideFile(setupBucket, projectId, setupGuideFile, timestamp)
      }
    } catch (uploadError) {
      return NextResponse.json(
        { error: uploadError instanceof Error ? uploadError.message : "Failed file upload" },
        { status: 500 },
      )
    }

    const payload = {
      id: projectId,
      title,
      description,
      long_description: longDescription,
      tech_stack: techStack,
      features,
      category,
      image_url: imageUrl,
      github_url: githubUrl || null,
      live_url: liveUrl || null,
      demo_url: demoUrl || null,
      is_featured: toBoolean(formData.get("isFeatured")),
      is_active: formData.get("isActive") === null ? true : toBoolean(formData.get("isActive")),
      is_sellable: true,
      price_inr: priceInr,
      download_file_path: storagePath,
      setup_guide_file_path: setupGuidePath,
      screenshot_urls: screenshotUrls,
    }

    const { data, error: insertError } = await supabaseServer.from("projects").insert(payload).select("*").single()
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    revalidatePath("/projects")
    revalidatePath("/home")

    return NextResponse.json({ message: "Project uploaded successfully", project: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload project" },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { error } = await ensureAdminFromRequest(request)
    if (error) return error

    const formData = await request.formData()
    const projectId = String(formData.get("projectId") || "").trim()
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 })
    }

    const { data: existingProject, error: existingError } = await supabaseServer
      .from("projects")
      .select("id,image_url,screenshot_urls,download_file_path,setup_guide_file_path")
      .eq("id", projectId)
      .maybeSingle()

    if (existingError || !existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const bucket = process.env.SUPABASE_PROJECTS_BUCKET || "projects"
    const setupBucket = process.env.SUPABASE_PROJECTS_SETUP_GUIDES_BUCKET || bucket
    const timestamp = Date.now()

    const zipFile = formData.get("zipFile")
    const setupGuideFile = formData.get("setupGuideFile")
    const imageFile = formData.get("imageFile")
    const screenshotFiles = formData.getAll("screenshotFiles")
    const clearScreenshots = toBoolean(formData.get("clearScreenshots"))

    const title = String(formData.get("title") || "").trim()
    const description = String(formData.get("description") || "").trim()
    const longDescription = String(formData.get("longDescription") || "").trim()
    const category = String(formData.get("category") || "paid").trim()
    const priceInrRaw = String(formData.get("priceInr") || "").trim()
    const githubUrl = String(formData.get("githubUrl") || "").trim()
    const liveUrl = String(formData.get("liveUrl") || "").trim()
    const demoUrl = String(formData.get("demoUrl") || "").trim()
    const techStack = parseStringArrayField(formData.get("techStack"))
    const features = parseStringArrayField(formData.get("features"))

    const updatePayload: Record<string, unknown> = {
      title,
      description,
      long_description: longDescription,
      tech_stack: techStack,
      features,
      category,
      github_url: githubUrl || null,
      live_url: liveUrl || null,
      demo_url: demoUrl || null,
      is_featured: toBoolean(formData.get("isFeatured")),
      is_active: formData.get("isActive") === null ? true : toBoolean(formData.get("isActive")),
      is_sellable: formData.get("isSellable") === null ? true : toBoolean(formData.get("isSellable")),
    }

    if (priceInrRaw) {
      const parsedPrice = Number(priceInrRaw)
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        return NextResponse.json({ error: "priceInr must be a positive number" }, { status: 400 })
      }
      updatePayload.price_inr = parsedPrice
    }

    try {
      if (zipFile instanceof File && zipFile.name) {
        updatePayload.download_file_path = await uploadZipFile(bucket, projectId, zipFile, timestamp)
      }
      if (setupGuideFile instanceof File && setupGuideFile.name) {
        updatePayload.setup_guide_file_path = await uploadSetupGuideFile(setupBucket, projectId, setupGuideFile, timestamp)
      }
      if (imageFile instanceof File && imageFile.name) {
        const uploaded = await uploadFileAndGetPublicUrl({
          bucket,
          projectId,
          folder: "cover-image",
          file: imageFile,
          timestamp,
          contentType: imageFile.type || "image/*",
        })
        updatePayload.image_url = uploaded.publicUrl
      }

      if (clearScreenshots) {
        updatePayload.screenshot_urls = []
      }

      const newScreenshotUrls: string[] = []
      for (const screenshotFile of screenshotFiles) {
        if (!(screenshotFile instanceof File) || !screenshotFile.name) continue
        const uploaded = await uploadFileAndGetPublicUrl({
          bucket,
          projectId,
          folder: "screenshots",
          file: screenshotFile,
          timestamp: Date.now(),
          contentType: screenshotFile.type || "image/*",
        })
        newScreenshotUrls.push(uploaded.publicUrl)
      }

      if (newScreenshotUrls.length > 0) {
        updatePayload.screenshot_urls = newScreenshotUrls
      } else if (clearScreenshots) {
        updatePayload.screenshot_urls = []
      } else {
        updatePayload.screenshot_urls = existingProject.screenshot_urls || []
      }
    } catch (uploadError) {
      return NextResponse.json(
        { error: uploadError instanceof Error ? uploadError.message : "Failed file upload" },
        { status: 500 },
      )
    }

    const { data: updated, error: updateError } = await supabaseServer
      .from("projects")
      .update(updatePayload)
      .eq("id", projectId)
      .select("*")
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    revalidatePath("/projects")
    revalidatePath("/home")

    return NextResponse.json({ message: "Project updated successfully", project: updated })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update project" },
      { status: 500 },
    )
  }
}
