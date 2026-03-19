"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Terminal, Home, User, Code, Briefcase, BookOpen, Mail, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
            <Link href="/signin" className="flex items-center">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white bg-slate-900">
                Sign In
              </Button>
            </Link>
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
                <Link href="/signin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="group relative w-full border-slate-700 text-slate-300 hover:text-white overflow-hidden bg-slate-900"
                  >
                    <div className="relative z-20 flex items-center">Sign In</div>
                  </Button>
                </Link>
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
