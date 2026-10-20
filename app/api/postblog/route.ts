import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth/server-auth"
import { supabaseServer } from "@/lib/supabase/server"

// Only these columns can be written from the blog form.
const blogPostSchema = z.object({
    title: z.string().trim().min(1),
    excerpt: z.string().trim().min(1),
    content: z.string().min(1),
    read_time: z.string().trim().min(1),
    tags: z.array(z.string().trim().min(1)).min(1),
    url: z.string().trim().min(1),
    image_url: z.string().trim().min(1),
    is_featured: z.boolean(),
    is_trending: z.boolean(),
    is_popular: z.boolean(),
    is_published: z.boolean(),
})

export async function POST(request: NextRequest) {
    const admin = await requireAdmin(request)
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const parsed = blogPostSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid blog post", issues: parsed.error.flatten() }, { status: 400 })
    }

    const { data: blog, error: blogError } = await supabaseServer
        .from("blog_posts")
        .insert(parsed.data)
        .select()
        .single()

    if (blogError) {
        return NextResponse.json({ error: blogError.message }, { status: 500 })
    }

    revalidatePath("/blog")
    if (blog?.url) {
        revalidatePath(`/blog/${blog.url}`)
    }

    return NextResponse.json({ message: "Blog posted successfully", blog })
}
