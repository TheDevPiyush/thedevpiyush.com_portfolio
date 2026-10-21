import { ProfileForm } from "@/components/admin/profile-form"
import { AdminPageHeader } from "@/components/admin/page-header"
import { getAdminProfile } from "@/lib/admin/queries"

export const metadata = { title: "Profile" }

export default async function ProfilePage() {
  const profile = await getAdminProfile()
  const value = (field: string) => ((profile as Record<string, unknown> | null)?.[field] as string | null | undefined) ?? ""

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Profile" description="Your name, bio, photo, About page story and social links." />
      <ProfileForm
        initial={{
          name: value("name"),
          title: value("title"),
          location: value("location"),
          email: value("email"),
          phone: value("phone"),
          working_at: value("working_at"),
          bio: value("bio"),
          about_me: value("about_me"),
          story: value("story"),
          philosophy: value("philosophy"),
          image: value("image"),
          github_url: value("github_url"),
          linkedin_url: value("linkedin_url"),
          twitter_url: value("twitter_url"),
          discord_handle: value("discord_handle"),
        }}
      />
    </div>
  )
}
