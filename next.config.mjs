const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null

/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: false,
    images: {
        // Only hosts we actually serve images from. An open "**" pattern turns /_next/image into a public proxy.
        remotePatterns: [
            supabaseHost && { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" },
            // Existing blog cover images. New covers should be uploaded to Supabase storage.
            ...["freeprojectscodes.com", "media.geeksforgeeks.org", "blogs.iadb.org", "media.licdn.com"].map((hostname) => ({
                protocol: "https",
                hostname,
            })),
        ].filter(Boolean),
    },
    // Pages are cached by tag (lib/data/cached.ts); only the JSON API opts out of CDN caching.
    async headers() {
        return [{
            source: '/api/:path*',
            headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
        }]
    },
}

export default nextConfig