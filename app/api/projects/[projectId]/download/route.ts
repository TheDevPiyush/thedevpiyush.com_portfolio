import { NextRequest, NextResponse } from "next/server"
import { getUserIdFromAuthHeader } from "@/lib/auth/server-auth"
import { supabaseServer } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const userId = getUserIdFromAuthHeader(request.headers.get("authorization"))
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId } = await params

    const { data: paidPurchase, error: purchaseError } = await supabaseServer
      .from("project_purchases")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (purchaseError || !paidPurchase) {
      return NextResponse.json({ error: "No paid purchase found for this project" }, { status: 403 })
    }

    const { data: project, error: projectError } = await supabaseServer
      .from("projects")
      .select("download_file_path,is_sellable")
      .eq("id", projectId)
      .maybeSingle()

    if (projectError || !project || !project.is_sellable || !project.download_file_path) {
      return NextResponse.json({ error: "Download is not available for this project" }, { status: 400 })
    }

    const bucket = process.env.SUPABASE_PROJECTS_BUCKET || "projects"
    const { data, error } = await supabaseServer.storage
      .from(bucket)
      .createSignedUrl(project.download_file_path, 120)

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message || "Failed to create signed URL" }, { status: 500 })
    }

    return NextResponse.json({
      downloadUrl: data.signedUrl,
      expiresInSeconds: 120,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create download URL" },
      { status: 500 },
    )
  }
}
