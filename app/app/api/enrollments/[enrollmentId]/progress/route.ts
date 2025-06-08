
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const { progress } = await request.json();

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: 'Прогресс должен быть числом от 0 до 100' },
        { status: 400 }
      );
    }

    // Find enrollment and verify ownership
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        id: params.enrollmentId,
        userId: session.user.id
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Запись на курс не найдена' },
        { status: 404 }
      );
    }

    // Update progress
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: params.enrollmentId },
      data: {
        progress,
        status: progress >= 100 ? 'COMPLETED' : 'ACTIVE',
        completedAt: progress >= 100 ? new Date() : null
      },
      include: {
        course: true
      }
    });

    return NextResponse.json({
      success: true,
      enrollment: updatedEnrollment
    });

  } catch (error) {
    console.error('Error updating enrollment progress:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить прогресс' },
      { status: 500 }
    );
  }
}
