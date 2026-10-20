import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"
import "./globals.css"
import Providers from "@/lib/providers/provider"
import { ThemeProvider } from "@/components/theme-provider"

const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" })
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
}

export const metadata: Metadata = {
  title: {
    default: "Piyush Choudhary · Full-Stack Developer",
    template: "%s | TheDevPiyush"
  },
  description: "Portfolio of Piyush Choudhary, a passionate Full-Stack Developer. Explore my projects, blog posts, and technical expertise in modern web development.",
  keywords: [
    "Piyush Choudhary",
    "Piyush",
    "Piyush Choudhary Portfolio",
    "Piyush Portfolio",
    "thedevpiyush",
    "Full-Stack Developer",
    "Blockchain Developer",
    "React Developer",
    "Next.js Developer",
    "TypeScript Developer",
    "Web Development",
    "Portfolio",
    "Software Engineer"
  ],
  authors: [{ name: "Piyush Choudhary" }],
  creator: "Piyush Choudhary",
  publisher: "TheDevPiyush",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://thedevpiyush.com'),
  // Each page sets its own canonical; a root-level one would mark every page as a duplicate of home.
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thedevpiyush.com',
    siteName: 'TheDevPiyush',
    title: 'TheDevPiyush - Full-Stack Portfolio',
    description: 'Portfolio of Piyush Choudhary, a passionate Full-Stack & Blockchain Developer. Explore my projects, blog posts, and technical expertise.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@thedevpiyush',
    creator: '@thedevpiyush',
    title: 'TheDevPiyush - Full-Stack Portfolio',
    description: 'Portfolio of Piyush Choudhary, a passionate Full-Stack & Blockchain Developer.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
