import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './base.schema';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  parentCategory?: Types.ObjectId; 
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  baseSchemaOptions
);

export const Category = model<ICategory>('Category', categorySchema);