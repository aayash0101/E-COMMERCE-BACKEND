import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './base.schema';

export type VendorApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface IVendorProfile extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    storeName: string;
    storeDescription?: string;
    logoUrl?: string;
    approvalStatus: VendorApprovalStatus;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const vendorProfileSchema = new Schema<IVendorProfile>(
    {
        userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, 
    },
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      unique: true,
      minlength: 2,
      maxlength: 100,
    },
    storeDescription: {
      type: String,
      maxlength: 1000,
    },
    logoUrl: {
      type: String,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending', 
    },
    rejectionReason: {
      type: String,
    },
    },
  baseSchemaOptions
);

export const VendorProfile = model<IVendorProfile>('VendorProfile', vendorProfileSchema);