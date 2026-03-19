import crypto from "crypto"

const RAZORPAY_BASE = "https://api.razorpay.com/v1"

export function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET")
  }

  return { keyId, keySecret }
}

function getBasicAuthHeader(keyId: string, keySecret: string) {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64")
  return `Basic ${auth}`
}

interface CreateOrderArgs {
  amountInPaise: number
  receipt: string
  notes?: Record<string, string>
}

export async function createRazorpayOrder({ amountInPaise, receipt, notes }: CreateOrderArgs) {
  const { keyId, keySecret } = getRazorpayConfig()

  const response = await fetch(`${RAZORPAY_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: getBasicAuthHeader(keyId, keySecret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create Razorpay order: ${response.status} ${text}`)
  }

  return response.json()
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret || !signature) return false

  const generated = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex")
  return generated === signature
}
