import { PostEditor } from "@/components/admin/post-editor"
import { getAllPostTags } from "@/lib/admin/queries"

export const metadata = { title: "New post" }

export default async function NewPostPage() {
  return (
    <PostEditor
      id={null}
      updatedAt={null}
      legacyHtml={null}
      tagSuggestions={await getAllPostTags()}
      initial={{
        title: "",
        slug: "",
        excerpt: "",
        content_md: "",
        tags: [],
        image_url: "",
        is_published: false,
        publish_date: new Date().toISOString(),
        is_featured: false,
        seo_title: "",
        seo_description: "",
      }}
    />
  )
}
