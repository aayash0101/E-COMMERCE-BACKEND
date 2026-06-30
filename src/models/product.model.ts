import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './base.schema';

export type ProductStatus = 'active' | 'inactive' | 'flagged';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  vendorId: Types.ObjectId; 
  categoryId: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  status: ProductStatus;
  averageRating: number; 
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'VendorProfile',
      required: true,
      index: true, 
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    images: {
      type: [String],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'At least one product image is required',
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'flagged'],
      default: 'active',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  baseSchemaOptions
);

productSchema.index({ name: 'text', description: 'text' });

export const Product = model<IProduct>('Product', productSchema);