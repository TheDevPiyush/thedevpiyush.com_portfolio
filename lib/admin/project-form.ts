import type { ProjectFormValues } from "./schemas"
import type { AdminProject } from "./queries"

export const EMPTY_PROJECT: ProjectFormValues = {
  title: "",
  description: "",
  long_description: "",
  category: "",
  tech_stack: [],
  features: [],
  stats: [],
  github_url: "",
  live_url: "",
  demo_url: "",
  image_url: "",
  screenshot_urls: [],
  is_active: true,
  is_featured: false,
  is_sellable: false,
  price_inr: "",
  download_file_path: "",
  setup_guide_file_path: "",
}

export function projectToForm(project: AdminProject): ProjectFormValues {
  const stats = project.stats && typeof project.stats === "object" ? (project.stats as Record<string, unknown>) : {}
  return {
    title: project.title ?? "",
    description: project.description ?? "",
    long_description: project.long_description ?? "",
    category: project.category ?? "",
    tech_stack: project.tech_stack ?? [],
    features: project.features ?? [],
    stats: Object.entries(stats).map(([key, value]) => ({ key, value: String(value) })),
    github_url: project.github_url ?? "",
    live_url: project.live_url ?? "",
    demo_url: project.demo_url ?? "",
    image_url: project.image_url ?? "",
    screenshot_urls: project.screenshot_urls ?? [],
    is_active: project.is_active,
    is_featured: project.is_featured,
    is_sellable: Boolean(project.is_sellable),
    price_inr: project.price_inr ? Number(project.price_inr) : "",
    download_file_path: project.download_file_path ?? "",
    setup_guide_file_path: project.setup_guide_file_path ?? "",
  }
}
