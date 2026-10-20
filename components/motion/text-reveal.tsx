import { cn } from "@/lib/utils"

interface TextRevealProps {
  text: string
  className?: string
  /** Seconds before the first word starts. */
  delay?: number
  as?: "h1" | "h2" | "p" | "span"
  /** Words from this index on are set in italic, e.g. the surname in the hero. */
  italicFrom?: number
}

// Word-by-word rise for headlines, in CSS so it plays on first paint. Screen readers get the
// whole string once via aria-label.
export function TextReveal({ text, className, delay = 0, as: Component = "h1", italicFrom }: TextRevealProps) {
  const words = text.split(" ")

  return (
    <Component className={className} aria-label={text}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <span
            className={cn(
              "inline-block animate-rise motion-reduce:animate-none",
              italicFrom !== undefined && index >= italicFrom && "italic",
            )}
            style={{ animationDelay: `${delay + index * 0.07}s` }}
          >
            {word}
          </span>
          {index < words.length - 1 && " "}
        </span>
      ))}
    </Component>
  )
}
