
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get published posts with pagination
router.get('/posts', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const categorySlug = req.query.category as string;
    const tagSlug = req.query.tag as string;
    const featured = req.query.featured === 'true';

    const where: any = {
      isPublished: true,
      status: 'PUBLISHED'
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (tagSlug) {
      where.tags = {
        some: {
          tag: { slug: tagSlug }
        }
      };
    }

    if (featured) {
      where.isFeatured = true;
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImageUrl: true,
          featuredImageAlt: true,
          readingTime: true,
          viewCount: true,
          likeCount: true,
          commentCount: true,
          publishedAt: true,
          author: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          },
          category: {
            select: {
              name: true,
              slug: true,
              color: true
            }
          },
          tags: {
            select: {
              tag: {
                select: {
                  name: true,
                  slug: true,
                  color: true
                }
              }
            }
          }
        }
      }),
      prisma.blogPost.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single post by slug
router.get('/posts/:slug', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { 
        slug: req.params.slug,
        isPublished: true,
        status: 'PUBLISHED'
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            bio: true,
            avatarUrl: true,
            website: true,
            socialLinks: true
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        comments: {
          where: { isApproved: true },
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true
              }
            },
            replies: {
              where: { isApproved: true },
              include: {
                author: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!post) {
      throw createError('Post not found', 404);
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    });

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
});

// Get categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        posts: {
          where: { isPublished: true },
          select: { id: true }
        }
      }
    });

    const categoriesWithCount = categories.map(category => ({
      ...category,
      postCount: category.posts.length,
      posts: undefined
    }));

    res.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
});

// Get tags
router.get('/tags', async (req, res, next) => {
  try {
    const tags = await prisma.blogTag.findMany({
      orderBy: { name: 'asc' },
      include: {
        posts: {
          where: {
            post: { isPublished: true }
          },
          select: { postId: true }
        }
      }
    });

    const tagsWithCount = tags.map(tag => ({
      ...tag,
      postCount: tag.posts.length,
      posts: undefined
    }));

    res.json({
      success: true,
      data: tagsWithCount
    });
  } catch (error) {
    next(error);
  }
});

// Get recent posts
router.get('/recent', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        status: 'PUBLISHED'
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImageUrl: true,
        publishedAt: true,
        readingTime: true,
        author: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
});

// Get popular posts
router.get('/popular', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        status: 'PUBLISHED'
      },
      take: limit,
      orderBy: { viewCount: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImageUrl: true,
        publishedAt: true,
        viewCount: true,
        readingTime: true,
        author: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
});

export default router;
