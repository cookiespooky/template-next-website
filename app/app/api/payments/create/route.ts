
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { yookassa } from '@/lib/yookassa';

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

    const { orderId, returnUrl } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID заказа обязателен' },
        { status: 400 }
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id
      },
      include: {
        items: {
          include: {
            course: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Заказ уже обработан' },
        { status: 400 }
      );
    }

    // Create YooKassa payment
    const paymentData = {
      amount: {
        value: order.totalAmount.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect' as const,
        return_url: returnUrl || `${process.env.NEXTAUTH_URL}/orders/${orderId}/success`
      },
      capture: true,
      description: `Оплата заказа #${order.id}`,
      metadata: {
        orderId: order.id,
        userId: session.user.id,
        courseIds: order.items.map(item => item.courseId).join(',')
      }
    };

    const yookassaPayment = await yookassa.createPayment(paymentData);

    // Save payment to database
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        yookassaId: yookassaPayment.id,
        status: yookassa.mapPaymentStatus(yookassaPayment.status),
        amount: order.totalAmount,
        currency: 'RUB',
        paymentMethod: yookassaPayment.payment_method?.type,
        description: paymentData.description,
        metadata: paymentData.metadata
      }
    });

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PROCESSING' }
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        yookassaId: yookassaPayment.id,
        status: payment.status,
        confirmationUrl: yookassaPayment.confirmation?.confirmation_url
      }
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Не удалось создать платеж' },
      { status: 500 }
    );
  }
}
