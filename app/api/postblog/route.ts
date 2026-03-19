import { NextRequest, NextResponse } from "next/server"
import { jwtDecode } from "jwt-decode"
import { supabase } from "@/lib/supabase/client"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let userId
    try {
        const decoded = jwtDecode<{ sub: string }>(token)
        userId = decoded.sub
    } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }


    const { data: user, error } = await supabase
        .from("users")
        .select("isAdmin")
        .eq("id", userId)
        .single()

    if (error || !user?.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    const { data: blog, error: blogError } = await supabase
        .from("blog_posts")
        .insert(body)
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
