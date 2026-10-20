"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { cn } from "@/lib/utils"

export const EASE_OUT = [0.22, 1, 0.36, 1] as const

function itemVariants(reduce: boolean | null, delay = 0): Variants {
  if (reduce) {
    return { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3, delay } } }
  }
  return {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE_OUT, delay } },
  }
}

type Tag = "div" | "section" | "ul" | "ol" | "li" | "header" | "article" | "p" | "span"

interface RevealProps {
  children: ReactNode
  className?: string
  as?: Tag
  delay?: number
  /** Seconds between children wrapped in <RevealItem>. */
  stagger?: number
  /** Above-the-fold content: plays a CSS animation on first paint instead of waiting for hydration. */
  immediate?: boolean
}

// Fade + blur-up when the element enters the viewport. Wrap children in <RevealItem> to stagger them.
export function Reveal({ children, className, as = "div", delay = 0, stagger, immediate = false }: RevealProps) {
  const reduce = useReducedMotion()

  if (immediate) {
    const Tag = as
    return (
      <Tag className={cn("animate-fade-up motion-reduce:animate-none", className)} style={{ animationDelay: `${delay}s` }}>
        {children}
      </Tag>
    )
  }

  const Component = motion[as]
  const variants: Variants = stagger
    ? { hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay } } }
    : itemVariants(reduce, delay)

  return (
    <Component
      className={className}
      initial="hidden"
      variants={variants}
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </Component>
  )
}

export function RevealItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: Tag }) {
  const reduce = useReducedMotion()
  const Component = motion[as]
  return (
    <Component className={className} variants={itemVariants(reduce)}>
      {children}
    </Component>
  )
}
