import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignInPanel } from "@/components/auth/sign-in-panel"
import { safeNextPath } from "@/lib/auth/safe-next"

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
}

interface AdminSignInPageProps {
  searchParams: Promise<{ next?: string }>
}

export default async function AdminSignInPage({ searchParams }: AdminSignInPageProps) {
  const { next } = await searchParams

  return (
    <AuthShell>
      <SignInPanel
        title="Admin portal"
        description="Enter your admin email and we'll send you a one-time code."
        nextPath={safeNextPath(next, "/admin")}
        showGoogle={false}
      />
    </AuthShell>
  )
}
