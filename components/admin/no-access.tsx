"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabaseBrowser } from "@/lib/supabase/browser"

export function NoAccess({ email }: { email: string | null }) {
  const router = useRouter()
  const switchAccount = async () => {
    await supabaseBrowser.auth.signOut()
    router.replace("/admin/signin")
    router.refresh()
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <div className="max-w-sm space-y-6 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
        <div className="space-y-2">
          <h1 className="text-4xl tracking-tight">No access</h1>
          <p className="text-muted-foreground">
            {email ? <>You&apos;re signed in as {email}, which isn&apos;t an admin account.</> : "This account isn't an admin."}
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="pill" asChild>
            <Link href="/">Back to site</Link>
          </Button>
          <Button variant="brand" size="pill" onClick={switchAccount}>
            Use another account
          </Button>
        </div>
      </div>
    </main>
  )
}
