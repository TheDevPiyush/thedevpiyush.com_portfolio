"use client"

import { useMemo, useRef, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, FileText, Loader2 } from "lucide-react"

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
  const previewScrollRef = useRef<HTMLDivElement | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false)
  const [isGuideLoading, setIsGuideLoading] = useState(false)
  const [setupGuideMarkdown, setSetupGuideMarkdown] = useState("")
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null)
  const [stage, setStage] = useState<"idle" | "creating-order" | "awaiting-payment" | "verifying-payment" | "preparing-download">("idle")
  const isEnabled = useMemo(() => Boolean(isSellable && priceInr && priceInr > 0), [isSellable, priceInr])
  const isBusy = stage !== "idle"
  const formattedPrice = useMemo(() => {
    if (!priceInr || priceInr <= 0) return "0"
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(priceInr)
  }, [priceInr])
  const buttonLabel = useMemo(() => {
    if (stage === "creating-order") return "Initiating payment..."
    if (stage === "awaiting-payment") return "Awaiting payment..."
    if (stage === "verifying-payment") return "Verifying payment..."
    if (stage === "preparing-download") return "Preparing download..."
    return `Preview & Buy - Rs ${formattedPrice}`
  }, [stage, formattedPrice])

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
            toast.error("Payment was cancelled. Kindly Retry.")
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

  const scrollPreviewByOne = (direction: "left" | "right") => {
    const container = previewScrollRef.current
    if (!container) return
    const cardWidth = window.innerWidth < 640 ? window.innerWidth * 0.85 : 55 * 16
    const gap = 16 // gap-4
    container.scrollBy({
      left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap,
      behavior: "smooth",
    })
  }

  const openSetupGuide = async () => {
    if (!setupGuideFilePath || isBusy) return
    try {
      setIsGuideLoading(true)
      const response = await fetch(`/api/projects/${projectId}/setup-guide`)
      const data = await response.json()
      if (!response.ok || !data.markdown) {
        toast.error(data.error || "Unable to open setup guide")
        return
      }
      setSetupGuideMarkdown(data.markdown)
      setIsGuideModalOpen(true)
    } catch {
      toast.error("Unable to open setup guide")
    } finally {
      setIsGuideLoading(false)
    }
  }

  const handleCopyCode = async (code: string, key: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCodeKey(key)
      setTimeout(() => setCopiedCodeKey(null), 1200)
    } catch {
      toast.error("Unable to copy code")
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        disabled={isBusy}
        style={{ background: "var(--gradient-secondary)", color: "rgb(var(--color-text-primary))" }}
        className="hover:opacity-90 whitespace-nowrap text-sm px-3 font-bold"
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
          className="backdrop-blur-md w-[92vw] max-w-5xl overflow-hidden"
          style={{
            backgroundColor: "rgb(var(--color-bg-secondary))",
            border: "1px solid rgba(var(--color-border-primary), 0.7)",
            color: "rgb(var(--color-text-primary))",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl" style={{ color: "rgb(var(--color-text-primary))" }}>Read setup guide before payment</DialogTitle>
            <DialogDescription className="font-bold text-lg" style={{ color: "rgb(var(--color-text-secondary))" }}>
              Please review the setup guide first so you know exactly what steps are involved after purchase.
              Continue only if you are comfortable with the installation and configuration process.
            </DialogDescription>
          </DialogHeader>
          {!!screenshotUrls?.length && (
            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                  Project Sneak Peak - This is how the project is gonna be exactly.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => scrollPreviewByOne("left")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => scrollPreviewByOne("right")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div
                ref={previewScrollRef}
                className="preview-scroll flex gap-4 overflow-x-auto pb-2 pr-1 snap-x snap-mandatory min-w-0"
              >
                {screenshotUrls.slice(0, 4).map((url, index) => (
                  <div
                    key={`${projectId}-${index}`}
                    className="w-[85vw] sm:w-[38rem] lg:w-[55rem] h-[52vh] max-h-[28rem] rounded-lg shrink-0 snap-start flex items-center justify-center overflow-hidden"
                    style={{
                      borderColor: "rgba(var(--color-border-primary), 0.7)",
                      backgroundColor: "rgba(var(--color-bg-tertiary), 0.35)",
                    }}
                  >
                    <img
                      src={url}
                      alt={`${projectTitle} screenshot ${index + 1}`}
                      className="max-h-full max-w-full h-auto w-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                ))
                }
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsModalOpen(false)} disabled={isBusy}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              disabled={!setupGuideFilePath || isBusy || isGuideLoading}
              onClick={openSetupGuide}
            >
              {isGuideLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Read Setup Guide
            </Button>
            <Button
              disabled={isBusy}
              className="w-full sm:w-auto"
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

      <Dialog open={isGuideModalOpen} onOpenChange={setIsGuideModalOpen}>
        <DialogContent
          className="backdrop-blur-md w-[94vw] max-w-4xl h-[86vh] max-h-[86vh] overflow-hidden flex flex-col"
          style={{
            backgroundColor: "rgb(var(--color-bg-primary))",
            border: "1px solid rgba(var(--color-border-primary), 0.7)",
            color: "rgb(var(--color-text-primary))",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ color: "rgb(var(--color-text-primary))" }}>
              Setup Guide
            </DialogTitle>
            <DialogDescription className="text-base" style={{ color: "rgb(var(--color-text-secondary))" }}>
              Review all steps before continuing to payment.
            </DialogDescription>
          </DialogHeader>
          <div
            className="preview-scroll min-h-0 flex-1 overflow-y-auto rounded-md p-4 sm:p-5"
            style={{
              backgroundColor: "rgba(var(--color-bg-tertiary), 0.45)",
              border: "1px solid rgba(var(--color-border-primary), 0.5)",
            }}
          >
            <div className="setup-guide-content text-base">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code(props) {
                    const { children, className, ...rest } = props
                    const match = /language-(\w+)/.exec(className || "")
                    const code = String(children).replace(/\n$/, "")
                    if (!match) {
                      return (
                        <code className="inline-code" {...rest}>
                          {children}
                        </code>
                      )
                    }
                    const codeKey = `${match[1]}:${code.slice(0, 30)}`
                    return (
                      <div className="code-block-wrap">
                        <div className="code-block-top">
                          <span>{match[1]}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleCopyCode(code, codeKey)}
                          >
                            {copiedCodeKey === codeKey ? "Copied" : "Copy"}
                          </Button>
                        </div>
                        <pre className="code-block-pre">
                          <code className={className} {...rest}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    )
                  },
                }}
              >
                {setupGuideMarkdown}
              </ReactMarkdown>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsGuideModalOpen(false)}>
              Back
            </Button>
            <Button
              className="w-full sm:w-auto"
              style={{ background: "var(--gradient-secondary)", color: "rgb(var(--color-text-primary))" }}
              onClick={async () => {
                setIsGuideModalOpen(false)
                setIsModalOpen(false)
                await handleBuy()
              }}
              disabled={isBusy}
            >
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
