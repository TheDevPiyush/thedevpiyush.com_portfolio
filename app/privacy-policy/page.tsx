import { NavigationMenu } from "@/components/navigation-menu"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "rgb(var(--color-bg-primary))" }}>
      <NavigationMenu />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="space-y-3">
            <h1 className="text-4xl font-bold" style={{ color: "rgb(var(--color-text-primary))" }}>
              Privacy Policy
            </h1>
            <p style={{ color: "rgb(var(--color-text-secondary))" }}>
              Effective date: March 20, 2026
            </p>
          </header>

          <section className="space-y-4" style={{ color: "rgb(var(--color-text-secondary))" }}>
            <p>
              This website may collect basic information like your email address and account identifier when you sign
              in or contact me. This information is used only to operate the platform, provide purchases/downloads,
              and improve user experience.
            </p>
            <p>
              Payments are processed through Razorpay. I do not store full card or banking details on this website.
              Please review Razorpay policies for payment-specific data handling.
            </p>
            <p>
              Purchased project files are delivered using time-limited signed URLs. Access links expire automatically
              to help protect paid content.
            </p>
            <p>
              If you want your data deleted or have privacy questions, contact me using the details on the contact
              page.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
