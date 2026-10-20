"use client"

import { useEffect, useRef } from "react"
import { animate, useInView, useReducedMotion } from "motion/react"

// Splits values like "15+", "1.2k" or "₹40,000" into prefix, number and suffix.
function parse(value: string) {
  const match = value.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/)
  if (!match) return null
  const [, prefix, number, suffix] = match
  const decimals = number.includes(".") ? number.split(".")[1].length : 0
  return { prefix, target: Number(number.replace(/,/g, "")), suffix, decimals, grouped: number.includes(",") }
}

// Counts from 0 to the numeric part of `value` the first time it scrolls into view.
// Non-numeric values render as-is.
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" })
  const reduce = useReducedMotion()
  const parsed = parse(value)

  useEffect(() => {
    if (!inView || !parsed || reduce || !ref.current) return
    const node = ref.current
    const format = (n: number) =>
      parsed.prefix +
      (parsed.grouped
        ? n.toLocaleString("en-IN", { minimumFractionDigits: parsed.decimals, maximumFractionDigits: parsed.decimals })
        : n.toFixed(parsed.decimals)) +
      parsed.suffix
    const controls = animate(0, parsed.target, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => {
        node.textContent = format(n)
      },
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value])

  // Server and no-JS render the final value, so there is no layout shift or flash of "0".
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}
