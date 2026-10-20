import { Reveal, RevealItem } from "@/components/motion/reveal"
import type { Skill } from "@/lib/data/portfolio"

// Skills grouped by category as quiet chips. No percentage bars.
export function SkillsGrid({ skills }: { skills: Skill[] }) {
  const groups = new Map<string, Skill[]>()
  for (const skill of skills) {
    groups.set(skill.category, [...(groups.get(skill.category) ?? []), skill])
  }

  return (
    <Reveal as="ul" stagger={0.05} className="grid gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {[...groups].map(([category, items]) => (
        <RevealItem as="li" key={category} className="space-y-4 bg-background p-6 sm:p-8">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{category}</h3>
          <ul className="flex flex-wrap gap-2">
            {items.map((skill) => (
              <li
                key={skill.name}
                className="rounded-full border bg-background px-3 py-1 text-sm transition-colors hover:border-brand/50 hover:bg-brand/5"
              >
                {skill.name}
              </li>
            ))}
          </ul>
        </RevealItem>
      ))}
    </Reveal>
  )
}
