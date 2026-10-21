"use client"

import { useActionState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { sendContactMessage, type ContactFormState } from "./actions"

const fieldClass =
  "w-full rounded-2xl border bg-background px-4 py-3 text-[15px] outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus:border-brand focus:ring-4 focus:ring-brand/15 aria-[invalid=true]:border-destructive"

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(sendContactMessage, { status: "idle" })
  const fieldErrors = state.status === "error" ? state.fieldErrors ?? {} : {}
  const values = state.status === "error" ? state.values ?? {} : {}

  return (
    <div className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-brand/20 via-brand-2/10 to-brand-3/15 blur-3xl"
      />
      <AnimatePresence mode="wait" initial={false}>
        {state.status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="gradient-border flex min-h-[420px] flex-col items-start justify-center gap-5 rounded-3xl bg-card p-8 shadow-2xl shadow-brand/[0.08] sm:p-10"
            role="status"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <h2 className="text-4xl tracking-tight">Message sent.</h2>
            <p className="max-w-sm text-muted-foreground">
              Thanks for reaching out! I read every message and usually reply within a day.
            </p>
            <Button variant="outline" size="pill" onClick={() => window.location.reload()}>
              Send another
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            action={formAction}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="gradient-border relative space-y-5 rounded-3xl bg-card p-6 shadow-2xl shadow-brand/[0.08] sm:p-10"
            noValidate
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" name="name" error={fieldErrors.name}>
                <input id="name" name="name" defaultValue={values.name} required autoComplete="name" placeholder="Jane Doe" className={fieldClass} aria-invalid={Boolean(fieldErrors.name)} />
              </Field>
              <Field label="Email" name="email" error={fieldErrors.email}>
                <input id="email" name="email" defaultValue={values.email} type="email" required autoComplete="email" placeholder="jane@company.com" className={fieldClass} aria-invalid={Boolean(fieldErrors.email)} />
              </Field>
            </div>
            <Field label="Subject" name="subject" optional error={fieldErrors.subject}>
              <input id="subject" name="subject" defaultValue={values.subject} placeholder="Project, role, or just hello" className={fieldClass} aria-invalid={Boolean(fieldErrors.subject)} />
            </Field>
            <Field label="Message" name="message" error={fieldErrors.message}>
              <textarea
                id="message"
                name="message"
                defaultValue={values.message}
                required
                rows={6}
                placeholder="Tell me a bit about what you have in mind…"
                className={cn(fieldClass, "resize-y")}
                aria-invalid={Boolean(fieldErrors.message)}
              />
            </Field>

            {/* Honeypot for bots; hidden from people and assistive tech. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            {state.status === "error" && (
              <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {state.message}
              </p>
            )}

            <Button type="submit" variant="brand" size="pill" disabled={pending} className="group w-full sm:w-auto">
              {pending ? <Loader2 className="animate-spin" /> : null}
              {pending ? "Sending…" : "Send message"}
              {!pending && <ArrowRight className="transition-transform group-hover:translate-x-0.5" />}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({
  label,
  name,
  optional,
  error,
  children,
}: {
  label: string
  name: string
  optional?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="flex items-baseline justify-between text-sm font-medium">
        {label}
        {optional && <span className="text-xs font-normal text-muted-foreground">Optional</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
