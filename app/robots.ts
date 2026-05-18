import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/checkout', '/upload', '/payment/'],
    },
    sitemap: 'https://photorestorenow.com/sitemap.xml',
  }
}
