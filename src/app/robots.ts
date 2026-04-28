import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL ?? 'https://repopilot.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/analyze/'],
        disallow: [
          '/api/',
          '/dashboard/',
          '/settings/',
          '/scheduler/',
          '/suggestions/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
