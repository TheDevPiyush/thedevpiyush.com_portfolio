import { NextRequest, NextResponse } from "next/server"
import { createRazorpayOrder, getRazorpayConfig } from "@/lib/payments/razorpay"
import { ensureUser, getAuthUser } from "@/lib/auth/server-auth"
import { supabaseServer } from "@/lib/supabase/server"

const ORDER_REUSE_WINDOW_MS = 6 * 60 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = authUser.id
    // project_purchases.user_id references users.id, so make sure the row exists.
    await ensureUser(userId, authUser.email)

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

    const { keyId } = getRazorpayConfig()

    // Idempotency: never charge twice for the same project, and reuse an unpaid order from the last
    // few hours (same price) instead of opening a new one on every click.
    const { data: existing } = await supabaseServer
      .from("project_purchases")
      .select("status,razorpay_order_id,amount_inr,created_at")
      .eq("user_id", userId)
      .eq("project_id", project.id)
      .in("status", ["paid", "created"])
      .order("created_at", { ascending: false })

    if (existing?.some((purchase) => purchase.status === "paid")) {
      return NextResponse.json({ alreadyPurchased: true, projectTitle: project.title })
    }

    const reusable = existing?.find(
      (purchase) =>
        purchase.razorpay_order_id &&
        Number(purchase.amount_inr) === Number(project.price_inr) &&
        Date.now() - new Date(purchase.created_at).getTime() < ORDER_REUSE_WINDOW_MS,
    )
    if (reusable) {
      return NextResponse.json({
        keyId,
        orderId: reusable.razorpay_order_id,
        amount: amountInPaise,
        currency: "INR",
        projectTitle: project.title,
      })
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
