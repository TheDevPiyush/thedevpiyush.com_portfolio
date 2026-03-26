"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { NavigationMenu } from "@/components/navigation-menu"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      // Prefer a canonical site URL in production to avoid tunnel/subdomain callbacks.
      const canonicalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
      const origin = window.location.origin.replace(/\/$/, "")
      const redirectTo = `${canonicalSiteUrl || origin}/`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      })

      if (error) {
        toast.error(error.message)
      }
    } catch {
      toast.error("Failed to start Google sign-in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "rgb(var(--color-bg-primary))" }}>
      <NavigationMenu />
      <div className="pt-16 min-h-screen flex items-center justify-center p-6">
        <div
          className="w-full max-w-md rounded-xl p-8"
          style={{
            backgroundColor: "rgb(var(--color-bg-secondary))",
            border: "1px solid rgb(var(--color-border-primary))",
          }}
        >
          <h1 className="text-2xl font-bold mb-2" style={{ color: "rgb(var(--color-text-primary))" }}>
            Sign in
          </h1>
          <p className="mb-6" style={{ color: "rgb(var(--color-text-secondary))" }}>
            Continue with Google to buy and download paid projects.
          </p>

          <Button
            className="w-full hover:opacity-90"
            style={{ background: "var(--gradient-secondary)", color: "rgb(var(--color-text-primary))" }}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <Image src="/google-logo.png" alt="Google" width={20} height={20} className="mr-2" />
                Continue with Google
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
