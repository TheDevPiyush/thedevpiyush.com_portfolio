"use client"

export interface RazorpaySuccess {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

let scriptPromise: Promise<void> | null = null

// Checkout.js is only needed once someone actually clicks Buy, so it is loaded on demand.
export function loadRazorpay(): Promise<void> {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve()
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error("Couldn't load the payment window. Check your connection and try again."))
    }
    document.body.appendChild(script)
  })
  return scriptPromise
}

// Asks the server for a short-lived signed URL and starts the download.
export async function downloadPurchasedProject(projectId: string) {
  const response = await fetch(`/api/projects/${projectId}/download`, { method: "POST" })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.downloadUrl) {
    throw new Error(data.error || "Unable to start download")
  }
  window.location.assign(data.downloadUrl)
}
