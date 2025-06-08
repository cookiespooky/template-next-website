
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { YooKassaService } from '../services/yookassa';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import Joi from 'joi';

const router = Router();
const prisma = new PrismaClient();
const yookassa = new YooKassaService();

// Validation schemas
const createPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('RUB'),
  description: Joi.string().optional(),
  customerEmail: Joi.string().email().optional(),
  customerPhone: Joi.string().optional(),
  customerName: Joi.string().optional(),
  returnUrl: Joi.string().uri().optional(),
  metadata: Joi.object().optional()
});

// Create payment
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = createPaymentSchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400);
    }

    const {
      orderId,
      amount,
      currency,
      description,
      customerEmail,
      customerPhone,
      customerName,
      returnUrl,
      metadata
    } = value;

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId }
    });

    if (existingPayment) {
      throw createError('Payment for this order already exists', 409);
    }

    // Create payment in YooKassa
    const yookassaPayment = await yookassa.createPayment({
      amount: {
        value: amount.toString(),
        currency
      },
      description,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl || process.env.DEFAULT_RETURN_URL
      },
      metadata: {
        orderId,
        ...metadata
      },
      receipt: customerEmail ? {
        customer: {
          email: customerEmail,
          phone: customerPhone
        },
        items: [{
          description: description || 'Course purchase',
          quantity: '1',
          amount: {
            value: amount.toString(),
            currency
          },
          vat_code: 1
        }]
      } : undefined
    });

    // Save payment to database
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        currency,
        description,
        customerEmail,
        customerPhone,
        customerName,
        yookassaPaymentId: yookassaPayment.id,
        yookassaStatus: yookassaPayment.status,
        metadata
      }
    });

    logger.info('Payment created', { paymentId: payment.id, orderId });

    res.status(201).json({
      success: true,
      data: {
        payment,
        confirmationUrl: yookassaPayment.confirmation?.confirmation_url
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get payment by ID
router.get('/:id', async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: {
        refunds: true,
        webhookEvents: true
      }
    });

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
});

// Get payment by order ID
router.get('/order/:orderId', async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId: req.params.orderId },
      include: {
        refunds: true,
        webhookEvents: true
      }
    });

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
});

// Cancel payment
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id }
    });

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    if (payment.status !== 'PENDING') {
      throw createError('Payment cannot be cancelled', 400);
    }

    // Cancel in YooKassa if needed
    if (payment.yookassaPaymentId) {
      await yookassa.cancelPayment(payment.yookassaPaymentId);
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: req.params.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      }
    });

    logger.info('Payment cancelled', { paymentId: payment.id });

    res.json({
      success: true,
      data: updatedPayment
    });
  } catch (error) {
    next(error);
  }
});

// List payments with pagination
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const orderId = req.query.orderId as string;

    const where: any = {};
    if (status) where.status = status;
    if (orderId) where.orderId = { contains: orderId, mode: 'insensitive' };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          refunds: true
        }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
