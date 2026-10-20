import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAuthUser } from "@/lib/auth/server-auth"
import { verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay"
import { supabaseServer } from "@/lib/supabase/server"

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

// Called by the checkout success handler. Marks the purchase paid as soon as the signature checks out,
// so the buyer can download immediately instead of waiting for the webhook (which stays as the backup).
export async function POST(request: NextRequest) {
  const authUser = await getAuthUser(request)
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 })
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = parsed.data

  if (!verifyRazorpayPaymentSignature(orderId, paymentId, signature)) {
    return NextResponse.json({ error: "Payment signature is invalid" }, { status: 400 })
  }

  const { data: purchase, error } = await supabaseServer
    .from("project_purchases")
    .select("id,project_id,user_id,status")
    .eq("razorpay_order_id", orderId)
    .maybeSingle()

  if (error || !purchase || purchase.user_id !== authUser.id) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
  }

  if (purchase.status !== "paid") {
    const { error: updateError } = await supabaseServer
      .from("project_purchases")
      .update({ status: "paid", razorpay_payment_id: paymentId, paid_at: new Date().toISOString() })
      .eq("id", purchase.id)
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, projectId: purchase.project_id })
}
