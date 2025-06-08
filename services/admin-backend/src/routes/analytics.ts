
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Dashboard overview stats
router.get('/overview', requireAdmin, async (req, res, next) => {
  try {
    const [
      totalCourses,
      publishedCourses,
      totalCategories,
      totalInstructors,
      activeInstructors,
      recentCourses,
      recentAuditLogs
    ] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.instructor.count(),
      prisma.instructor.count({ where: { isActive: true } }),
      prisma.course.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          category: { select: { name: true } },
          instructor: { select: { firstName: true, lastName: true } }
        }
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          }
        }
      })
    ]);

    const stats = {
      courses: {
        total: totalCourses,
        published: publishedCourses,
        draft: totalCourses - publishedCourses
      },
      categories: {
        total: totalCategories
      },
      instructors: {
        total: totalInstructors,
        active: activeInstructors
      },
      recentCourses,
      recentActivity: recentAuditLogs
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// Course statistics
router.get('/courses', requireAdmin, async (req, res, next) => {
  try {
    const period = req.query.period as string || '30d';
    
    let dateFilter: Date;
    switch (period) {
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      coursesByStatus,
      coursesByCategory,
      coursesByLevel,
      coursesCreatedOverTime
    ] = await Promise.all([
      prisma.course.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.course.groupBy({
        by: ['categoryId'],
        _count: { categoryId: true },
        include: {
          category: {
            select: { name: true }
          }
        }
      }),
      prisma.course.groupBy({
        by: ['level'],
        _count: { level: true }
      }),
      prisma.course.findMany({
        where: {
          createdAt: { gte: dateFilter }
        },
        select: {
          createdAt: true,
          status: true
        },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    // Group courses by date for chart
    const coursesChart = coursesCreatedOverTime.reduce((acc: any, course) => {
      const date = course.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0 };
      }
      acc[date].count++;
      return acc;
    }, {});

    const stats = {
      byStatus: coursesByStatus,
      byCategory: coursesByCategory,
      byLevel: coursesByLevel,
      createdOverTime: Object.values(coursesChart)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// User activity analytics
router.get('/activity', requireAdmin, async (req, res, next) => {
  try {
    const period = req.query.period as string || '30d';
    
    let dateFilter: Date;
    switch (period) {
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      activityByAction,
      activityByUser,
      activityOverTime
    ] = await Promise.all([
      prisma.auditLog.groupBy({
        by: ['action'],
        where: {
          createdAt: { gte: dateFilter }
        },
        _count: { action: true }
      }),
      prisma.auditLog.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: dateFilter }
        },
        _count: { userId: true },
        orderBy: {
          _count: {
            userId: 'desc'
          }
        },
        take: 10
      }),
      prisma.auditLog.findMany({
        where: {
          createdAt: { gte: dateFilter }
        },
        select: {
          createdAt: true,
          action: true
        },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    // Get user details for top active users
    const userIds = activityByUser.map(item => item.userId);
    const users = await prisma.adminUser.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    const activityByUserWithDetails = activityByUser.map(item => ({
      ...item,
      user: users.find(u => u.id === item.userId)
    }));

    // Group activity by date for chart
    const activityChart = activityOverTime.reduce((acc: any, log) => {
      const date = log.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0 };
      }
      acc[date].count++;
      return acc;
    }, {});

    const stats = {
      byAction: activityByAction,
      byUser: activityByUserWithDetails,
      overTime: Object.values(activityChart)
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
