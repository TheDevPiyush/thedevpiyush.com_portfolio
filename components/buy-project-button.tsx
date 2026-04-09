"use client"

import { useMemo, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExternalLink, Loader2 } from "lucide-react"

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
  setupGuideFilePath?: string | null
  screenshotUrls?: string[] | null
}

export function BuyProjectButton({
  projectId,
  projectTitle,
  priceInr,
  isSellable,
  setupGuideFilePath,
  screenshotUrls,
}: BuyProjectButtonProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
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
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="backdrop-blur-md"
          style={{
            backgroundColor: "rgb(var(--color-bg-secondary))",
            border: "1px solid rgba(var(--color-border-primary), 0.7)",
            color: "rgb(var(--color-text-primary))",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "rgb(var(--color-text-primary))" }}>Read setup guide before payment</DialogTitle>
            <DialogDescription style={{ color: "rgb(var(--color-text-secondary))" }}>
              Please review the setup guide first so you know exactly what steps are involved after purchase.
              Continue only if you are comfortable with the installation and configuration process.
            </DialogDescription>
          </DialogHeader>
          {!!screenshotUrls?.length && (
            <div className="space-y-2">
              <p className="text-sm font-medium" style={{ color: "rgb(var(--color-text-primary))" }}>
                Project preview
              </p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {screenshotUrls.slice(0, 4).map((url, index) => (
                  <img
                    key={`${projectId}-${index}`}
                    src={url}
                    alt={`${projectTitle} screenshot ${index + 1}`}
                    className="h-36 w-64 rounded-md object-cover border shrink-0"
                    style={{ borderColor: "rgba(var(--color-border-primary), 0.7)" }}
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isBusy}>
              Cancel
            </Button>
            <Button
              variant="outline"
              disabled={!setupGuideFilePath || isBusy}
              onClick={async () => {
                if (!setupGuideFilePath) return
                try {
                  const response = await fetch(`/api/projects/${projectId}/setup-guide`)
                  const data = await response.json()
                  if (!response.ok || !data.setupGuideUrl) {
                    toast.error(data.error || "Unable to open setup guide")
                    return
                  }
                  window.open(data.setupGuideUrl, "_blank", "noopener,noreferrer")
                } catch {
                  toast.error("Unable to open setup guide")
                }
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Read Setup Guide
            </Button>
            <Button
              disabled={isBusy}
              style={{ background: "var(--gradient-secondary)", color: "rgb(var(--color-text-primary))" }}
              onClick={async () => {
                setIsModalOpen(false)
                await handleBuy()
              }}
            >
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
