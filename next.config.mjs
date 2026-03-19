/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [{
                protocol: "https",
                hostname: "**",
            },
            {
                protocol: "http",
                hostname: "**",
            }
        ],
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