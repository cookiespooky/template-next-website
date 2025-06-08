
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const category = await prisma.category.findUnique({
      where: {
        slug: params.slug,
        isActive: true
      },
      include: {
        _count: {
          select: {
            courses: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: {
          categoryId: category.id,
          isActive: true
        },
        include: {
          category: true,
          instructor: true,
          _count: {
            select: {
              enrollments: true,
              reviews: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.course.count({
        where: {
          categoryId: category.id,
          isActive: true
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      category,
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}
