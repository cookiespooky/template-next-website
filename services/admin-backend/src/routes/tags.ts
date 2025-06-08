
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { createError } from '../middleware/errorHandler';
import { requireEditor } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const tagValidation = [
  body('name').isLength({ min: 2 }).trim(),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i)
];

// Get all tags
router.get('/', async (req, res, next) => {
  try {
    const search = req.query.search as string;

    const where = search ? {
      name: { contains: search, mode: 'insensitive' as const }
    } : {};

    const tags = await prisma.tag.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        courses: {
          select: { courseId: true }
        }
      }
    });

    // Add course count to each tag
    const tagsWithCount = tags.map(tag => ({
      ...tag,
      courseCount: tag.courses.length,
      courses: undefined
    }));

    res.json({
      success: true,
      data: tagsWithCount
    });
  } catch (error) {
    next(error);
  }
});

// Get tag by ID
router.get('/:id', async (req, res, next) => {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: req.params.id },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                isPublished: true
              }
            }
          }
        }
      }
    });

    if (!tag) {
      throw createError('Tag not found', 404);
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    next(error);
  }
});

// Create tag
router.post('/', requireEditor, tagValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400);
    }

    const { name, color } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingTag = await prisma.tag.findUnique({
      where: { slug }
    });

    if (existingTag) {
      throw createError('Tag with this name already exists', 409);
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
        color
      }
    });

    logger.info('Tag created', { tagId: tag.id, name, createdBy: req.user!.id });

    res.status(201).json({
      success: true,
      data: tag
    });
  } catch (error) {
    next(error);
  }
});

// Update tag
router.put('/:id', requireEditor, tagValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400);
    }

    const tagId = req.params.id;
    const { name, color } = req.body;

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId }
    });

    if (!existingTag) {
      throw createError('Tag not found', 404);
    }

    // Generate new slug if name changed
    let slug = existingTag.slug;
    if (name !== existingTag.name) {
      slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if new slug already exists
      const slugExists = await prisma.tag.findFirst({
        where: { 
          slug,
          id: { not: tagId }
        }
      });

      if (slugExists) {
        throw createError('Tag with this name already exists', 409);
      }
    }

    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name,
        slug,
        color
      }
    });

    logger.info('Tag updated', { tagId, updatedBy: req.user!.id });

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    next(error);
  }
});

// Delete tag
router.delete('/:id', requireEditor, async (req, res, next) => {
  try {
    const tagId = req.params.id;

    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        courses: true
      }
    });

    if (!tag) {
      throw createError('Tag not found', 404);
    }

    if (tag.courses.length > 0) {
      throw createError('Cannot delete tag that is associated with courses', 400);
    }

    await prisma.tag.delete({
      where: { id: tagId }
    });

    logger.info('Tag deleted', { tagId, deletedBy: req.user!.id });

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
