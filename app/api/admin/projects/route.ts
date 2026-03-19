import { NextRequest, NextResponse } from "next/server"
import { ensureAdmin, getUserIdFromAuthHeader } from "@/lib/auth/server-auth"
import { supabaseServer } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

function toBoolean(value: FormDataEntryValue | null): boolean {
  return value === "true" || value === "1" || value === "on"
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromAuthHeader(request.headers.get("authorization"))
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = await ensureAdmin(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const zipFile = formData.get("zipFile")

    if (!zipFile || !(zipFile instanceof File)) {
      return NextResponse.json({ error: "zipFile is required" }, { status: 400 })
    }

    const title = String(formData.get("title") || "").trim()
    const description = String(formData.get("description") || "").trim()
    const longDescription = String(formData.get("longDescription") || "").trim()
    const category = String(formData.get("category") || "paid").trim()
    const priceInr = Number(formData.get("priceInr") || 0)
    const imageUrl = String(formData.get("imageUrl") || "").trim()
    const githubUrl = String(formData.get("githubUrl") || "").trim()
    const liveUrl = String(formData.get("liveUrl") || "").trim()
    const demoUrl = String(formData.get("demoUrl") || "").trim()

    if (!title || !description || !longDescription || !priceInr) {
      return NextResponse.json(
        { error: "title, description, longDescription and priceInr are required" },
        { status: 400 },
      )
    }

    const techStack = JSON.parse(String(formData.get("techStack") || "[]"))
    const features = JSON.parse(String(formData.get("features") || "[]"))

    if (!Array.isArray(techStack) || !Array.isArray(features)) {
      return NextResponse.json({ error: "techStack and features must be arrays" }, { status: 400 })
    }

    const projectId = crypto.randomUUID()
    const timestamp = Date.now()
    const sanitizedName = zipFile.name.replace(/[^a-zA-Z0-9_.-]/g, "_")
    const storagePath = `${projectId}/${timestamp}-${sanitizedName}`
    const bucket = process.env.SUPABASE_PROJECTS_BUCKET || "projects"

    const arrayBuffer = await zipFile.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseServer.storage
      .from(bucket)
      .upload(storagePath, fileBuffer, { contentType: "application/zip", upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const payload = {
      id: projectId,
      title,
      description,
      long_description: longDescription,
      tech_stack: techStack,
      features,
      category,
      image_url: imageUrl || null,
      github_url: githubUrl || null,
      live_url: liveUrl || null,
      demo_url: demoUrl || null,
      is_featured: toBoolean(formData.get("isFeatured")),
      is_active: formData.get("isActive") === null ? true : toBoolean(formData.get("isActive")),
      is_sellable: true,
      price_inr: priceInr,
      download_file_path: storagePath,
    }

    const { data, error } = await supabaseServer.from("projects").insert(payload).select("*").single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
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
