import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './base.schema';

export interface IReview extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  customerId: Types.ObjectId;
  orderId: Types.ObjectId; 
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  baseSchemaOptions
);

reviewSchema.index({ productId: 1, customerId: 1 }, { unique: true });

export const Review = model<IReview>('Review', reviewSchema);