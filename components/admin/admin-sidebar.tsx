"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronsUpDown, ExternalLink, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ADMIN_NAV, activeNavItem } from "@/lib/admin/nav"
import { supabaseBrowser } from "@/lib/supabase/browser"
import { useUserStore } from "@/lib/useStore"

export function AdminSidebar({ email, unread }: { email: string | null; unread: number }) {
  const pathname = usePathname()
  const active = activeNavItem(pathname)
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Dashboard">
              <Link href="/admin" onClick={() => isMobile && setOpenMobile(false)}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand font-serif text-lg italic text-brand-foreground">
                  P
                </span>
                <span className="grid leading-tight">
                  <span className="font-medium">TheDevPiyush</span>
                  <span className="text-xs text-muted-foreground">Admin</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {ADMIN_NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active?.href === item.href} tooltip={item.title}>
                      <Link href={item.href} onClick={() => isMobile && setOpenMobile(false)}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.href === "/admin/inbox" && unread > 0 && (
                      <SidebarMenuBadge className="rounded-full bg-brand/15 text-brand">{unread}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <AccountButton email={email} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function AccountButton({ email }: { email: string | null }) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const clearUser = useUserStore((state) => state.clearUser)
  const isDark = resolvedTheme === "dark"

  const signOut = async () => {
    await supabaseBrowser.auth.signOut()
    clearUser()
    toast.success("Signed out")
    router.replace("/")
    router.refresh()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" tooltip="Account">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold uppercase">
                {email?.charAt(0) ?? "?"}
              </span>
              <span className="min-w-0 flex-1 truncate text-left text-sm">{email}</span>
              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl">
            <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">{email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View site
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme(isDark ? "light" : "dark")}>
              {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              {isDark ? "Light theme" : "Dark theme"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
