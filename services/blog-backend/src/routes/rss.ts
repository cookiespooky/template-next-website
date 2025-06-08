
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import RSS from 'rss';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const siteUrl = process.env.SITE_URL || 'http://localhost:3005';
    const siteName = process.env.SITE_NAME || 'Course Platform Blog';
    const siteDescription = process.env.SITE_DESCRIPTION || 'Latest insights and tutorials';

    // Create RSS feed
    const feed = new RSS({
      title: siteName,
      description: siteDescription,
      feed_url: `${siteUrl}/rss.xml`,
      site_url: siteUrl,
      image_url: `${siteUrl}/logo.png`,
      managingEditor: process.env.SMTP_FROM || 'noreply@courseplatform.com',
      webMaster: process.env.SMTP_FROM || 'noreply@courseplatform.com',
      copyright: `${new Date().getFullYear()} Course Platform`,
      language: 'en',
      categories: ['Education', 'Online Learning', 'Tutorials'],
      pubDate: new Date(),
      ttl: 60,
    });

    // Get recent published posts
    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        status: 'PUBLISHED'
      },
      take: 20,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      }
    });

    // Add posts to feed
    posts.forEach(post => {
      feed.item({
        title: post.title,
        description: post.excerpt || '',
        url: `${siteUrl}/posts/${post.slug}`,
        guid: post.id,
        categories: post.category ? [post.category.name] : [],
        author: `${post.author.firstName} ${post.author.lastName}`,
        date: post.publishedAt || post.createdAt,
        enclosure: post.featuredImageUrl ? {
          url: post.featuredImageUrl,
          type: 'image/jpeg'
        } : undefined
      });
    });

    // Set headers
    res.set({
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    });

    res.send(feed.xml());
  } catch (error) {
    console.error('RSS generation error:', error);
    res.status(500).json({ error: 'Failed to generate RSS feed' });
  }
});

export default router;
