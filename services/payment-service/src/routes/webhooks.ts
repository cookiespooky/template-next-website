
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// YooKassa webhook handler
router.post('/yookassa', async (req, res) => {
  try {
    const signature = req.headers['x-yookassa-signature'] as string;
    const body = JSON.stringify(req.body);

    // Verify webhook signature (if configured)
    if (process.env.YOOKASSA_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.YOOKASSA_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        logger.warn('Invalid webhook signature', { signature, expectedSignature });
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event = req.body;
    logger.info('Webhook received', { eventType: event.event, objectId: event.object?.id });

    // Save webhook event
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        eventType: event.event,
        eventData: event,
        paymentId: event.object?.metadata?.orderId ? undefined : null // Will be linked later
      }
    });

    // Process webhook based on event type
    switch (event.event) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.object);
        break;
      case 'payment.canceled':
        await handlePaymentCanceled(event.object);
        break;
      case 'refund.succeeded':
        await handleRefundSucceeded(event.object);
        break;
      default:
        logger.info('Unhandled webhook event', { eventType: event.event });
    }

    // Mark webhook as processed
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { 
        processed: true,
        processedAt: new Date()
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Webhook processing error', { error });
    
    // Save error to webhook event if possible
    try {
      const event = req.body;
      await prisma.webhookEvent.create({
        data: {
          eventType: event.event || 'unknown',
          eventData: event,
          processed: false,
          processingError: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } catch (dbError) {
      logger.error('Failed to save webhook error', { dbError });
    }

    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handlePaymentSucceeded(paymentObject: any) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { yookassaPaymentId: paymentObject.id }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          yookassaStatus: paymentObject.status,
          paidAt: new Date(),
          paymentMethod: paymentObject.payment_method?.type
        }
      });

      logger.info('Payment marked as succeeded', { 
        paymentId: payment.id,
        orderId: payment.orderId 
      });

      // Notify main application about successful payment
      await notifyMainApplication('payment.succeeded', {
        orderId: payment.orderId,
        paymentId: payment.id,
        amount: payment.amount
      });
    }
  } catch (error) {
    logger.error('Error handling payment succeeded', { error });
    throw error;
  }
}

async function handlePaymentCanceled(paymentObject: any) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { yookassaPaymentId: paymentObject.id }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'CANCELLED',
          yookassaStatus: paymentObject.status,
          cancelledAt: new Date()
        }
      });

      logger.info('Payment marked as cancelled', { 
        paymentId: payment.id,
        orderId: payment.orderId 
      });

      // Notify main application about cancelled payment
      await notifyMainApplication('payment.cancelled', {
        orderId: payment.orderId,
        paymentId: payment.id
      });
    }
  } catch (error) {
    logger.error('Error handling payment cancelled', { error });
    throw error;
  }
}

async function handleRefundSucceeded(refundObject: any) {
  try {
    const refund = await prisma.refund.findUnique({
      where: { yookassaRefundId: refundObject.id },
      include: { payment: true }
    });

    if (refund) {
      await prisma.refund.update({
        where: { id: refund.id },
        data: {
          status: 'SUCCEEDED',
          processedAt: new Date()
        }
      });

      // Check if payment should be marked as refunded
      const allRefunds = await prisma.refund.findMany({
        where: { paymentId: refund.paymentId, status: 'SUCCEEDED' }
      });

      const totalRefunded = allRefunds.reduce(
        (sum, r) => sum + Number(r.amount), 0
      );

      const paymentAmount = Number(refund.payment.amount);
      
      if (totalRefunded >= paymentAmount) {
        await prisma.payment.update({
          where: { id: refund.paymentId },
          data: { status: 'REFUNDED' }
        });
      } else {
        await prisma.payment.update({
          where: { id: refund.paymentId },
          data: { status: 'PARTIALLY_REFUNDED' }
        });
      }

      logger.info('Refund marked as succeeded', { 
        refundId: refund.id,
        paymentId: refund.paymentId 
      });

      // Notify main application about successful refund
      await notifyMainApplication('refund.succeeded', {
        orderId: refund.payment.orderId,
        paymentId: refund.paymentId,
        refundId: refund.id,
        amount: refund.amount
      });
    }
  } catch (error) {
    logger.error('Error handling refund succeeded', { error });
    throw error;
  }
}

async function notifyMainApplication(eventType: string, data: any) {
  try {
    const mainAppUrl = process.env.MAIN_APP_URL || 'http://app:3000';
    const webhookSecret = process.env.INTERNAL_WEBHOOK_SECRET || 'internal-secret';

    const payload = {
      event: eventType,
      data,
      timestamp: new Date().toISOString()
    };

    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    // This would be implemented to call the main app's webhook endpoint
    logger.info('Would notify main application', { eventType, data });
  } catch (error) {
    logger.error('Failed to notify main application', { error });
  }
}

export default router;
