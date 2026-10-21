import crypto from "crypto"
import { ProjectEditor } from "@/components/admin/project-editor"
import { getProjectCategories } from "@/lib/admin/queries"
import { EMPTY_PROJECT } from "@/lib/admin/project-form"

export const metadata = { title: "New project" }

export default async function NewProjectPage() {
  // The id exists before the first save so uploads can be filed under it.
  return <ProjectEditor id={crypto.randomUUID()} isNew initial={EMPTY_PROJECT} categories={await getProjectCategories()} purchases={0} />
}
