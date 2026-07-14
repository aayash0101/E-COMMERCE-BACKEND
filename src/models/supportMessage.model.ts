import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './base.schema';

export type SupportSenderRole = 'customer' | 'admin' | 'system';

export interface ISupportMessage extends Document {
  _id: Types.ObjectId;
  customerId: Types.ObjectId;
  senderRole: SupportSenderRole;
  senderId?: Types.ObjectId;
  message: string;
  readByAdmin: boolean;
  readByCustomer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ['customer', 'admin', 'system'],
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    readByAdmin: {
      type: Boolean,
      default: false,
    },
    readByCustomer: {
      type: Boolean,
      default: true,
    },
  },
  baseSchemaOptions
);

supportMessageSchema.index({ customerId: 1, createdAt: 1 });

export const SupportMessage = model<ISupportMessage>('SupportMessage', supportMessageSchema);