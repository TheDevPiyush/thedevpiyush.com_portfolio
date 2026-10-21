"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import { ArrowRight, ChevronLeft, ChevronRight, Download, FileText, Loader2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUserStore } from "@/lib/useStore"
import { useOwnedProjects } from "@/hooks/use-owned-projects"
import { downloadPurchasedProject, loadRazorpay, type RazorpaySuccess } from "@/lib/payments/checkout"

// react-markdown is only needed once someone opens a setup guide.
const SetupGuideMarkdown = dynamic(() => import("./setup-guide-markdown").then((mod) => mod.SetupGuideMarkdown), {
  loading: () => <Loader2 className="mx-auto mt-10 h-5 w-5 animate-spin text-muted-foreground" />,
})

interface BuyProjectButtonProps {
  projectId: string
  projectTitle: string
  priceInr?: number | null
  isSellable?: boolean
  setupGuideFilePath?: string | null
  screenshotUrls?: string[] | null
}

type Stage = "idle" | "creating-order" | "awaiting-payment" | "verifying-payment" | "preparing-download"

const STAGE_LABEL: Record<Exclude<Stage, "idle">, string> = {
  "creating-order": "Starting checkout…",
  "awaiting-payment": "Waiting for payment…",
  "verifying-payment": "Confirming payment…",
  "preparing-download": "Preparing download…",
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
  const { owned, markOwned } = useOwnedProjects()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [isGuideLoading, setIsGuideLoading] = useState(false)
  const [guideMarkdown, setGuideMarkdown] = useState("")
  const [stage, setStage] = useState<Stage>("idle")

  const isEnabled = Boolean(isSellable && priceInr && priceInr > 0)
  if (!isEnabled) return null

  const isOwned = owned.has(projectId)
  const isBusy = stage !== "idle"
  const price = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    priceInr ?? 0,
  )

  const requireSignIn = () => {
    if (useUserStore.getState().id) return true
    toast("Sign in to buy this project", { description: "You'll come right back here afterwards." })
    router.push(`/signin?next=${encodeURIComponent(`/projects#project-${projectId}`)}`)
    return false
  }

  const startDownload = async () => {
    if (!requireSignIn()) return
    setStage("preparing-download")
    try {
      await downloadPurchasedProject(projectId)
      toast.success("Download starting…")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start download")
    } finally {
      setTimeout(() => setStage("idle"), 1200)
    }
  }

  const startCheckout = async () => {
    setIsPreviewOpen(false)
    setIsGuideOpen(false)
    if (!requireSignIn()) return

    try {
      setStage("creating-order")
      const [orderResponse] = await Promise.all([
        fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        }),
        loadRazorpay(),
      ])
      const order = await orderResponse.json()
      if (!orderResponse.ok) throw new Error(order.error || "Failed to start checkout")

      if (order.alreadyPurchased) {
        markOwned(projectId)
        toast.success("You already own this project")
        await startDownload()
        return
      }
      if (!window.Razorpay) throw new Error("Payment window failed to load")

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "TheDevPiyush",
        description: projectTitle,
        order_id: order.orderId,
        prefill: { email: useUserStore.getState().email },
        theme: { color: "#7c3aed" },
        handler: async (payment: RazorpaySuccess) => {
          setStage("verifying-payment")
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payment),
          })
          if (!verify.ok) {
            const data = await verify.json().catch(() => ({}))
            toast.error(data.error || "We couldn't confirm the payment", {
              description: "If you were charged, it will show up under My purchases within a few minutes.",
            })
            setStage("idle")
            return
          }
          markOwned(projectId)
          toast.success("Payment successful. Thank you!")
          await startDownload()
        },
        modal: {
          ondismiss: () => {
            toast("Checkout closed", { description: "No payment was taken." })
            setStage("idle")
          },
        },
      })

      setStage("awaiting-payment")
      checkout.open()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start checkout")
      setStage("idle")
    }
  }

  const openGuide = async () => {
    if (!setupGuideFilePath) return
    if (guideMarkdown) return setIsGuideOpen(true)
    setIsGuideLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/setup-guide`)
      const data = await response.json()
      if (!response.ok || !data.markdown) throw new Error(data.error || "Unable to open setup guide")
      setGuideMarkdown(data.markdown)
      setIsGuideOpen(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to open setup guide")
    } finally {
      setIsGuideLoading(false)
    }
  }

  if (isOwned) {
    return (
      <Button variant="outline" size="pill" onClick={startDownload} disabled={isBusy}>
        {isBusy ? <Loader2 className="animate-spin" /> : <Download />}
        {isBusy ? STAGE_LABEL[stage as Exclude<Stage, "idle">] : "Download"}
      </Button>
    )
  }

  return (
    <>
      <Button variant="brand" size="pill" onClick={() => setIsPreviewOpen(true)} disabled={isBusy} className="group">
        {isBusy ? <Loader2 className="animate-spin" /> : <ShoppingBag />}
        {isBusy ? STAGE_LABEL[stage as Exclude<Stage, "idle">] : <>Buy · {price}</>}
      </Button>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="w-[94vw] max-w-4xl gap-6 overflow-hidden rounded-3xl p-0 sm:rounded-3xl">
          <DialogHeader className="space-y-2 px-6 pt-6 text-left sm:px-8 sm:pt-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Before you buy</p>
            <DialogTitle className="text-3xl font-normal tracking-tight sm:text-4xl">{projectTitle}</DialogTitle>
            <DialogDescription className="text-base">
              Have a look at the screenshots and read the setup guide, so you know exactly what you&apos;ll be installing
              and configuring after purchase.
            </DialogDescription>
          </DialogHeader>

          {!!screenshotUrls?.length && <ScreenshotStrip urls={screenshotUrls} title={projectTitle} />}

          <DialogFooter className="flex-col gap-2 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-sm text-muted-foreground">
              One-time payment of <span className="font-medium text-foreground">{price}</span> · Lifetime downloads
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              {setupGuideFilePath && (
                <Button variant="outline" size="pill" onClick={openGuide} disabled={isGuideLoading}>
                  {isGuideLoading ? <Loader2 className="animate-spin" /> : <FileText />}
                  Setup guide
                </Button>
              )}
              <Button variant="brand" size="pill" onClick={startCheckout} className="group">
                Continue to payment
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
        <DialogContent className="flex h-[88vh] w-[94vw] max-w-3xl flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:rounded-3xl">
          <DialogHeader className="space-y-1 border-b px-6 py-5 text-left sm:px-8">
            <DialogTitle className="text-2xl font-normal tracking-tight">Setup guide</DialogTitle>
            <DialogDescription>{projectTitle}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8" data-lenis-prevent>
            <SetupGuideMarkdown markdown={guideMarkdown} />
          </div>
          <DialogFooter className="gap-2 border-t bg-muted/40 px-6 py-4 sm:px-8">
            <Button variant="outline" size="pill" onClick={() => setIsGuideOpen(false)}>
              Back
            </Button>
            <Button variant="brand" size="pill" onClick={startCheckout}>
              Continue to payment · {price}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ScreenshotStrip({ urls, title }: { urls: string[]; title: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (direction: 1 | -1) => {
    const node = ref.current
    if (node) node.scrollBy({ left: direction * node.clientWidth * 0.85, behavior: "smooth" })
  }

  return (
    <div className="relative min-w-0">
      <div
        ref={ref}
        data-lenis-prevent
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {urls.slice(0, 6).map((url, index) => (
          <div
            key={url}
            className="flex h-[46vh] max-h-[26rem] w-[85%] shrink-0 snap-center items-center justify-center overflow-hidden rounded-2xl border bg-muted sm:w-[80%]"
          >
            {/* Screenshots can come from any storage host, so a plain img avoids next/image host limits. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`${title}, screenshot ${index + 1}`} loading="lazy" className="max-h-full max-w-full object-contain" />
          </div>
        ))}
      </div>
      {urls.length > 1 && (
        <div className="mt-3 flex justify-end gap-2 px-6 sm:px-8">
          <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => scroll(-1)} aria-label="Previous screenshot">
            <ChevronLeft />
          </Button>
          <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => scroll(1)} aria-label="Next screenshot">
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  )
}
