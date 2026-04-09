"use client"

import { useEffect, useMemo, useState } from "react"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminProject {
  id: string
  title: string
  description: string
  long_description: string
  tech_stack: string[]
  features: string[]
  price_inr: number
  github_url?: string | null
  live_url?: string | null
  demo_url?: string | null
  is_featured?: boolean
  is_active?: boolean
  is_sellable?: boolean
  screenshot_urls?: string[] | null
  image_url?: string | null
}

export function ProjectUploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [longDescription, setLongDescription] = useState("")
  const [techStack, setTechStack] = useState("")
  const [features, setFeatures] = useState("")
  const [priceInr, setPriceInr] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [liveUrl, setLiveUrl] = useState("")
  const [demoUrl, setDemoUrl] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [isSellable, setIsSellable] = useState(true)
  const [clearScreenshots, setClearScreenshots] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([])
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [setupGuideFile, setSetupGuideFile] = useState<File | null>(null)
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId),
    [projects, selectedProjectId],
  )

  useEffect(() => {
    const token = Cookies.get("token")
    if (!token) return
    ;(async () => {
      try {
        setIsLoadingProjects(true)
        const response = await fetch("/api/admin/projects", {
          headers: { authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (!response.ok) {
          toast.error(data.error || "Failed to fetch projects")
          return
        }
        setProjects(data.projects || [])
      } catch {
        toast.error("Failed to fetch projects")
      } finally {
        setIsLoadingProjects(false)
      }
    })()
  }, [])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setLongDescription("")
    setTechStack("")
    setFeatures("")
    setPriceInr("")
    setGithubUrl("")
    setLiveUrl("")
    setDemoUrl("")
    setIsFeatured(false)
    setIsActive(true)
    setIsSellable(true)
    setClearScreenshots(false)
    setImageFile(null)
    setScreenshotFiles([])
    setZipFile(null)
    setSetupGuideFile(null)
  }

  const hydrateFormFromProject = (project: AdminProject) => {
    setTitle(project.title || "")
    setDescription(project.description || "")
    setLongDescription(project.long_description || "")
    setTechStack((project.tech_stack || []).join(", "))
    setFeatures((project.features || []).join(", "))
    setPriceInr(String(project.price_inr || ""))
    setGithubUrl(project.github_url || "")
    setLiveUrl(project.live_url || "")
    setDemoUrl(project.demo_url || "")
    setIsFeatured(Boolean(project.is_featured))
    setIsActive(Boolean(project.is_active))
    setIsSellable(Boolean(project.is_sellable))
    setClearScreenshots(false)
    setImageFile(null)
    setScreenshotFiles([])
    setZipFile(null)
    setSetupGuideFile(null)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "create" && !zipFile) {
      toast.error("Please select a ZIP file")
      return
    }
    if (mode === "create" && !imageFile) {
      toast.error("Please select a cover image")
      return
    }
    if (mode === "edit" && !selectedProjectId) {
      toast.error("Please choose a project to edit")
      return
    }

    const token = Cookies.get("token")
    if (!token) {
      toast.error("You must be signed in as admin")
      return
    }

    try {
      setIsSubmitting(true)

      const form = new FormData()
      form.append("title", title)
      form.append("description", description)
      form.append("longDescription", longDescription)
      form.append("techStack", JSON.stringify(techStack.split(",").map((v) => v.trim()).filter(Boolean)))
      form.append("features", JSON.stringify(features.split(",").map((v) => v.trim()).filter(Boolean)))
      form.append("priceInr", priceInr)
      form.append("githubUrl", githubUrl)
      form.append("liveUrl", liveUrl)
      form.append("demoUrl", demoUrl)
      form.append("isFeatured", String(isFeatured))
      form.append("isActive", String(isActive))
      form.append("isSellable", String(isSellable))
      form.append("clearScreenshots", String(clearScreenshots))
      if (mode === "edit") {
        form.append("projectId", selectedProjectId)
      }
      if (zipFile) {
        form.append("zipFile", zipFile)
      }
      if (imageFile) {
        form.append("imageFile", imageFile)
      }
      for (const screenshotFile of screenshotFiles) {
        form.append("screenshotFiles", screenshotFile)
      }
      if (setupGuideFile) {
        form.append("setupGuideFile", setupGuideFile)
      }

      const response = await fetch("/api/admin/projects", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { authorization: `Bearer ${token}` },
        body: form,
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || `Failed to ${mode === "create" ? "upload" : "update"} project`)
        return
      }

      toast.success(mode === "create" ? "Project uploaded successfully" : "Project updated successfully")
      const latestProjectsResponse = await fetch("/api/admin/projects", {
        headers: { authorization: `Bearer ${token}` },
      })
      const latestProjectsData = await latestProjectsResponse.json()
      if (latestProjectsResponse.ok) {
        setProjects(latestProjectsData.projects || [])
      }
      if (mode === "create") {
        resetForm()
      } else if (selectedProjectId) {
        const latest = (latestProjectsData.projects || []).find((project: AdminProject) => project.id === selectedProjectId)
        if (latest) hydrateFormFromProject(latest)
      }
    } catch {
      toast.error(mode === "create" ? "Upload failed" : "Update failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card
      className="backdrop-blur-sm"
      style={{
        backgroundColor: "rgba(var(--color-bg-tertiary), 0.3)",
        border: "1px solid rgba(var(--color-border-primary), 0.5)",
      }}
    >
      <CardHeader>
        <CardTitle style={{ color: "rgb(var(--color-text-primary))" }}>Project Details</CardTitle>
        <CardDescription style={{ color: "rgb(var(--color-text-tertiary))" }}>
          Create new projects or edit existing projects, including replacing ZIP/Markdown/images.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>Mode</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={mode === "create" ? "default" : "outline"}
                className="font-semibold"
                onClick={() => {
                  setMode("create")
                  setSelectedProjectId("")
                  resetForm()
                }}
                style={
                  mode === "create"
                    ? { background: "var(--gradient-secondary)", color: "rgb(var(--color-text-primary))" }
                    : {
                        border: "1px solid rgb(var(--color-border-primary))",
                        color: "rgb(var(--color-text-secondary))",
                        backgroundColor: "rgb(var(--color-bg-secondary))",
                      }
                }
              >
                Create
              </Button>
              <Button
                type="button"
                variant={mode === "edit" ? "default" : "outline"}
                className="font-semibold"
                onClick={() => {
                  setMode("edit")
                  resetForm()
                }}
                disabled={isLoadingProjects}
                style={
                  mode === "edit"
                    ? { background: "var(--gradient-secondary)", color: "rgb(var(--color-text-primary))" }
                    : {
                        border: "1px solid rgb(var(--color-border-primary))",
                        color: "rgb(var(--color-text-secondary))",
                        backgroundColor: "rgb(var(--color-bg-secondary))",
                      }
                }
              >
                Edit Existing
              </Button>
            </div>
          </div>

          {mode === "edit" && (
            <div className="space-y-2">
              <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>Select project</Label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  const id = e.target.value
                  setSelectedProjectId(id)
                  const found = projects.find((project) => project.id === id)
                  if (found) hydrateFormFromProject(found)
                }}
                required
                className="w-full rounded-md px-3 py-2 text-sm"
                style={{
                  backgroundColor: "rgb(var(--color-bg-secondary))",
                  border: "1px solid rgb(var(--color-border-primary))",
                  color: "rgb(var(--color-text-primary))",
                }}
              >
                <option value="" disabled>
                  {isLoadingProjects ? "Loading projects..." : "Choose a project"}
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>Project title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>Short description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>Long description</Label>
            <Textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              required
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>Tech stack (comma-separated)</Label>
            <Input
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              required
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>Features (comma-separated)</Label>
            <Input
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              required
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>Price (INR)</Label>
            <Input
              type="number"
              value={priceInr}
              onChange={(e) => setPriceInr(e.target.value)}
              required
              min="1"
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
              Cover image {mode === "create" ? "" : "(leave empty to keep current)"}
            </Label>
            <Input
              type="file"
              accept="image/*"
              required={mode === "create"}
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
              Screenshots (3-4 recommended)
            </Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setScreenshotFiles(Array.from(e.target.files || []))}
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
            {mode === "edit" && selectedProject && (selectedProject.screenshot_urls || []).length > 0 && (
              <p className="text-xs" style={{ color: "rgb(var(--color-text-tertiary))" }}>
                Existing screenshots: {(selectedProject.screenshot_urls || []).length}
              </p>
            )}
            {mode === "edit" && (
              <label className="flex items-center gap-2 text-sm" style={{ color: "rgb(var(--color-text-secondary))" }}>
                <input
                  type="checkbox"
                  checked={clearScreenshots}
                  onChange={(e) => setClearScreenshots(e.target.checked)}
                />
                Clear existing screenshots
              </label>
            )}
          </div>
          <div className="space-y-2">
            <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
              Project ZIP {mode === "edit" ? "(optional to replace)" : ""}
            </Label>
            <Input
              type="file"
              accept=".zip"
              onChange={(e) => setZipFile(e.target.files?.[0] || null)}
              required={mode === "create"}
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
              Setup guide Markdown (.md) {mode === "edit" ? "(optional to replace)" : "(optional)"}
            </Label>
            <Input
              type="file"
              accept=".md,.markdown,text/markdown,text/plain"
              onChange={(e) => setSetupGuideFile(e.target.files?.[0] || null)}
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>GitHub URL (optional)</Label>
            <Input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>Live URL (optional)</Label>
            <Input
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>Demo URL (optional)</Label>
            <Input
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 text-sm" style={{ color: "rgb(var(--color-text-secondary))" }}>
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: "rgb(var(--color-text-secondary))" }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: "rgb(var(--color-text-secondary))" }}>
              <input type="checkbox" checked={isSellable} onChange={(e) => setIsSellable(e.target.checked)} />
              Sellable
            </label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full hover:opacity-90"
            style={{ background: "var(--gradient-secondary)", color: "rgb(var(--color-text-primary))" }}
          >
            {isSubmitting ? (mode === "create" ? "Uploading..." : "Saving...") : mode === "create" ? "Upload Paid Project" : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
