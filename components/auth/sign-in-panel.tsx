"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useRouter } from "@bprogress/next/app"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, LogOut, Mail } from "lucide-react"
import { toast } from "sonner"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { supabaseBrowser } from "@/lib/supabase/browser"
import { useUserStore } from "@/lib/useStore"
import useUser from "@/hooks/use-user"
import { cn } from "@/lib/utils"

const OTP_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 30
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface SignInPanelProps {
  title: string
  description: string
  // Where to go after a successful sign-in (already validated by the page).
  nextPath: string
  showGoogle?: boolean
  initialError?: string
}

type Step = "email" | "code"

export function SignInPanel({ title, description, nextPath, showGoogle = true, initialError }: SignInPanelProps) {
  const router = useRouter()
  const { loadUser } = useUser()
  const signedInEmail = useUserStore((state) => state.email)
  const isAuthLoading = useUserStore((state) => state.isAuthLoading)
  const clearUser = useUserStore((state) => state.clearUser)

  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState(initialError ?? "")
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [shakeKey, setShakeKey] = useState(0)
  const emailInputRef = useRef<HTMLInputElement>(null)

  const isBusy = isSending || isVerifying || isGoogleLoading
  const isEmailValid = EMAIL_PATTERN.test(email.trim())

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const sendCode = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Enter a valid email address.")
      return
    }

    setError("")
    setIsSending(true)
    const { error: sendError } = await supabaseBrowser.auth.signInWithOtp({
      email: normalizedEmail,
      options: { shouldCreateUser: true },
    })
    setIsSending(false)

    if (sendError) {
      setError(sendError.message)
      return
    }

    setEmail(normalizedEmail)
    setCode("")
    setStep("code")
    setCooldown(RESEND_COOLDOWN_SECONDS)
    toast.success(`Code sent to ${normalizedEmail}`)
  }

  const verifyCode = async (token: string) => {
    if (token.length !== OTP_LENGTH || isVerifying) return

    setError("")
    setIsVerifying(true)
    const { error: verifyError } = await supabaseBrowser.auth.verifyOtp({ email, token, type: "email" })

    if (verifyError) {
      setIsVerifying(false)
      setCode("")
      setShakeKey((key) => key + 1)
      setError(verifyError.message.toLowerCase().includes("expired") ? "That code is invalid or has expired." : verifyError.message)
      return
    }

    await loadUser()
    toast.success("Signed in")
    router.replace(nextPath)
    router.refresh()
  }

  const signInWithGoogle = async () => {
    setError("")
    setIsGoogleLoading(true)
    const callbackUrl = new URL("/auth/callback", window.location.origin)
    callbackUrl.searchParams.set("next", nextPath)

    const { error: oauthError } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    })

    // On success the browser is already navigating to Google, so keep the spinner.
    if (oauthError) {
      setIsGoogleLoading(false)
      setError(oauthError.message)
    }
  }

  const signOut = async () => {
    await supabaseBrowser.auth.signOut()
    clearUser()
    router.refresh()
  }

  const backToEmail = () => {
    setStep("email")
    setCode("")
    setError("")
    requestAnimationFrame(() => emailInputRef.current?.focus())
  }

  const onEmailSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!isBusy) sendCode()
  }

  const isSignedIn = !isAuthLoading && Boolean(signedInEmail)

  return (
    <div className="relative w-full max-w-[420px]">
      {/* Soft accent glow behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -top-16 h-56 rounded-full bg-[rgb(var(--color-primary)/0.18)] blur-3xl"
      />

      <div className="relative overflow-hidden rounded-2xl border border-[rgb(var(--color-border-primary)/0.7)] bg-[rgb(var(--color-bg-secondary)/0.75)] shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgb(var(--color-primary-light)/0.7)] to-transparent" />

        <div className="px-6 py-8 sm:px-8">
          {isSignedIn ? (
            <SignedInState email={signedInEmail} onContinue={() => router.replace(nextPath)} onSignOut={signOut} />
          ) : (
            <>
              {/* Header */}
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[rgb(var(--color-border-primary)/0.8)] bg-[rgb(var(--color-bg-tertiary)/0.6)]">
                  {step === "email" ? (
                    <Mail className="h-5 w-5 text-[rgb(var(--color-primary-light))]" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-[rgb(var(--color-primary-light))]" />
                  )}
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--color-text-primary))]">
                  {step === "email" ? title : "Check your inbox"}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--color-text-tertiary))]">
                  {step === "email" ? (
                    description
                  ) : (
                    <>
                      We sent a {OTP_LENGTH}-digit code to{" "}
                      <span className="font-medium text-[rgb(var(--color-text-primary))]">{email}</span>
                    </>
                  )}
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300 animate-in fade-in-0 slide-in-from-top-1"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {step === "email" ? (
                <div key="email" className="space-y-5 animate-in fade-in-0 slide-in-from-left-2 duration-300">
                  {showGoogle && (
                    <>
                      <button
                        type="button"
                        onClick={signInWithGoogle}
                        disabled={isBusy}
                        className="group flex h-11 w-full items-center justify-center gap-3 rounded-xl bg-white text-sm font-medium text-slate-900 shadow-sm transition-all hover:bg-slate-100 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary-light))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-bg-secondary))] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                        {isGoogleLoading ? "Redirecting to Google…" : "Continue with Google"}
                      </button>

                      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-[rgb(var(--color-text-muted))]">
                        <span className="h-px flex-1 bg-[rgb(var(--color-border-primary)/0.8)]" />
                        or use email
                        <span className="h-px flex-1 bg-[rgb(var(--color-border-primary)/0.8)]" />
                      </div>
                    </>
                  )}

                  <form onSubmit={onEmailSubmit} className="space-y-3" noValidate>
                    <label htmlFor="signin-email" className="sr-only">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--color-text-muted))]" />
                      <input
                        ref={emailInputRef}
                        id="signin-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoFocus={!showGoogle}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value)
                          if (error) setError("")
                        }}
                        disabled={isBusy}
                        className="h-11 w-full rounded-xl border border-[rgb(var(--color-border-secondary)/0.7)] bg-[rgb(var(--color-bg-primary)/0.6)] pl-10 pr-3 text-sm text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-muted))] transition-colors focus:border-[rgb(var(--color-primary-light))] focus:outline-none focus:ring-4 focus:ring-[rgb(var(--color-primary)/0.2)] disabled:opacity-60"
                      />
                    </div>
                    <PrimaryButton type="submit" disabled={!isEmailValid || isBusy}>
                      {isSending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending code…
                        </>
                      ) : (
                        <>
                          Email me a sign-in code
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </PrimaryButton>
                  </form>
                </div>
              ) : (
                <div key="code" className="space-y-6 animate-in fade-in-0 slide-in-from-right-2 duration-300">
                  <div key={shakeKey} className={cn("flex justify-center", shakeKey > 0 && "animate-shake motion-reduce:animate-none")}>
                    <InputOTP
                      maxLength={OTP_LENGTH}
                      value={code}
                      onChange={(value) => {
                        setCode(value)
                        if (error) setError("")
                      }}
                      onComplete={verifyCode}
                      pattern={REGEXP_ONLY_DIGITS}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      disabled={isVerifying}
                      aria-label="Sign-in code"
                      containerClassName="[--ring:263_70%_76%] [--foreground:0_0%_100%]"
                    >
                      <InputOTPGroup className="gap-2 sm:gap-2.5">
                        {Array.from({ length: OTP_LENGTH }, (_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className={cn(
                              "h-12 w-11 rounded-xl border border-[rgb(var(--color-border-secondary)/0.8)] bg-[rgb(var(--color-bg-primary)/0.6)] text-lg font-semibold text-[rgb(var(--color-text-primary))] ring-offset-0 first:rounded-xl first:border last:rounded-xl sm:h-14 sm:w-12",
                              error && "border-red-500/60",
                            )}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <PrimaryButton
                    type="button"
                    onClick={() => verifyCode(code)}
                    disabled={code.length !== OTP_LENGTH || isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      "Verify & sign in"
                    )}
                  </PrimaryButton>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={backToEmail}
                      disabled={isVerifying}
                      className="inline-flex items-center gap-1.5 text-[rgb(var(--color-text-tertiary))] transition-colors hover:text-[rgb(var(--color-text-primary))] disabled:opacity-50"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Change email
                    </button>
                    <button
                      type="button"
                      onClick={sendCode}
                      disabled={cooldown > 0 || isBusy}
                      aria-live="polite"
                      className="font-medium text-[rgb(var(--color-primary-light))] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:text-[rgb(var(--color-text-muted))] disabled:hover:opacity-100"
                    >
                      {isSending ? "Sending…" : cooldown > 0 ? `Resend in 0:${String(cooldown).padStart(2, "0")}` : "Resend code"}
                    </button>
                  </div>

                  <p className="text-center text-xs text-[rgb(var(--color-text-muted))]">
                    Can&apos;t find it? Check your spam folder. Codes expire after a few minutes.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-[rgb(var(--color-text-muted))]">
        By continuing you agree to the{" "}
        <a href="/privacy-policy" className="underline underline-offset-2 hover:text-[rgb(var(--color-text-secondary))]">
          privacy policy
        </a>
        .
      </p>
    </div>
  )
}

function SignedInState({ email, onContinue, onSignOut }: { email: string; onContinue: () => void; onSignOut: () => void }) {
  return (
    <div className="text-center animate-in fade-in-0 duration-300">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--color-primary)/0.15)] text-lg font-semibold text-[rgb(var(--color-primary-light))]">
        {email.charAt(0).toUpperCase()}
      </div>
      <h1 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">You&apos;re signed in</h1>
      <p className="mt-1 text-sm text-[rgb(var(--color-text-tertiary))]">{email}</p>
      <div className="mt-6 space-y-3">
        <PrimaryButton type="button" onClick={onContinue}>
          Continue
          <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
        <button
          type="button"
          onClick={onSignOut}
          className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--color-text-tertiary))] transition-colors hover:text-[rgb(var(--color-text-primary))]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Use a different account
        </button>
      </div>
    </div>
  )
}

function PrimaryButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "group flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-white shadow-lg shadow-[rgb(var(--color-primary)/0.25)] transition-all [background:var(--gradient-secondary)] hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary-light))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-bg-secondary))] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:brightness-100",
        className,
      )}
    />
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l4.01-3.1z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.28 6.61l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z" />
    </svg>
  )
}
