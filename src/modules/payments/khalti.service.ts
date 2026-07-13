import { env } from '@config/env';

interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
}

interface KhaltiLookupResponse {
  pidx: string;
  total_amount: number;
  status: string; 
  transaction_id: string;
  fee: number;
  refunded: boolean;
}

export const khaltiService = {
  async initiatePayment(
    orderId: string,
    totalAmount: number,
    orderName: string
  ): Promise<{ pidx: string; paymentUrl: string }> {
    // Khalti expects amount in paisa (1 NPR = 100 paisa)
    const amountInPaisa = Math.round(totalAmount * 100);

    const payload = {
      return_url: `${env.frontendUrl}/payment/khalti/callback`,
      website_url: env.frontendUrl,
      amount: amountInPaisa,
      purchase_order_id: orderId,
      purchase_order_name: orderName,
    };

    const response = await fetch(env.khalti.initiateUrl, {
      method: 'POST',
      headers: {
        Authorization: `Key ${env.khalti.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Khalti initiate failed: ${error}`);
    }

    const data = (await response.json()) as KhaltiInitiateResponse;
    return { pidx: data.pidx, paymentUrl: data.payment_url };
  },

  async verifyPayment(pidx: string): Promise<KhaltiLookupResponse> {
    const response = await fetch(env.khalti.verifyUrl, {
      method: 'POST',
      headers: {
        Authorization: `Key ${env.khalti.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Khalti verify failed: ${error}`);
    }

    return (await response.json()) as KhaltiLookupResponse;
  },
};