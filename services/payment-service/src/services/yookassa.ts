
import axios, { AxiosInstance } from 'axios';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface YooKassaPaymentRequest {
  amount: {
    value: string;
    currency: string;
  };
  description?: string;
  confirmation: {
    type: 'redirect';
    return_url?: string;
  };
  metadata?: Record<string, any>;
  receipt?: {
    customer: {
      email?: string;
      phone?: string;
    };
    items: Array<{
      description: string;
      quantity: string;
      amount: {
        value: string;
        currency: string;
      };
      vat_code: number;
    }>;
  };
}

export interface YooKassaPaymentResponse {
  id: string;
  status: string;
  amount: {
    value: string;
    currency: string;
  };
  description?: string;
  confirmation?: {
    type: string;
    confirmation_url?: string;
  };
  metadata?: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface YooKassaRefundRequest {
  amount: {
    value: string;
    currency: string;
  };
  description?: string;
}

export class YooKassaService {
  private client: AxiosInstance;
  private shopId: string;
  private secretKey: string;

  constructor() {
    this.shopId = process.env.YOOKASSA_SHOP_ID || '';
    this.secretKey = process.env.YOOKASSA_SECRET_KEY || '';

    if (!this.shopId || !this.secretKey) {
      throw new Error('YooKassa credentials not configured');
    }

    this.client = axios.create({
      baseURL: 'https://api.yookassa.ru/v3',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': this.generateIdempotenceKey()
      },
      auth: {
        username: this.shopId,
        password: this.secretKey
      }
    });

    // Request interceptor to add idempotence key for each request
    this.client.interceptors.request.use((config) => {
      config.headers['Idempotence-Key'] = this.generateIdempotenceKey();
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('YooKassa API error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        
        if (error.response?.status === 401) {
          throw createError('YooKassa authentication failed', 401);
        }
        
        if (error.response?.status === 400) {
          throw createError(
            error.response.data?.description || 'Invalid request to YooKassa',
            400
          );
        }
        
        throw createError('YooKassa service error', 500);
      }
    );
  }

  private generateIdempotenceKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async createPayment(paymentData: YooKassaPaymentRequest): Promise<YooKassaPaymentResponse> {
    try {
      const response = await this.client.post('/payments', paymentData);
      logger.info('YooKassa payment created', { paymentId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to create YooKassa payment', { error });
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<YooKassaPaymentResponse> {
    try {
      const response = await this.client.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get YooKassa payment', { paymentId, error });
      throw error;
    }
  }

  async cancelPayment(paymentId: string): Promise<YooKassaPaymentResponse> {
    try {
      const response = await this.client.post(`/payments/${paymentId}/cancel`);
      logger.info('YooKassa payment cancelled', { paymentId });
      return response.data;
    } catch (error) {
      logger.error('Failed to cancel YooKassa payment', { paymentId, error });
      throw error;
    }
  }

  async createRefund(
    paymentId: string,
    refundData: YooKassaRefundRequest
  ): Promise<any> {
    try {
      const response = await this.client.post('/refunds', {
        payment_id: paymentId,
        ...refundData
      });
      logger.info('YooKassa refund created', { 
        paymentId, 
        refundId: response.data.id 
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to create YooKassa refund', { paymentId, error });
      throw error;
    }
  }

  async getRefund(refundId: string): Promise<any> {
    try {
      const response = await this.client.get(`/refunds/${refundId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get YooKassa refund', { refundId, error });
      throw error;
    }
  }
}
