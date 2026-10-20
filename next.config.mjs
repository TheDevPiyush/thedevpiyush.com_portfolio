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
    // Add headers to prevent aggressive caching
    async headers() {
        return [{
                source: '/blog/:path*',
                headers: [{
                    key: 'Cache-Control',
                    value: 'public, s-maxage=60, stale-while-revalidate=300',
                }, ],
            },
            {
                source: '/api/:path*',
                headers: [{
                    key: 'Cache-Control',
                    value: 'no-cache, no-store, must-revalidate',
                }, ],
            },
            {
                source: '/',
                headers: [{
                    key: 'Cache-Control',
                    value: 'no-store, no-cache, must-revalidate, max-age=0',
                }, ],
            },
            {
                source: '/home',
                headers: [{
                    key: 'Cache-Control',
                    value: 'no-store, no-cache, must-revalidate, max-age=0',
                }, ],
            },
            {
                source: '/projects/:path*',
                headers: [{
                    key: 'Cache-Control',
                    value: 'no-store, no-cache, must-revalidate, max-age=0',
                }, ],
            },
        ]
    },
}

export default nextConfig