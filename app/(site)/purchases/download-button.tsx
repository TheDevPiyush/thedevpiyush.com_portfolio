"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { downloadPurchasedProject } from "@/lib/payments/checkout"

export function DownloadButton({ projectId }: { projectId: string }) {
  const [busy, setBusy] = useState(false)

  return (
    <Button
      variant="outline"
      size="pill"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        try {
          await downloadPurchasedProject(projectId)
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Unable to start download")
        } finally {
          setTimeout(() => setBusy(false), 1200)
        }
      }}
    >
      {busy ? <Loader2 className="animate-spin" /> : <Download />}
      Download
    </Button>
  )
}
