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
  const [stage, setStage] = useState<"idle" | "creating-order" | "awaiting-payment" | "verifying-payment" | "preparing-download">("idle")
  const isEnabled = useMemo(() => Boolean(isSellable && priceInr && priceInr > 0), [isSellable, priceInr])
  const isBusy = stage !== "idle"
  const buttonLabel = useMemo(() => {
    if (stage === "creating-order") return "Buying..."
    if (stage === "awaiting-payment") return "Awaiting payment..."
    if (stage === "verifying-payment") return "Verifying payment..."
    if (stage === "preparing-download") return "Preparing download..."
    return `Buy for Rs ${priceInr}`
  }, [stage, priceInr])

  const handleDownload = async () => {
    const token = Cookies.get("token")
    if (!token) {
      toast.error("Please sign in first")
      router.push("/signin")
      return
    }

    setStage("preparing-download")
    const response = await fetch(`/api/projects/${projectId}/download`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    })
    const data = await response.json()

    if (!response.ok || !data.downloadUrl) {
      toast.error(data.error || "Unable to start download")
      setStage("idle")
      return
    }

    try {
      const anchor = document.createElement("a")
      anchor.href = data.downloadUrl
      anchor.target = "_self"
      anchor.rel = "noopener noreferrer"
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
    } catch {
      window.location.assign(data.downloadUrl)
    }
    toast.success("Payment successful. Download starting...")
    setTimeout(() => setStage("idle"), 1200)
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
      setStage("creating-order")
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
        setStage("idle")
        return
      }

      if (!window.Razorpay) {
        toast.error("Razorpay SDK is not loaded")
        setStage("idle")
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
          setStage("verifying-payment")
          setTimeout(() => {
            handleDownload()
          }, 2000)
        },
        modal: {
          ondismiss: () => {
            toast.message("Payment was not completed")
            setStage("idle")
          },
        },
      })

      setStage("awaiting-payment")
      instance.open()
    } catch {
      toast.error("Failed to start payment")
      setStage("idle")
    }
  }

  if (!isEnabled) return null

  return (
    <Button
      onClick={handleBuy}
      disabled={isBusy}
      style={{ background: "var(--gradient-secondary)", color: "rgb(var(--color-text-primary))" }}
      className="hover:opacity-90"
    >
      {isBusy ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {buttonLabel}
        </>
      ) : (
        buttonLabel
      )}
    </Button>
  )
}
