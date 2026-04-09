"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Terminal, Home, User, Briefcase, BookOpen, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUserStore } from "@/lib/useStore"
import Cookies from "js-cookie"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "About", href: "/about", icon: User },
  { name: "Projects", href: "/projects", icon: Briefcase },
  { name: "Blog", href: "/blog", icon: BookOpen },
  { name: "Contact", href: "/contact", icon: Mail },

]

export function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const email = useUserStore((state) => state.email)
  const isAdmin = useUserStore((state) => Boolean(state.isAdmin))
  const isAuthLoading = useUserStore((state) => state.isAuthLoading)
  const clearUser = useUserStore((state) => state.clearUser)
  const userInitial = email?.trim()?.charAt(0)?.toUpperCase()
  const isLoggedIn = Boolean(email?.trim())

  const handleLogout = async () => {
    Cookies.remove("token")
    await supabase.auth.signOut()
    clearUser()
    toast.success("Logged out successfully")
    router.push("/")
  }

  return (
    <nav className="fixed top-0 select-none w-full bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/50 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            {/* <div className="w-8 h-8 bg-gradient-to-r rounded-full from-violet-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PC</span>
            </div> */}
            <span className="font-bold text-xl text-white">TheDevPiyush</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-slate-300 hover:text-white transition-colors relative py-2 flex items-center space-x-1",
                  pathname === item.href && "text-white",
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
                {pathname === item.href && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthLoading ? (
              <div className="flex items-center border border-slate-700 text-slate-300 bg-slate-900 px-4 py-2 rounded-md">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Logging you in...
              </div>
            ) : isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    title={email}
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-700 bg-slate-900 text-slate-100 text-sm font-semibold hover:border-slate-500 transition-colors"
                  >
                    {userInitial}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 backdrop-blur-xl"
                  style={{
                    backgroundColor: "rgba(var(--color-bg-tertiary), 0.75)",
                    border: "1px solid rgba(var(--color-border-primary), 0.6)",
                    color: "rgb(var(--color-text-primary))",
                  }}
                >
                  <DropdownMenuLabel className="truncate border-b-2 border-slate-700 font-bold" style={{ color: "rgb(var(--color-text-secondary))" }}>
                    {email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ backgroundColor: "rgba(var(--color-border-primary), 0.6)" }} />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push("/admin/postblog")}
                        className="cursor-pointer"
                        style={{ color: "rgb(var(--color-text-primary))" }}
                      >
                        Admin: Post Blog
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push("/admin/projects")}
                        className="cursor-pointer"
                        style={{ color: "rgb(var(--color-text-primary))" }}
                      >
                        Admin: Projects
                      </DropdownMenuItem>
                      <DropdownMenuSeparator style={{ backgroundColor: "rgba(var(--color-border-primary), 0.6)" }} />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                    style={{ color: "rgb(239 68 68)" }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/signin" className="flex items-center border-slate-700 text-slate-300 hover:text-white bg-slate-900 hover:opacity-90 px-4 py-2 rounded-md">
                <Image src="/google-logo.png" alt="Google" width={20} height={20} className="mr-2" />
                Sign In
              </Link>
            )}
            <Link href="/terminal" className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="group relative border-slate-700 text-slate-300 hover:text-white overflow-hidden bg-slate-900"
              >
                {/* Moving glass effect animation */}
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white/5 via-white/5 to-white/10 bg-[length:200%_100%] animate-[border-flow_3s_ease-in-out_infinite] opacity-100 z-10"></div>

                {/* Content */}
                <div className="relative z-20 flex items-center">
                  <Terminal className="w-4 h-4 mr-2" />
                  Terminal Mode
                </div>
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-800/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white transition-colors",
                    pathname === item.href && "text-white bg-slate-800/50 rounded-md",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="px-3 py-2 space-y-2">
                {isAuthLoading ? (
                  <div className="w-full flex items-center justify-center py-2 text-slate-300">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Logging you in...
                  </div>
                ) : isLoggedIn ? (
                  <div className="w-full space-y-2">
                    <div className="w-full flex items-center justify-center py-2">
                      <div
                        title={email}
                        className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-700 bg-slate-900 text-slate-100 text-sm font-semibold"
                      >
                        {userInitial}
                      </div>
                    </div>
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-slate-700 text-slate-300 hover:text-white bg-slate-900"
                          onClick={() => {
                            setIsOpen(false)
                            router.push("/admin/postblog")
                          }}
                        >
                          Admin: Post Blog
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-slate-700 text-slate-300 hover:text-white bg-slate-900"
                          onClick={() => {
                            setIsOpen(false)
                            router.push("/admin/projects")
                          }}
                        >
                          Admin: Projects
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-700 text-slate-300 hover:text-white bg-slate-900"
                      onClick={async () => {
                        setIsOpen(false)
                        await handleLogout()
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link href="/signin">
                    <Button
                      variant="outline"
                      size="sm"
                      className="group relative w-full border-slate-700 text-slate-300 hover:text-white overflow-hidden bg-slate-900"
                    >
                      <div className="relative z-20 flex items-center">Sign In</div>
                    </Button>
                  </Link>
                )}
                <Link href="/terminal">
                  <Button
                    variant="outline"
                    size="sm"
                    className="group relative w-full border-slate-700 text-slate-300 hover:text-white overflow-hidden bg-slate-900"
                  >
                    {/* Moving glass effect animation */}
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white/5 via-white/5 to-white/10 bg-[length:200%_100%] animate-[border-flow_3s_ease-in-out_infinite] opacity-100 z-10"></div>

                    {/* Content */}
                    <div className="relative z-20 flex items-center">
                      <Terminal className="w-4 h-4 mr-2" />
                      Terminal Mode
                    </div>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
