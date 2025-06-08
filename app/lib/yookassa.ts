
// YooKassa Payment Integration
// IMPORTANT: Replace with your actual YooKassa credentials

import { YooKassaCreatePayment, YooKassaPayment } from '@/lib/types';

// TODO: Replace these with your actual YooKassa credentials
const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID || 'YOUR_SHOP_ID_HERE';
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY || 'YOUR_SECRET_KEY_HERE';
const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3';

class YooKassaService {
  private getAuthHeader(): string {
    const credentials = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');
    return `Basic ${credentials}`;
  }

  private generateIdempotenceKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async createPayment(paymentData: YooKassaCreatePayment): Promise<YooKassaPayment> {
    try {
      const response = await fetch(`${YOOKASSA_API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Idempotence-Key': this.generateIdempotenceKey(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('YooKassa API Error:', errorData);
        throw new Error(`YooKassa API Error: ${response.status} ${response.statusText}`);
      }

      const payment = await response.json();
      return payment;
    } catch (error) {
      console.error('Error creating YooKassa payment:', error);
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<YooKassaPayment> {
    try {
      const response = await fetch(`${YOOKASSA_API_URL}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('YooKassa API Error:', errorData);
        throw new Error(`YooKassa API Error: ${response.status} ${response.statusText}`);
      }

      const payment = await response.json();
      return payment;
    } catch (error) {
      console.error('Error fetching YooKassa payment:', error);
      throw error;
    }
  }

  async capturePayment(paymentId: string, amount?: { value: string; currency: string }): Promise<YooKassaPayment> {
    try {
      const response = await fetch(`${YOOKASSA_API_URL}/payments/${paymentId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Idempotence-Key': this.generateIdempotenceKey(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(amount ? { amount } : {}),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('YooKassa API Error:', errorData);
        throw new Error(`YooKassa API Error: ${response.status} ${response.statusText}`);
      }

      const payment = await response.json();
      return payment;
    } catch (error) {
      console.error('Error capturing YooKassa payment:', error);
      throw error;
    }
  }

  async cancelPayment(paymentId: string): Promise<YooKassaPayment> {
    try {
      const response = await fetch(`${YOOKASSA_API_URL}/payments/${paymentId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Idempotence-Key': this.generateIdempotenceKey(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('YooKassa API Error:', errorData);
        throw new Error(`YooKassa API Error: ${response.status} ${response.statusText}`);
      }

      const payment = await response.json();
      return payment;
    } catch (error) {
      console.error('Error cancelling YooKassa payment:', error);
      throw error;
    }
  }

  // Webhook signature verification
  verifyWebhookSignature(body: string, signature: string): boolean {
    // TODO: Implement webhook signature verification
    // This is important for production security
    console.warn('Webhook signature verification not implemented');
    return true;
  }

  // Convert YooKassa status to our internal status
  mapPaymentStatus(yookassaStatus: string): 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'CANCELLED' | 'REFUNDED' | 'FAILED' {
    switch (yookassaStatus) {
      case 'pending':
        return 'PENDING';
      case 'waiting_for_capture':
        return 'PROCESSING';
      case 'succeeded':
        return 'SUCCEEDED';
      case 'canceled':
        return 'CANCELLED';
      case 'refunded':
        return 'REFUNDED';
      default:
        return 'FAILED';
    }
  }
}

export const yookassa = new YooKassaService();
