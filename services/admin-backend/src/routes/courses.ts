
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { createError } from '../middleware/errorHandler';
import { requireEditor } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const courseValidation = [
  body('title').isLength({ min: 3 }).trim(),
  body('description').optional().isLength({ max: 5000 }),
  body('shortDescription').optional().isLength({ max: 500 }),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('categoryId').isUUID(),
  body('instructorId').isUUID(),
  body('level').isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  body('status').optional().isIn(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'])
];

// Get all courses with pagination and filters
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const categoryId = req.query.categoryId as string;
    const instructorId = req.query.instructorId as string;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (instructorId) where.instructorId = instructorId;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          instructor: true,
          createdBy: {
            select: { firstName: true, lastName: true }
          },
          updatedBy: {
            select: { firstName: true, lastName: true }
          },
          lessons: {
            select: { id: true, title: true, duration: true }
          },
          tags: {
            include: { tag: true }
          }
        }
      }),
      prisma.course.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        courses,
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

// Get course by ID
router.get('/:id', async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        instructor: true,
        createdBy: {
          select: { firstName: true, lastName: true }
        },
        updatedBy: {
          select: { firstName: true, lastName: true }
        },
        lessons: {
          orderBy: { sortOrder: 'asc' }
        },
        tags: {
          include: { tag: true }
        }
      }
    });

    if (!course) {
      throw createError('Course not found', 404);
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
});

// Create course
router.post('/', requireEditor, courseValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400);
    }

    const {
      title,
      description,
      shortDescription,
      content,
      price,
      discountPrice,
      currency,
      duration,
      level,
      status,
      categoryId,
      instructorId,
      metaTitle,
      metaDescription,
      metaKeywords,
      thumbnailUrl,
      videoUrl,
      previewVideoUrl,
      requirements,
      whatYouWillLearn,
      targetAudience,
      isFeatured,
      tagIds
    } = req.body;

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug }
    });

    if (existingCourse) {
      throw createError('Course with this title already exists', 409);
    }

    // Verify category and instructor exist
    const [category, instructor] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.instructor.findUnique({ where: { id: instructorId } })
    ]);

    if (!category) {
      throw createError('Category not found', 404);
    }

    if (!instructor) {
      throw createError('Instructor not found', 404);
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        shortDescription,
        content,
        price,
        discountPrice,
        currency,
        duration,
        level,
        status: status || 'DRAFT',
        categoryId,
        instructorId,
        createdById: req.user!.id,
        updatedById: req.user!.id,
        metaTitle,
        metaDescription,
        metaKeywords,
        thumbnailUrl,
        videoUrl,
        previewVideoUrl,
        requirements,
        whatYouWillLearn,
        targetAudience,
        isFeatured: isFeatured || false,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        tags: tagIds ? {
          create: tagIds.map((tagId: string) => ({
            tagId
          }))
        } : undefined
      },
      include: {
        category: true,
        instructor: true,
        tags: {
          include: { tag: true }
        }
      }
    });

    logger.info('Course created', { courseId: course.id, title, createdBy: req.user!.id });

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
});

// Update course
router.put('/:id', requireEditor, courseValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400);
    }

    const courseId = req.params.id;
    const {
      title,
      description,
      shortDescription,
      content,
      price,
      discountPrice,
      currency,
      duration,
      level,
      status,
      categoryId,
      instructorId,
      metaTitle,
      metaDescription,
      metaKeywords,
      thumbnailUrl,
      videoUrl,
      previewVideoUrl,
      requirements,
      whatYouWillLearn,
      targetAudience,
      isFeatured,
      tagIds
    } = req.body;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!existingCourse) {
      throw createError('Course not found', 404);
    }

    // Generate new slug if title changed
    let slug = existingCourse.slug;
    if (title !== existingCourse.title) {
      slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if new slug already exists
      const slugExists = await prisma.course.findFirst({
        where: { 
          slug,
          id: { not: courseId }
        }
      });

      if (slugExists) {
        throw createError('Course with this title already exists', 409);
      }
    }

    // Update course
    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        slug,
        description,
        shortDescription,
        content,
        price,
        discountPrice,
        currency,
        duration,
        level,
        status,
        categoryId,
        instructorId,
        updatedById: req.user!.id,
        metaTitle,
        metaDescription,
        metaKeywords,
        thumbnailUrl,
        videoUrl,
        previewVideoUrl,
        requirements,
        whatYouWillLearn,
        targetAudience,
        isFeatured,
        publishedAt: status === 'PUBLISHED' && !existingCourse.publishedAt ? new Date() : existingCourse.publishedAt,
        tags: tagIds ? {
          deleteMany: {},
          create: tagIds.map((tagId: string) => ({
            tagId
          }))
        } : undefined
      },
      include: {
        category: true,
        instructor: true,
        tags: {
          include: { tag: true }
        }
      }
    });

    logger.info('Course updated', { courseId, updatedBy: req.user!.id });

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
});

// Delete course
router.delete('/:id', requireEditor, async (req, res, next) => {
  try {
    const courseId = req.params.id;

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw createError('Course not found', 404);
    }

    await prisma.course.delete({
      where: { id: courseId }
    });

    logger.info('Course deleted', { courseId, deletedBy: req.user!.id });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Publish/unpublish course
router.patch('/:id/publish', requireEditor, async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const { isPublished } = req.body;

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw createError('Course not found', 404);
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        isPublished,
        status: isPublished ? 'PUBLISHED' : 'DRAFT',
        publishedAt: isPublished ? new Date() : null,
        updatedById: req.user!.id
      }
    });

    logger.info(`Course ${isPublished ? 'published' : 'unpublished'}`, { 
      courseId, 
      updatedBy: req.user!.id 
    });

    res.json({
      success: true,
      data: updatedCourse
    });
  } catch (error) {
    next(error);
  }
});

export default router;
