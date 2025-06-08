
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
const createRefundSchema = Joi.object({
  paymentId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('RUB'),
  reason: Joi.string().optional(),
  description: Joi.string().optional()
});

// Create refund
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = createRefundSchema.validate(req.body);
    if (error) {
      throw createError(error.details[0].message, 400);
    }

    const { paymentId, amount, currency, reason, description } = value;

    // Get payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    if (payment.status !== 'SUCCEEDED') {
      throw createError('Payment must be succeeded to refund', 400);
    }

    // Check refund amount
    const existingRefunds = await prisma.refund.findMany({
      where: { paymentId, status: 'SUCCEEDED' }
    });

    const totalRefunded = existingRefunds.reduce(
      (sum, refund) => sum + Number(refund.amount), 0
    );

    if (totalRefunded + amount > Number(payment.amount)) {
      throw createError('Refund amount exceeds payment amount', 400);
    }

    // Create refund in YooKassa
    const yookassaRefund = await yookassa.createRefund(
      payment.yookassaPaymentId!,
      {
        amount: {
          value: amount.toString(),
          currency
        },
        description
      }
    );

    // Save refund to database
    const refund = await prisma.refund.create({
      data: {
        paymentId,
        amount,
        currency,
        reason,
        description,
        yookassaRefundId: yookassaRefund.id,
        status: 'PROCESSING'
      }
    });

    logger.info('Refund created', { refundId: refund.id, paymentId });

    res.status(201).json({
      success: true,
      data: refund
    });
  } catch (error) {
    next(error);
  }
});

// Get refund by ID
router.get('/:id', async (req, res, next) => {
  try {
    const refund = await prisma.refund.findUnique({
      where: { id: req.params.id },
      include: {
        payment: true
      }
    });

    if (!refund) {
      throw createError('Refund not found', 404);
    }

    res.json({
      success: true,
      data: refund
    });
  } catch (error) {
    next(error);
  }
});

// List refunds
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const paymentId = req.query.paymentId as string;

    const where: any = {};
    if (status) where.status = status;
    if (paymentId) where.paymentId = paymentId;

    const [refunds, total] = await Promise.all([
      prisma.refund.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          payment: true
        }
      }),
      prisma.refund.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        refunds,
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
