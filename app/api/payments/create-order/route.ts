import { NextRequest, NextResponse } from "next/server"
import { createRazorpayOrder, getRazorpayConfig } from "@/lib/payments/razorpay"
import { getUserIdFromAuthHeader } from "@/lib/auth/server-auth"
import { supabaseServer } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromAuthHeader(request.headers.get("authorization"))
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId } = await request.json()
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 })
    }

    const { data: project, error: projectError } = await supabaseServer
      .from("projects")
      .select("id,title,price_inr,is_active,is_sellable")
      .eq("id", projectId)
      .maybeSingle()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (!project.is_active || !project.is_sellable || !project.price_inr) {
      return NextResponse.json({ error: "Project is not purchasable" }, { status: 400 })
    }

    const amountInPaise = Math.round(Number(project.price_inr) * 100)
    if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
      return NextResponse.json({ error: "Invalid project price" }, { status: 400 })
    }

    // Razorpay receipt max length is 40 chars.
    const shortProjectId = String(project.id).replace(/-/g, "").slice(0, 12)
    const shortTs = Date.now().toString().slice(-10)
    const receipt = `p_${shortProjectId}_${shortTs}`
    const order = await createRazorpayOrder({
      amountInPaise,
      receipt,
      notes: {
        userId,
        projectId: String(project.id),
      },
    })

    const { error: insertError } = await supabaseServer.from("project_purchases").insert({
      user_id: userId,
      project_id: project.id,
      razorpay_order_id: order.id,
      amount_inr: Number(project.price_inr),
      status: "created",
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const { keyId } = getRazorpayConfig()
    return NextResponse.json({
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      projectTitle: project.title,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 },
    )
  }
}
