"use client"

import { useState } from "react"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ProjectUploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [longDescription, setLongDescription] = useState("")
  const [techStack, setTechStack] = useState("")
  const [features, setFeatures] = useState("")
  const [priceInr, setPriceInr] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [zipFile, setZipFile] = useState<File | null>(null)

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setLongDescription("")
    setTechStack("")
    setFeatures("")
    setPriceInr("")
    setImageUrl("")
    setZipFile(null)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!zipFile) {
      toast.error("Please select a ZIP file")
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
      form.append("imageUrl", imageUrl)
      form.append("isFeatured", "false")
      form.append("isActive", "true")
      form.append("zipFile", zipFile)

      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        body: form,
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to upload project")
        return
      }

      toast.success("Project uploaded successfully")
      resetForm()
    } catch {
      toast.error("Upload failed")
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
          Fill all fields to publish a paid project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label style={{ color: "rgb(var(--color-text-primary))" }}>Project title</Label>
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
            <Label style={{ color: "rgb(var(--color-text-primary))" }}>Short description</Label>
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
            <Label style={{ color: "rgb(var(--color-text-primary))" }}>Long description</Label>
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
            <Label style={{ color: "rgb(var(--color-text-primary))" }}>Tech stack (comma-separated)</Label>
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
            <Label style={{ color: "rgb(var(--color-text-primary))" }}>Features (comma-separated)</Label>
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
            <Label style={{ color: "rgb(var(--color-text-primary))" }}>Price (INR)</Label>
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
            <Label style={{ color: "rgb(var(--color-text-primary))" }}>Image URL</Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
          </div>
          <div className="space-y-2">
            <Label style={{ color: "rgb(var(--color-text-primary))" }}>Project ZIP</Label>
            <Input
              type="file"
              accept=".zip"
              onChange={(e) => setZipFile(e.target.files?.[0] || null)}
              required
              style={{
                backgroundColor: "rgb(var(--color-bg-secondary))",
                borderColor: "rgb(var(--color-border-primary))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full hover:opacity-90"
            style={{ background: "var(--gradient-secondary)", color: "rgb(var(--color-text-primary))" }}
          >
            {isSubmitting ? "Uploading..." : "Upload Paid Project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
