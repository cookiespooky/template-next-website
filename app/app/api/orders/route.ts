
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const { 
      courseIds, 
      customerName, 
      customerEmail, 
      customerPhone,
      billingAddress,
      billingCity,
      billingZip
    } = await request.json();

    // Validation
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { error: 'Необходимо выбрать хотя бы один курс' },
        { status: 400 }
      );
    }

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Имя и email обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Get courses and calculate total
    const courses = await prisma.course.findMany({
      where: {
        id: { in: courseIds },
        isActive: true
      }
    });

    if (courses.length !== courseIds.length) {
      return NextResponse.json(
        { error: 'Некоторые курсы недоступны' },
        { status: 400 }
      );
    }

    const totalAmount = courses.reduce((sum, course) => sum + (course.price || 0), 0);

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Общая сумма заказа должна быть больше нуля' },
        { status: 400 }
      );
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: 'PENDING',
        totalAmount,
        currency: 'RUB',
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        billingAddress: billingAddress || undefined,
        billingCity: billingCity || undefined,
        billingZip: billingZip || undefined,
        items: {
          create: courses.map(course => ({
            courseId: course.id,
            quantity: 1,
            price: course.price || 0
          }))
        }
      },
      include: {
        items: {
          include: {
            course: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Заказ успешно создан',
      order
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Не удалось создать заказ' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          items: {
            include: {
              course: true
            }
          },
          payments: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.order.count({
        where: {
          userId: session.user.id
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Не удалось получить заказы' },
      { status: 500 }
    );
  }
}
