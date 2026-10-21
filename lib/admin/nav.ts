import {
  Award,
  BarChart3,
  Briefcase,
  FolderKanban,
  GraduationCap,
  Hash,
  Heart,
  Inbox,
  LayoutDashboard,
  PenLine,
  Settings,
  Sparkles,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

export interface AdminNavItem {
  title: string
  href: string
  icon: LucideIcon
  /** Extra words the ⌘K menu matches on. */
  keywords?: string
}

export const ADMIN_NAV: { label: string; items: AdminNavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard, keywords: "home overview" },
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3, keywords: "traffic views visitors" },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Posts", href: "/admin/posts", icon: PenLine, keywords: "blog writing articles" },
      { title: "Projects", href: "/admin/projects", icon: FolderKanban, keywords: "work portfolio" },
    ],
  },
  {
    label: "About you",
    items: [
      { title: "Profile", href: "/admin/profile", icon: UserRound, keywords: "bio name avatar story socials" },
      { title: "Experience", href: "/admin/experience", icon: Briefcase, keywords: "jobs roles work history" },
      { title: "Education", href: "/admin/education", icon: GraduationCap, keywords: "degree university" },
      { title: "Certifications", href: "/admin/certifications", icon: Award, keywords: "certificates" },
      { title: "Skills", href: "/admin/skills", icon: Sparkles, keywords: "technologies toolkit" },
      { title: "Interests", href: "/admin/interests", icon: Heart, keywords: "hobbies" },
      { title: "Stats", href: "/admin/stats", icon: Hash, keywords: "numbers counters" },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Inbox", href: "/admin/inbox", icon: Inbox, keywords: "messages contact mail" },
      { title: "Sales", href: "/admin/sales", icon: Wallet, keywords: "purchases revenue orders razorpay" },
      { title: "Users", href: "/admin/users", icon: Users, keywords: "accounts customers admins" },
    ],
  },
  {
    label: "Site",
    items: [{ title: "Settings", href: "/admin/settings", icon: Settings, keywords: "availability resume seo" }],
  },
]

export const ADMIN_NAV_ITEMS = ADMIN_NAV.flatMap((group) => group.items)

// Most specific match wins, so /admin/posts/123 highlights "Posts", not "Dashboard".
export function activeNavItem(pathname: string) {
  return ADMIN_NAV_ITEMS.filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0]
}
