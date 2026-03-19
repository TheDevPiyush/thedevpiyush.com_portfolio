"use client"

import { useMemo, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void
    }
  }
}

interface BuyProjectButtonProps {
  projectId: string
  projectTitle: string
  priceInr?: number | null
  isSellable?: boolean
}

export function BuyProjectButton({ projectId, projectTitle, priceInr, isSellable }: BuyProjectButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEnabled = useMemo(() => Boolean(isSellable && priceInr && priceInr > 0), [isSellable, priceInr])

  const handleDownload = async () => {
    const token = Cookies.get("token")
    if (!token) {
      toast.error("Please sign in first")
      router.push("/signin")
      return
    }

    const response = await fetch(`/api/projects/${projectId}/download`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    })
    const data = await response.json()

    if (!response.ok || !data.downloadUrl) {
      toast.error(data.error || "Unable to start download")
      return
    }

    window.open(data.downloadUrl, "_blank")
    toast.success("Signed URL generated. It expires in 2 minutes.")
  }

  const handleBuy = async () => {
    if (!isEnabled) {
      toast.error("This project is not available for purchase")
      return
    }

    const token = Cookies.get("token")
    if (!token) {
      toast.error("Please sign in first")
      router.push("/signin")
      return
    }

    try {
      setIsLoading(true)
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      })
      const orderData = await orderResponse.json()
      if (!orderResponse.ok) {
        toast.error(orderData.error || "Failed to create payment order")
        return
      }

      if (!window.Razorpay) {
        toast.error("Razorpay SDK is not loaded")
        return
      }

      const instance = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TheDevPiyush",
        description: `Purchase ${projectTitle}`,
        order_id: orderData.orderId,
        handler: async () => {
          // Webhook marks payment as paid. We allow a short delay then try download.
          setTimeout(() => {
            handleDownload()
          }, 2000)
        },
        modal: {
          ondismiss: () => {
            toast.message("Payment was not completed")
          },
        },
      })

      instance.open()
    } catch {
      toast.error("Failed to start payment")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isEnabled) return null

  return (
    <Button onClick={handleBuy} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        `Buy for Rs ${priceInr}`
      )}
    </Button>
  )
}
