
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { createError } from '../middleware/errorHandler';
import { requireEditor } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const categoryValidation = [
  body('name').isLength({ min: 2 }).trim(),
  body('description').optional().isLength({ max: 1000 }),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('sortOrder').optional().isInt({ min: 0 })
];

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    
    const where = includeInactive ? {} : { isActive: true };

    const categories = await prisma.category.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        createdBy: {
          select: { firstName: true, lastName: true }
        },
        updatedBy: {
          select: { firstName: true, lastName: true }
        },
        courses: {
          select: { id: true },
          where: { isPublished: true }
        }
      }
    });

    // Add course count to each category
    const categoriesWithCount = categories.map(category => ({
      ...category,
      courseCount: category.courses.length,
      courses: undefined
    }));

    res.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
});

// Get category by ID
router.get('/:id', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true }
        },
        updatedBy: {
          select: { firstName: true, lastName: true }
        },
        courses: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            isPublished: true
          }
        }
      }
    });

    if (!category) {
      throw createError('Category not found', 404);
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
});

// Create category
router.post('/', requireEditor, categoryValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400);
    }

    const {
      name,
      description,
      iconUrl,
      color,
      sortOrder,
      metaTitle,
      metaDescription
    } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      throw createError('Category with this name already exists', 409);
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        iconUrl,
        color,
        sortOrder: sortOrder || 0,
        metaTitle,
        metaDescription,
        createdById: req.user!.id,
        updatedById: req.user!.id
      }
    });

    logger.info('Category created', { categoryId: category.id, name, createdBy: req.user!.id });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
});

// Update category
router.put('/:id', requireEditor, categoryValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400);
    }

    const categoryId = req.params.id;
    const {
      name,
      description,
      iconUrl,
      color,
      isActive,
      sortOrder,
      metaTitle,
      metaDescription
    } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      throw createError('Category not found', 404);
    }

    // Generate new slug if name changed
    let slug = existingCategory.slug;
    if (name !== existingCategory.name) {
      slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if new slug already exists
      const slugExists = await prisma.category.findFirst({
        where: { 
          slug,
          id: { not: categoryId }
        }
      });

      if (slugExists) {
        throw createError('Category with this name already exists', 409);
      }
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug,
        description,
        iconUrl,
        color,
        isActive,
        sortOrder,
        metaTitle,
        metaDescription,
        updatedById: req.user!.id
      }
    });

    logger.info('Category updated', { categoryId, updatedBy: req.user!.id });

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
});

// Delete category
router.delete('/:id', requireEditor, async (req, res, next) => {
  try {
    const categoryId = req.params.id;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        courses: true
      }
    });

    if (!category) {
      throw createError('Category not found', 404);
    }

    if (category.courses.length > 0) {
      throw createError('Cannot delete category with associated courses', 400);
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    logger.info('Category deleted', { categoryId, deletedBy: req.user!.id });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Reorder categories
router.patch('/reorder', requireEditor, async (req, res, next) => {
  try {
    const { categoryOrders } = req.body; // Array of { id, sortOrder }

    if (!Array.isArray(categoryOrders)) {
      throw createError('categoryOrders must be an array', 400);
    }

    // Update sort orders in a transaction
    await prisma.$transaction(
      categoryOrders.map(({ id, sortOrder }) =>
        prisma.category.update({
          where: { id },
          data: { 
            sortOrder,
            updatedById: req.user!.id
          }
        })
      )
    );

    logger.info('Categories reordered', { updatedBy: req.user!.id });

    res.json({
      success: true,
      message: 'Categories reordered successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
