import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './base.schema';

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  refreshToken?: string; 
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, 
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, 
    },
    role: {
      type: String,
      enum: ['customer', 'vendor', 'admin'],
      default: 'customer',
    },
    isActive: {
      type: Boolean,
      default: true, 
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  baseSchemaOptions
);

export const User = model<IUser>('User', userSchema);