"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutDashboard, LogOut, Package, PenLine } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserStore } from "@/lib/useStore"
import { supabaseBrowser } from "@/lib/supabase/browser"

// Only rendered once a session is known. Signed-out visitors see nothing here (sign-in lives in ⌘K
// and the footer), so there is no "logging you in" flash on every page load.
export function AccountMenu() {
  const router = useRouter()
  const email = useUserStore((state) => state.email)
  const isAdmin = useUserStore((state) => Boolean(state.isAdmin))
  const isAuthLoading = useUserStore((state) => state.isAuthLoading)
  const clearUser = useUserStore((state) => state.clearUser)

  if (isAuthLoading || !email) return null

  const signOut = async () => {
    await supabaseBrowser.auth.signOut()
    clearUser()
    toast.success("Signed out")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold uppercase text-brand outline-none ring-offset-background transition hover:bg-brand/25 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {email.charAt(0)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/purchases">
            <Package className="mr-2 h-4 w-4" />
            My purchases
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin/postblog">
                <PenLine className="mr-2 h-4 w-4" />
                Write a post
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/projects">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Manage projects
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
