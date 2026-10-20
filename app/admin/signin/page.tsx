"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { ArrowLeft, Mail, Shield, Terminal, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { supabaseBrowser as supabase } from "@/lib/supabase/browser"
import { useRouter } from '@bprogress/next/app';
import useUser from "@/hooks/use-user"

export default function AdminSignInPage() {
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [showOTP, setShowOTP] = useState(false)
    const [isSendingOTP, setIsSendingOTP] = useState(false)
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)
    const { loadUser } = useUser();
    const router = useRouter();

    const handleSendOTP = async () => {
        setIsSendingOTP(true)
        const { data, error } = await supabase.auth.signInWithOtp({ email: email })

        if (error) {
            toast.error(error.message)
        }

        if (data) {
            setShowOTP(true)
            toast.success("OTP sent successfully!")
        }
        setIsSendingOTP(false)
    }

    const handleVerifyOTP = async () => {
        setIsVerifyingOTP(true)
        const { data, error } = await supabase.auth.verifyOtp({
            email: email,
            token: otp,
            type: "email"
        })

        if (error) {
            toast.error(error.message)
            setIsVerifyingOTP(false)
            return;
        }

        if (data) {
            toast.success("OTP verified successfully!")
            await loadUser();
            router.push("/");
        }
        setIsVerifyingOTP(false)
    }
    const handleBackToEmail = () => {
        setShowOTP(false)
        setOtp("")
    }

    const handleResendOTP = async () => {
        if (isSendingOTP) return
        handleSendOTP();
    }


    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'rgb(var(--color-bg-primary))' }}>
            <div className="w-full max-w-md rounded-lg py-7" style={{ backgroundColor: 'rgb(var(--color-bg-secondary))', border: '1px solid rgb(var(--color-border-primary))' }}>
                {/* Back Button - Only show when OTP is visible */}
                {showOTP && (
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={handleBackToEmail}
                            className="flex items-center space-x-2 hover:bg-opacity-80"
                            style={{ color: 'rgb(var(--color-text-secondary))' }}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to email</span>
                        </Button>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Terminal className="h-8 w-8 mr-2" style={{ color: 'rgb(var(--color-primary-light))' }} />
                        <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>
                            Admin Portal
                        </h1>
                    </div>
                    <p className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                        {showOTP ? "Enter verification code" : "Sign in to access admin dashboard"}
                    </p>
                </div>

                {/* Form Container */}
                <div className="backdrop-blur-sm rounded-lg p-6" style={{ backgroundColor: 'rgba(var(--color-bg-tertiary), 0.3)', border: '1px solid rgba(var(--color-border-primary), 0.5)' }}>
                    {!showOTP ? (
                        /* Email Form */
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--color-text-primary))' }}>
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(var(--color-text-tertiary))' }} />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your admin email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        style={{
                                            backgroundColor: 'rgba(var(--color-bg-quaternary), 0.3)',
                                            border: '1px solid rgba(var(--color-border-primary), 0.5)',
                                            color: 'rgb(var(--color-text-primary))'
                                        }}
                                        onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSendOTP}
                                disabled={!email || !email.includes("@") || isSendingOTP}
                                className="w-full hover:opacity-90"
                                style={{ background: 'var(--gradient-secondary)', color: 'rgb(var(--color-text-primary))' }}
                            >
                                {isSendingOTP ? (
                                    <div className="flex items-center">
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Sending OTP...
                                    </div>
                                ) : (
                                    "Send OTP"
                                )}
                            </Button>
                        </div>
                    ) : (
                        /* OTP Form */
                        <div className="space-y-2">
                            <div className="text-center">
                                <p className="text-sm flex items-center justify-center" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                                    <Shield className="h-6 w-6 mr-2" style={{ color: 'rgb(var(--color-primary-light))' }} />
                                    We've sent a 6-digit code to
                                </p>
                                <p className="font-medium" style={{ color: 'rgb(var(--color-primary-light))' }}>{email}</p>
                            </div>

                            <div className="space-y-4 flex justify-center items-center flex-col">
                                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                    <InputOTPGroup>
                                        <InputOTPSlot className="border-2 text-white border-[rgb(var(--color-primary-light))]" index={0} />
                                        <InputOTPSlot className="border-2 text-white border-[rgb(var(--color-primary-light))]" index={1} />
                                        <InputOTPSlot className="border-2 text-white border-[rgb(var(--color-primary-light))]" index={2} />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup>
                                        <InputOTPSlot className="border-2 text-white border-[rgb(var(--color-primary-light))]" index={3} />
                                        <InputOTPSlot className="border-2 text-white border-[rgb(var(--color-primary-light))]" index={4} />
                                        <InputOTPSlot className="border-2 text-white border-[rgb(var(--color-primary-light))]" index={5} />
                                    </InputOTPGroup>
                                </InputOTP>

                                <Button
                                    onClick={handleVerifyOTP}
                                    disabled={!otp || otp.length !== 6 || isVerifyingOTP}
                                    className="w-full hover:opacity-90"
                                    style={{ background: 'var(--gradient-secondary)', color: 'rgb(var(--color-text-primary))' }}
                                >
                                    {isVerifyingOTP ? (
                                        <div className="flex items-center">
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Verifying...
                                        </div>
                                    ) : (
                                        "Verify & Sign In"
                                    )}
                                </Button>
                            </div>

                            <div className="text-center">
                                <button
                                    onClick={handleResendOTP}
                                    disabled={isSendingOTP}
                                    className="text-sm underline underline-offset-2 hover:opacity-80 transition-opacity"
                                    style={{ color: 'rgb(var(--color-primary-light))' }}
                                >
                                    {isSendingOTP ? "Resending..." : "Resend OTP"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs" style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                        Secure admin authentication
                    </p>
                </div>
            </div>
        </div>
    )
}
