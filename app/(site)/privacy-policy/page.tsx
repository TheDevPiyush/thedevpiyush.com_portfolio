import type { Metadata } from "next"
import { Container, PageHeader } from "@/components/site/section"

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What data thedevpiyush.com collects and how it is used.",
  alternates: { canonical: "/privacy-policy" },
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy policy" lede="Effective date: March 20, 2026" />
      <Container className="max-w-3xl border-t pb-24 pt-12">
        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-normal">
          <p>
            This website may collect basic information like your email address and account identifier when you sign in
            or contact me. This information is used only to operate the platform, provide purchases and downloads, and
            improve the experience.
          </p>
          <p>
            Messages sent through the contact form are stored so I can reply to them. To prevent spam, a one-way hash of
            your IP address is stored alongside the message; the IP address itself is never stored.
          </p>
          <p>
            Payments are processed through Razorpay. I do not store full card or banking details on this website. Please
            review Razorpay&apos;s policies for payment-specific data handling.
          </p>
          <p>
            Purchased project files are delivered using time-limited signed URLs. Access links expire automatically to
            help protect paid content.
          </p>
          <p>
            If you want your data deleted or have privacy questions, contact me using the details on the{" "}
            <a href="/contact">contact page</a>.
          </p>
        </div>
      </Container>
    </>
  )
}
