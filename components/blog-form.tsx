"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { X, Plus, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Editor } from 'primereact/editor';

const blogFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    excerpt: z.string().min(1, "Excerpt is required"),
    content: z.string().min(1, "Content is required"),
    read_time: z.string().min(1, "Read time is required"),
    tags: z.array(z.string()).min(1, "At least one tag is required"),
    url: z.string().min(1, "URL is required"),
    image_url: z.string().min(1, "Image URL is required"),
    is_featured: z.boolean(),
    is_trending: z.boolean(),
    is_popular: z.boolean(),
    is_published: z.boolean(),
})

type BlogFormData = z.infer<typeof blogFormSchema>

export function BlogForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newTag, setNewTag] = useState("")
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<BlogFormData>({
        resolver: zodResolver(blogFormSchema),
        defaultValues: {
            title: "",
            excerpt: "",
            content: "",
            read_time: "",
            tags: [],
            url: "",
            image_url: "",
            is_featured: false,
            is_trending: false,
            is_popular: false,
            is_published: false,
        },
    })

    const watchedTags = watch("tags")
    const watchedIsFeatured = watch("is_featured")
    const watchedIsTrending = watch("is_trending")
    const watchedIsPopular = watch("is_popular")
    const watchedIsPublished = watch("is_published")

    const addTag = () => {
        if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
            setValue("tags", [...watchedTags, newTag.trim()])
            setNewTag("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        setValue("tags", watchedTags.filter(tag => tag !== tagToRemove))
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            addTag()
        }
    }

    const onSubmit = async (data: BlogFormData) => {
        setIsSubmitting(true)
        try {
            const response = await fetch("/api/postblog", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                toast.success("Blog post created successfully!")
                reset()
            } else {
                toast.error("Failed to create blog post")
            }
        } catch (error) {
            toast.error("An error occurred while creating the blog post")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl my-10 mx-auto p-6 space-y-6" style={{ backgroundColor: 'rgb(var(--color-bg-primary))' }}>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'rgb(var(--color-text-primary))' }}>
                    Create New Blog Post
                </h1>
                <p className="text-muted-foreground" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                    Fill in the details below to create a new blog post.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card style={{
                    backgroundColor: 'rgb(var(--color-bg-secondary))',
                    borderColor: 'rgb(var(--color-border-primary))'
                }}>
                    <CardHeader>
                        <CardTitle style={{ color: 'rgb(var(--color-text-primary))' }}>
                            Basic Information
                        </CardTitle>
                        <CardDescription style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                            Essential details about your blog post
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" style={{ color: 'rgb(var(--color-text-primary))' }}>
                                Title *
                            </Label>
                            <Input
                                id="title"
                                placeholder="Enter blog post title"
                                style={{
                                    backgroundColor: 'rgb(var(--color-bg-tertiary))',
                                    borderColor: 'rgb(var(--color-border-primary))',
                                    color: 'rgb(var(--color-text-primary))'
                                }}
                                {...register("title")}
                            />
                            {errors.title && (
                                <p className="text-sm" style={{ color: 'rgb(239 68 68)' }}>
                                    {errors.title.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="excerpt" style={{ color: 'rgb(var(--color-text-primary))' }}>
                                Excerpt (Subtitle) *
                            </Label>
                            <Textarea
                                id="excerpt"
                                placeholder="Enter a brief excerpt or subtitle"
                                className="min-h-[80px]"
                                style={{
                                    backgroundColor: 'rgb(var(--color-bg-tertiary))',
                                    borderColor: 'rgb(var(--color-border-primary))',
                                    color: 'rgb(var(--color-text-primary))'
                                }}
                                {...register("excerpt")}
                            />
                            {errors.excerpt && (
                                <p className="text-sm" style={{ color: 'rgb(239 68 68)' }}>
                                    {errors.excerpt.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content" style={{ color: 'rgb(var(--color-text-primary))' }}>
                                Content *
                            </Label>
                            <div className="card text-white">
                                <Editor value={watch("content")} onTextChange={(e) => setValue("content", e.htmlValue || "")} style={{ height: '320px' }} />
                            </div>

                            {errors.content && (
                                <p className="text-sm" style={{ color: 'rgb(239 68 68)' }}>
                                    {errors.content.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="read_time" style={{ color: 'rgb(var(--color-text-primary))' }}>
                                Read Time *
                            </Label>
                            <Input
                                id="read_time"
                                placeholder="e.g., 5 min read"
                                style={{
                                    backgroundColor: 'rgb(var(--color-bg-tertiary))',
                                    borderColor: 'rgb(var(--color-border-primary))',
                                    color: 'rgb(var(--color-text-primary))'
                                }}
                                {...register("read_time")}
                            />
                            {errors.read_time && (
                                <p className="text-sm" style={{ color: 'rgb(239 68 68)' }}>
                                    {errors.read_time.message}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card style={{
                    backgroundColor: 'rgb(var(--color-bg-secondary))',
                    borderColor: 'rgb(var(--color-border-primary))'
                }}>
                    <CardHeader>
                        <CardTitle style={{ color: 'rgb(var(--color-text-primary))' }}>
                            Tags & URLs
                        </CardTitle>
                        <CardDescription style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                            Add tags and URLs for your blog post
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="tags" style={{ color: 'rgb(var(--color-text-primary))' }}>
                                Tags *
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="tags"
                                    placeholder="Add a tag and press Enter"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    style={{
                                        backgroundColor: 'rgb(var(--color-bg-tertiary))',
                                        borderColor: 'rgb(var(--color-border-primary))',
                                        color: 'rgb(var(--color-text-primary))'
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={addTag}
                                    disabled={!newTag.trim()}
                                    style={{
                                        borderColor: 'rgb(var(--color-border-primary))',
                                        color: 'rgb(var(--color-text-primary))'
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {watchedTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {watchedTags.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="gap-1"
                                            style={{
                                                backgroundColor: 'rgb(var(--color-accent-primary))',
                                                color: 'rgb(var(--color-text-primary))'
                                            }}
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            {errors.tags && (
                                <p className="text-sm" style={{ color: 'rgb(239 68 68)' }}>
                                    {errors.tags.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="url" style={{ color: 'rgb(var(--color-text-primary))' }}>
                                Blog URL *
                            </Label>
                            <Input
                                id="url"
                                placeholder="https://example.com/blog-post"
                                style={{
                                    backgroundColor: 'rgb(var(--color-bg-tertiary))',
                                    borderColor: 'rgb(var(--color-border-primary))',
                                    color: 'rgb(var(--color-text-primary))'
                                }}
                                {...register("url")}
                            />
                            {errors.url && (
                                <p className="text-sm" style={{ color: 'rgb(239 68 68)' }}>
                                    {errors.url.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image_url" style={{ color: 'rgb(var(--color-text-primary))' }}>
                                Featured Image URL *
                            </Label>
                            <Input
                                id="image_url"
                                placeholder="https://example.com/image.jpg"
                                style={{
                                    backgroundColor: 'rgb(var(--color-bg-tertiary))',
                                    borderColor: 'rgb(var(--color-border-primary))',
                                    color: 'rgb(var(--color-text-primary))'
                                }}
                                {...register("image_url")}
                            />
                            {errors.image_url && (
                                <p className="text-sm" style={{ color: 'rgb(239 68 68)' }}>
                                    {errors.image_url.message}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card style={{
                    backgroundColor: 'rgb(var(--color-bg-secondary))',
                    borderColor: 'rgb(var(--color-border-primary))'
                }}>
                    <CardHeader>
                        <CardTitle style={{ color: 'rgb(var(--color-text-primary))' }}>
                            Publishing Options
                        </CardTitle>
                        <CardDescription style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                            Configure the visibility and status of your blog post
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_featured" style={{ color: 'rgb(var(--color-text-primary))' }}>
                                    Featured Post
                                </Label>
                                <p className="text-sm" style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                                    Mark this post as featured on the homepage
                                </p>
                            </div>
                            <Switch
                                id="is_featured"
                                checked={watchedIsFeatured}
                                onCheckedChange={(checked) => setValue("is_featured", checked)}
                                style={{
                                    backgroundColor: watchedIsFeatured ? 'rgb(var(--color-accent-primary))' : 'rgb(var(--color-bg-quaternary))'
                                }}
                            />
                        </div>

                        <Separator style={{ backgroundColor: 'rgb(var(--color-border-primary))' }} />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_trending" style={{ color: 'rgb(var(--color-text-primary))' }}>
                                    Trending Post
                                </Label>
                                <p className="text-sm" style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                                    Mark this post as trending
                                </p>
                            </div>
                            <Switch
                                id="is_trending"
                                checked={watchedIsTrending}
                                onCheckedChange={(checked) => setValue("is_trending", checked)}
                                style={{
                                    backgroundColor: watchedIsTrending ? 'rgb(var(--color-accent-primary))' : 'rgb(var(--color-bg-quaternary))'
                                }}
                            />
                        </div>

                        <Separator style={{ backgroundColor: 'rgb(var(--color-border-primary))' }} />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_popular" style={{ color: 'rgb(var(--color-text-primary))' }}>
                                    Popular Post
                                </Label>
                                <p className="text-sm" style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                                    Mark this post as popular
                                </p>
                            </div>
                            <Switch
                                id="is_popular"
                                checked={watchedIsPopular}
                                onCheckedChange={(checked) => setValue("is_popular", checked)}
                                style={{
                                    backgroundColor: watchedIsPopular ? 'rgb(var(--color-accent-primary))' : 'rgb(var(--color-bg-quaternary))'
                                }}
                            />
                        </div>

                        <Separator style={{ backgroundColor: 'rgb(var(--color-border-primary))' }} />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_published" style={{ color: 'rgb(var(--color-text-primary))' }}>
                                    Published
                                </Label>
                                <p className="text-sm" style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                                    Make this post visible to readers
                                </p>
                            </div>
                            <Switch
                                id="is_published"
                                checked={watchedIsPublished}
                                onCheckedChange={(checked) => setValue("is_published", checked)}
                                style={{
                                    backgroundColor: watchedIsPublished ? 'rgb(var(--color-accent-primary))' : 'rgb(var(--color-bg-quaternary))'
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button
                        type="submit"
                        className="flex-1"
                        disabled={isSubmitting}
                        style={{
                            background: 'var(--gradient-primary)',
                            color: 'rgb(var(--color-text-primary))'
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Create Blog Post
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => reset()}
                        disabled={isSubmitting}
                        style={{
                            borderColor: 'rgb(var(--color-border-primary))',
                            color: 'rgb(var(--color-text-primary))'
                        }}
                    >
                        Reset Form
                    </Button>
                </div>
            </form>
        </div>
    )
} 