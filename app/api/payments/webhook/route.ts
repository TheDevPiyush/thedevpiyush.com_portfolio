import { NextRequest, NextResponse } from "next/server"
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay"
import { supabaseServer } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-razorpay-signature")

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  try {
    const event = JSON.parse(rawBody)
    const eventType = event?.event

    if (eventType === "payment.captured") {
      const paymentEntity = event?.payload?.payment?.entity
      const orderId = paymentEntity?.order_id
      const paymentId = paymentEntity?.id

      if (!orderId || !paymentId) {
        return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 })
      }

      const { data: purchase, error: purchaseError } = await supabaseServer
        .from("project_purchases")
        .select("id,project_id,user_id")
        .eq("razorpay_order_id", orderId)
        .maybeSingle()

      if (purchaseError || !purchase) {
        return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
      }

      const { error: updateError } = await supabaseServer
        .from("project_purchases")
        .update({
          status: "paid",
          razorpay_payment_id: paymentId,
          paid_at: new Date().toISOString(),
        })
        .eq("id", purchase.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      revalidatePath("/projects")
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 500 },
    )
  }
}
