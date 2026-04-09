import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params

    const { data: project, error: projectError } = await supabaseServer
      .from("projects")
      .select("setup_guide_file_path,is_active,is_sellable")
      .eq("id", projectId)
      .maybeSingle()

    if (projectError || !project || !project.is_active || !project.is_sellable || !project.setup_guide_file_path) {
      return NextResponse.json({ error: "Setup guide is not available for this project" }, { status: 404 })
    }

    const defaultBucket = process.env.SUPABASE_PROJECTS_BUCKET || "projects"
    const setupBucket = process.env.SUPABASE_PROJECTS_SETUP_GUIDES_BUCKET || defaultBucket

    const { data, error } = await supabaseServer.storage
      .from(setupBucket)
      .createSignedUrl(project.setup_guide_file_path, 600)

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message || "Failed to create setup guide URL" }, { status: 500 })
    }

    return NextResponse.json({
      setupGuideUrl: data.signedUrl,
      expiresInSeconds: 600,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch setup guide" },
      { status: 500 },
    )
  }
}
