
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { yookassa } from '@/lib/yookassa';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-yookassa-signature') || '';

    // Verify webhook signature (implement in production)
    if (!yookassa.verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const webhookData = JSON.parse(body);
    const { event, object: paymentObject } = webhookData;

    if (event !== 'payment.succeeded' && event !== 'payment.canceled') {
      // We only handle succeeded and canceled events
      return NextResponse.json({ success: true });
    }

    const yookassaPaymentId = paymentObject.id;

    // Find payment in our database
    const payment = await prisma.payment.findUnique({
      where: {
        yookassaId: yookassaPaymentId
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                course: true
              }
            },
            user: true
          }
        }
      }
    });

    if (!payment) {
      console.error('Payment not found:', yookassaPaymentId);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const newStatus = yookassa.mapPaymentStatus(paymentObject.status);

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        paymentMethod: paymentObject.payment_method?.type,
        paidAt: event === 'payment.succeeded' ? new Date() : undefined,
        cancelledAt: event === 'payment.canceled' ? new Date() : undefined
      }
    });

    if (event === 'payment.succeeded') {
      // Payment succeeded - complete the order and create enrollments
      await prisma.$transaction(async (tx) => {
        // Update order status
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'COMPLETED' }
        });

        // Create enrollments for all courses in the order
        const enrollments = payment.order.items.map(item => ({
          userId: payment.order.userId,
          courseId: item.courseId,
          status: 'ACTIVE' as const,
          progress: 0
        }));

        await tx.enrollment.createMany({
          data: enrollments,
          skipDuplicates: true // In case enrollment already exists
        });
      });

      console.log(`Payment succeeded for order ${payment.orderId}`);
    } else if (event === 'payment.canceled') {
      // Payment canceled - update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CANCELLED' }
      });

      console.log(`Payment canceled for order ${payment.orderId}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
