
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeCount = searchParams.get('includeCount') !== 'false';

    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: includeCount ? {
          select: {
            courses: {
              where: {
                isActive: true
              }
            }
          }
        } : undefined
      },
      orderBy: {
        name: 'asc'
      },
      take: limit
    });

    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
