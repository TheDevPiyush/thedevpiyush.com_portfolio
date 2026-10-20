import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignInPanel } from "@/components/auth/sign-in-panel"
import { safeNextPath } from "@/lib/auth/safe-next"

export const metadata: Metadata = {
  title: "Sign in - TheDevPiyush",
  robots: { index: false, follow: false },
}

interface SignInPageProps {
  searchParams: Promise<{ next?: string; error?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { next, error } = await searchParams

  return (
    <AuthShell>
      <SignInPanel
        title="Welcome"
        description="Sign in to buy projects and download your purchases."
        nextPath={safeNextPath(next, "/projects")}
        initialError={error}
      />
    </AuthShell>
  )
}
