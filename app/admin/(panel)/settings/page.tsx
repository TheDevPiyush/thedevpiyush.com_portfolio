import { SettingsForm } from "@/components/admin/settings-form"
import { AdminPageHeader, MigrationNotice } from "@/components/admin/page-header"
import { getAdminProfile, getAdminSettings } from "@/lib/admin/queries"

export const metadata = { title: "Settings" }

export default async function SettingsPage() {
  const [{ settings, missingTable }, profile] = await Promise.all([getAdminSettings(), getAdminProfile()])

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Settings" description="Site-wide options. Changes show on the site within seconds." />
      {missingTable && <MigrationNotice file="0004_admin.sql" />}
      <SettingsForm initial={settings} workingAt={profile?.working_at ?? ""} />
    </div>
  )
}
