
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { createError } from '../middleware/errorHandler';
import { requireEditor } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const lessonValidation = [
  body('title').isLength({ min: 3 }).trim(),
  body('description').optional().isLength({ max: 2000 }),
  body('content').optional(),
  body('duration').optional().isInt({ min: 0 }),
  body('sortOrder').optional().isInt({ min: 0 })
];

// Get lessons for a course
router.get('/course/:courseId', async (req, res, next) => {
  try {
    const courseId = req.params.courseId;

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw createError('Course not found', 404);
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      data: lessons
    });
  } catch (error) {
    next(error);
  }
});

// Get lesson by ID
router.get('/:id', async (req, res, next) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    if (!lesson) {
      throw createError('Lesson not found', 404);
    }

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    next(error);
  }
});

// Create lesson
router.post('/', requireEditor, lessonValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400);
    }

    const {
      title,
      description,
      content,
      videoUrl,
      duration,
      sortOrder,
      isPublished,
      isFree,
      courseId
    } = req.body;

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw createError('Course not found', 404);
    }

    // Generate slug from title
    const baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Ensure unique slug within the course
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existingLesson = await prisma.lesson.findFirst({
        where: { 
          courseId,
          slug
        }
      });

      if (!existingLesson) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Get next sort order if not provided
    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined) {
      const lastLesson = await prisma.lesson.findFirst({
        where: { courseId },
        orderBy: { sortOrder: 'desc' }
      });
      finalSortOrder = lastLesson ? lastLesson.sortOrder + 1 : 0;
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        slug,
        description,
        content,
        videoUrl,
        duration,
        sortOrder: finalSortOrder,
        isPublished: isPublished || false,
        isFree: isFree || false,
        courseId
      }
    });

    logger.info('Lesson created', { 
      lessonId: lesson.id, 
      courseId, 
      title, 
      createdBy: req.user!.id 
    });

    res.status(201).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    next(error);
  }
});

// Update lesson
router.put('/:id', requireEditor, lessonValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400);
    }

    const lessonId = req.params.id;
    const {
      title,
      description,
      content,
      videoUrl,
      duration,
      sortOrder,
      isPublished,
      isFree
    } = req.body;

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!existingLesson) {
      throw createError('Lesson not found', 404);
    }

    // Generate new slug if title changed
    let slug = existingLesson.slug;
    if (title !== existingLesson.title) {
      const baseSlug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Ensure unique slug within the course
      slug = baseSlug;
      let counter = 1;
      while (true) {
        const slugExists = await prisma.lesson.findFirst({
          where: { 
            courseId: existingLesson.courseId,
            slug,
            id: { not: lessonId }
          }
        });

        if (!slugExists) break;
        
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title,
        slug,
        description,
        content,
        videoUrl,
        duration,
        sortOrder,
        isPublished,
        isFree
      }
    });

    logger.info('Lesson updated', { lessonId, updatedBy: req.user!.id });

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    next(error);
  }
});

// Delete lesson
router.delete('/:id', requireEditor, async (req, res, next) => {
  try {
    const lessonId = req.params.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!lesson) {
      throw createError('Lesson not found', 404);
    }

    await prisma.lesson.delete({
      where: { id: lessonId }
    });

    logger.info('Lesson deleted', { lessonId, deletedBy: req.user!.id });

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Reorder lessons within a course
router.patch('/reorder', requireEditor, async (req, res, next) => {
  try {
    const { lessonOrders } = req.body; // Array of { id, sortOrder }

    if (!Array.isArray(lessonOrders)) {
      throw createError('lessonOrders must be an array', 400);
    }

    // Update sort orders in a transaction
    await prisma.$transaction(
      lessonOrders.map(({ id, sortOrder }) =>
        prisma.lesson.update({
          where: { id },
          data: { sortOrder }
        })
      )
    );

    logger.info('Lessons reordered', { updatedBy: req.user!.id });

    res.json({
      success: true,
      message: 'Lessons reordered successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
