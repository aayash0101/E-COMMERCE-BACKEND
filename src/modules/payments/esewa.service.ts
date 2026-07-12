import crypto from 'crypto';
import { env } from '@config/env';

interface EsewaFormFields {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

function generateSignature(message: string): string {
  return crypto
    .createHmac('sha256', env.esewa.secretKey)
    .update(message)
    .digest('base64');
}

export const esewaService = {
  
  buildPaymentForm(
    totalAmount: number,
    transactionUuid: string
  ): { paymentUrl: string; fields: EsewaFormFields } {
    const amount = totalAmount.toFixed(2);
    const signedFieldNames = 'total_amount,transaction_uuid,product_code';
    const message = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${env.esewa.merchantCode}`;
    const signature = generateSignature(message);

    const fields: EsewaFormFields = {
      amount,
      tax_amount: '0',
      total_amount: amount,
      transaction_uuid: transactionUuid,
      product_code: env.esewa.merchantCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: `${env.frontendUrl}/payment/esewa/callback`,
      failure_url: `${env.frontendUrl}/payment/esewa/failure`,
      signed_field_names: signedFieldNames,
      signature,
    };

    return { paymentUrl: env.esewa.paymentUrl, fields };
  },

  
  decodeAndVerifyCallback(base64Data: string): Record<string, string> | null {
    let decoded: Record<string, string>;
    try {
      const json = Buffer.from(base64Data, 'base64').toString('utf-8');
      decoded = JSON.parse(json);
    } catch {
      return null;
    }

    const signedFieldNames = decoded.signed_field_names;
    if (!signedFieldNames) return null;

    const fieldNames = signedFieldNames.split(',');
    const message = fieldNames.map((field) => `${field}=${decoded[field]}`).join(',');
    const expectedSignature = generateSignature(message);

    if (expectedSignature !== decoded.signature) return null;
    return decoded;
  },


  async checkTransactionStatus(
    totalAmount: string,
    transactionUuid: string
  ): Promise<string> {
    const url = new URL(env.esewa.verifyUrl);
    url.searchParams.set('product_code', env.esewa.merchantCode);
    url.searchParams.set('total_amount', totalAmount);
    url.searchParams.set('transaction_uuid', transactionUuid);

    const response = await fetch(url.toString());
    const data = (await response.json()) as { status?: string };
    return data.status ?? 'UNKNOWN';
  },
};