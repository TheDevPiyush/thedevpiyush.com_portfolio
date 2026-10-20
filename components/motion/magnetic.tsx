"use client"

import { useRef, type ReactNode } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"

// Pulls its child slightly toward the cursor. Used on primary CTAs only.
export function Magnetic({ children, strength = 0.25 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15, mass: 0.2 })
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15, mass: 0.2 })

  if (reduce) return <>{children}</>

  return (
    <motion.div
      ref={ref}
      className="inline-block"
      style={{ x, y }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse" || !ref.current) return
        const rect = ref.current.getBoundingClientRect()
        x.set((event.clientX - (rect.left + rect.width / 2)) * strength)
        y.set((event.clientY - (rect.top + rect.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}
