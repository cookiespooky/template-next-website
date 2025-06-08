
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { SitemapStream, streamToPromise } from 'sitemap';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const siteUrl = process.env.SITE_URL || 'http://localhost:3005';

    // Create sitemap stream
    const sitemap = new SitemapStream({ hostname: siteUrl });

    // Add static pages
    sitemap.write({
      url: '/',
      changefreq: 'daily',
      priority: 1.0,
      lastmod: new Date().toISOString()
    });

    sitemap.write({
      url: '/posts',
      changefreq: 'daily',
      priority: 0.9,
      lastmod: new Date().toISOString()
    });

    sitemap.write({
      url: '/categories',
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString()
    });

    sitemap.write({
      url: '/tags',
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date().toISOString()
    });

    sitemap.write({
      url: '/contact',
      changefreq: 'monthly',
      priority: 0.6,
      lastmod: new Date().toISOString()
    });

    // Add blog posts
    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        status: 'PUBLISHED'
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true
      },
      orderBy: { publishedAt: 'desc' }
    });

    posts.forEach(post => {
      sitemap.write({
        url: `/posts/${post.slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: (post.publishedAt || post.updatedAt).toISOString()
      });
    });

    // Add categories
    const categories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true
      }
    });

    categories.forEach(category => {
      sitemap.write({
        url: `/categories/${category.slug}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: category.updatedAt.toISOString()
      });
    });

    // Add tags
    const tags = await prisma.blogTag.findMany({
      select: {
        slug: true,
        updatedAt: true
      }
    });

    tags.forEach(tag => {
      sitemap.write({
        url: `/tags/${tag.slug}`,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: tag.updatedAt.toISOString()
      });
    });

    // End the stream
    sitemap.end();

    // Generate XML
    const xml = await streamToPromise(sitemap);

    // Set headers
    res.set({
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    });

    res.send(xml.toString());
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

export default router;
