import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/lib/providers/provider"
import localFont from "next/font/local";

const myFont = localFont({
  src: "./../public/fonts/Hellix-Regular.ttf",
  display: 'swap',
  variable: "--font-hellix",
})

export const metadata: Metadata = {
  title: {
    default: "TheDevPiyush - Full-Stack Developer || Portfolio",
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
  alternates: {
    canonical: 'https://thedevpiyush.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thedevpiyush.com',
    siteName: 'TheDevPiyush',
    title: 'TheDevPiyush - Full-Stack Portfolio',
    description: 'Portfolio of Piyush Choudhary, a passionate Full-Stack & Blockchain Developer. Explore my projects, blog posts, and technical expertise.',
    images: [
      {
        url: 'https://thedevpiyush.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TheDevPiyush - Full-Stack Portfolio',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@thedevpiyush',
    creator: '@thedevpiyush',
    title: 'TheDevPiyush - Full-Stack Portfolio',
    description: 'Portfolio of Piyush Choudhary, a passionate Full-Stack & Blockchain Developer.',
    images: ['https://thedevpiyush.com/og-image.jpg'],
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
    <html lang="en" className={`${myFont.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`bg-black text-green-400 antialiased preview-scroll ${myFont.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
