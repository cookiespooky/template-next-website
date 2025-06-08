
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { createError } from '../middleware/errorHandler';
import { requireEditor } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const instructorValidation = [
  body('firstName').isLength({ min: 2 }).trim(),
  body('lastName').isLength({ min: 2 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('bio').optional().isLength({ max: 2000 }),
  body('title').optional().isLength({ max: 100 }),
  body('company').optional().isLength({ max: 100 }),
  body('website').optional().isURL()
];

// Get all instructors
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const includeInactive = req.query.includeInactive === 'true';

    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (!includeInactive) {
      where.isActive = true;
    }

    const [instructors, total] = await Promise.all([
      prisma.instructor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          courses: {
            select: {
              id: true,
              title: true,
              status: true,
              isPublished: true
            }
          }
        }
      }),
      prisma.instructor.count({ where })
    ]);

    // Add course count to each instructor
    const instructorsWithStats = instructors.map(instructor => ({
      ...instructor,
      courseCount: instructor.courses.length,
      publishedCourseCount: instructor.courses.filter(c => c.isPublished).length
    }));

    res.json({
      success: true,
      data: {
        instructors: instructorsWithStats,
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

// Get instructor by ID
router.get('/:id', async (req, res, next) => {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { id: req.params.id },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            isPublished: true,
            enrollmentCount: true,
            rating: true
          }
        }
      }
    });

    if (!instructor) {
      throw createError('Instructor not found', 404);
    }

    res.json({
      success: true,
      data: instructor
    });
  } catch (error) {
    next(error);
  }
});

// Create instructor
router.post('/', requireEditor, instructorValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400);
    }

    const {
      firstName,
      lastName,
      email,
      bio,
      avatarUrl,
      title,
      company,
      website,
      socialLinks
    } = req.body;

    // Check if email already exists
    const existingInstructor = await prisma.instructor.findUnique({
      where: { email }
    });

    if (existingInstructor) {
      throw createError('Instructor with this email already exists', 409);
    }

    const instructor = await prisma.instructor.create({
      data: {
        firstName,
        lastName,
        email,
        bio,
        avatarUrl,
        title,
        company,
        website,
        socialLinks
      }
    });

    logger.info('Instructor created', { 
      instructorId: instructor.id, 
      email, 
      createdBy: req.user!.id 
    });

    res.status(201).json({
      success: true,
      data: instructor
    });
  } catch (error) {
    next(error);
  }
});

// Update instructor
router.put('/:id', requireEditor, instructorValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400);
    }

    const instructorId = req.params.id;
    const {
      firstName,
      lastName,
      email,
      bio,
      avatarUrl,
      title,
      company,
      website,
      socialLinks,
      isActive
    } = req.body;

    // Check if instructor exists
    const existingInstructor = await prisma.instructor.findUnique({
      where: { id: instructorId }
    });

    if (!existingInstructor) {
      throw createError('Instructor not found', 404);
    }

    // Check if email is taken by another instructor
    if (email !== existingInstructor.email) {
      const emailExists = await prisma.instructor.findFirst({
        where: { 
          email,
          id: { not: instructorId }
        }
      });

      if (emailExists) {
        throw createError('Email already taken by another instructor', 409);
      }
    }

    const instructor = await prisma.instructor.update({
      where: { id: instructorId },
      data: {
        firstName,
        lastName,
        email,
        bio,
        avatarUrl,
        title,
        company,
        website,
        socialLinks,
        isActive
      }
    });

    logger.info('Instructor updated', { instructorId, updatedBy: req.user!.id });

    res.json({
      success: true,
      data: instructor
    });
  } catch (error) {
    next(error);
  }
});

// Delete instructor
router.delete('/:id', requireEditor, async (req, res, next) => {
  try {
    const instructorId = req.params.id;

    const instructor = await prisma.instructor.findUnique({
      where: { id: instructorId },
      include: {
        courses: true
      }
    });

    if (!instructor) {
      throw createError('Instructor not found', 404);
    }

    if (instructor.courses.length > 0) {
      throw createError('Cannot delete instructor with associated courses', 400);
    }

    await prisma.instructor.delete({
      where: { id: instructorId }
    });

    logger.info('Instructor deleted', { instructorId, deletedBy: req.user!.id });

    res.json({
      success: true,
      message: 'Instructor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get instructor statistics
router.get('/:id/stats', async (req, res, next) => {
  try {
    const instructorId = req.params.id;

    const instructor = await prisma.instructor.findUnique({
      where: { id: instructorId },
      include: {
        courses: {
          select: {
            enrollmentCount: true,
            rating: true,
            reviewCount: true,
            isPublished: true
          }
        }
      }
    });

    if (!instructor) {
      throw createError('Instructor not found', 404);
    }

    const publishedCourses = instructor.courses.filter(c => c.isPublished);
    const totalEnrollments = publishedCourses.reduce((sum, c) => sum + c.enrollmentCount, 0);
    const totalReviews = publishedCourses.reduce((sum, c) => sum + c.reviewCount, 0);
    const averageRating = publishedCourses.length > 0 
      ? publishedCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / publishedCourses.length
      : 0;

    const stats = {
      totalCourses: instructor.courses.length,
      publishedCourses: publishedCourses.length,
      totalEnrollments,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

export default router;
