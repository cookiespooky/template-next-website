
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { createError } from '../middleware/errorHandler';
import { requireAdmin } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Get all settings
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const category = req.query.category as string;

    const where = category ? { category } : {};

    const settings = await prisma.siteSettings.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    // Group settings by category
    const groupedSettings = settings.reduce((acc: any, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    res.json({
      success: true,
      data: groupedSettings
    });
  } catch (error) {
    next(error);
  }
});

// Get setting by key
router.get('/:key', requireAdmin, async (req, res, next) => {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: req.params.key }
    });

    if (!setting) {
      throw createError('Setting not found', 404);
    }

    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    next(error);
  }
});

// Update or create setting
router.put('/:key', requireAdmin, async (req, res, next) => {
  try {
    const key = req.params.key;
    const { value, description, category } = req.body;

    if (value === undefined) {
      throw createError('Value is required', 400);
    }

    const setting = await prisma.siteSettings.upsert({
      where: { key },
      update: {
        value,
        description,
        category
      },
      create: {
        key,
        value,
        description,
        category: category || 'general'
      }
    });

    logger.info('Setting updated', { key, updatedBy: req.user!.id });

    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    next(error);
  }
});

// Update multiple settings
router.patch('/bulk', requireAdmin, async (req, res, next) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings)) {
      throw createError('Settings must be an array', 400);
    }

    // Update settings in a transaction
    const updatedSettings = await prisma.$transaction(
      settings.map(({ key, value, description, category }) =>
        prisma.siteSettings.upsert({
          where: { key },
          update: {
            value,
            description,
            category
          },
          create: {
            key,
            value,
            description: description || '',
            category: category || 'general'
          }
        })
      )
    );

    logger.info('Bulk settings updated', { 
      count: settings.length, 
      updatedBy: req.user!.id 
    });

    res.json({
      success: true,
      data: updatedSettings
    });
  } catch (error) {
    next(error);
  }
});

// Delete setting
router.delete('/:key', requireAdmin, async (req, res, next) => {
  try {
    const key = req.params.key;

    const setting = await prisma.siteSettings.findUnique({
      where: { key }
    });

    if (!setting) {
      throw createError('Setting not found', 404);
    }

    await prisma.siteSettings.delete({
      where: { key }
    });

    logger.info('Setting deleted', { key, deletedBy: req.user!.id });

    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Initialize default settings
router.post('/initialize', requireAdmin, async (req, res, next) => {
  try {
    const defaultSettings = [
      {
        key: 'site_name',
        value: 'Course Platform',
        description: 'Name of the website',
        category: 'general'
      },
      {
        key: 'site_description',
        value: 'Learn new skills with our comprehensive online courses',
        description: 'Site description for SEO',
        category: 'seo'
      },
      {
        key: 'contact_email',
        value: 'contact@courseplatform.com',
        description: 'Contact email address',
        category: 'contact'
      },
      {
        key: 'support_email',
        value: 'support@courseplatform.com',
        description: 'Support email address',
        category: 'contact'
      },
      {
        key: 'courses_per_page',
        value: 12,
        description: 'Number of courses to display per page',
        category: 'display'
      },
      {
        key: 'enable_course_reviews',
        value: true,
        description: 'Allow users to review courses',
        category: 'features'
      },
      {
        key: 'enable_course_ratings',
        value: true,
        description: 'Allow users to rate courses',
        category: 'features'
      },
      {
        key: 'maintenance_mode',
        value: false,
        description: 'Enable maintenance mode',
        category: 'system'
      },
      {
        key: 'google_analytics_id',
        value: '',
        description: 'Google Analytics tracking ID',
        category: 'analytics'
      },
      {
        key: 'facebook_pixel_id',
        value: '',
        description: 'Facebook Pixel ID',
        category: 'analytics'
      }
    ];

    const createdSettings = [];

    for (const setting of defaultSettings) {
      const existing = await prisma.siteSettings.findUnique({
        where: { key: setting.key }
      });

      if (!existing) {
        const created = await prisma.siteSettings.create({
          data: setting
        });
        createdSettings.push(created);
      }
    }

    logger.info('Default settings initialized', { 
      count: createdSettings.length, 
      initializedBy: req.user!.id 
    });

    res.json({
      success: true,
      message: `${createdSettings.length} default settings initialized`,
      data: createdSettings
    });
  } catch (error) {
    next(error);
  }
});

export default router;
