
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { yookassa } from '@/lib/yookassa';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: {
        id: params.paymentId
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Платеж не найден' },
        { status: 404 }
      );
    }

    // Check if user owns this payment
    if (payment.order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Optionally sync with YooKassa to get latest status
    if (payment.yookassaId && payment.status === 'PROCESSING') {
      try {
        const yookassaPayment = await yookassa.getPayment(payment.yookassaId);
        const newStatus = yookassa.mapPaymentStatus(yookassaPayment.status);
        
        if (newStatus !== payment.status) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: newStatus,
              paidAt: yookassaPayment.status === 'succeeded' ? new Date() : undefined
            }
          });
          payment.status = newStatus;
        }
      } catch (error) {
        console.error('Error syncing payment status:', error);
      }
    }

    return NextResponse.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Не удалось получить информацию о платеже' },
      { status: 500 }
    );
  }
}
