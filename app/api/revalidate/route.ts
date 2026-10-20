import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { ALL_CACHE_TAGS, type CacheTag } from '@/lib/data/cache-tags'

// Manual cache purge, e.g. after editing rows directly in Supabase.
// Body: { token, tag?: CacheTag, path?: string }. With neither tag nor path, purges every data tag.
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { path, tag, token } = body

        // Reject everything when REVALIDATION_TOKEN is unset, so a missing token can't match.
        const expected = process.env.REVALIDATION_TOKEN
        if (!expected || typeof token !== 'string' || token !== expected) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
        }

        if (tag) {
            if (!ALL_CACHE_TAGS.includes(tag)) {
                return NextResponse.json({ message: `Unknown tag. Use one of: ${ALL_CACHE_TAGS.join(', ')}` }, { status: 400 })
            }
            revalidateTag(tag as CacheTag)
        } else if (path) {
            revalidatePath(path)
        } else {
            ALL_CACHE_TAGS.forEach((cacheTag) => revalidateTag(cacheTag))
        }

        return NextResponse.json({
            message: 'Revalidation successful',
            revalidated: true,
            now: Date.now()
        })
    } catch (error) {
        return NextResponse.json({
            message: 'Error revalidating',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
