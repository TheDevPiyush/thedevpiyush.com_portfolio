import { AdminPageHeader, MigrationNotice } from "@/components/admin/page-header"
import { InboxView } from "@/components/admin/inbox"
import { getMessages } from "@/lib/admin/queries"

export const metadata = { title: "Inbox" }

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams
  const result = await getMessages().then(
    (messages) => ({ messages, missing: false }),
    () => ({ messages: [], missing: true }),
  )

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title="Inbox" description="Messages sent through the contact form. Replies open in your email app." />
      {result.missing && <MigrationNotice file="0002_contact_messages.sql" />}
      <InboxView messages={result.messages} initialId={message} />
    </div>
  )
}
