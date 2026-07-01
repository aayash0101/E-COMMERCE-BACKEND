import { VendorProfile, IVendorProfile, VendorApprovalStatus } from '@models/vendorProfile.model';

interface CreateVendorProfileInput {
  userId: string;
  storeName: string;
  storeDescription?: string;
}

export const vendorProfileRepository = {
  async create(data: CreateVendorProfileInput): Promise<IVendorProfile> {
    return VendorProfile.create(data);
  },

  async update(
    id: string,
    updates: Record<string, unknown>
  ): Promise<IVendorProfile | null> {
    return VendorProfile.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).exec();
  },

  async findAll(): Promise<IVendorProfile[]> {
    return VendorProfile.find().populate('userId', 'name email').exec();
  },

  async findByUserId(userId: string): Promise<IVendorProfile | null> {
    return VendorProfile.findOne({ userId }).exec();
  },

  async findById(id: string): Promise<IVendorProfile | null> {
    return VendorProfile.findById(id).exec();
  },

  async findByStoreName(storeName: string): Promise<IVendorProfile | null> {
    return VendorProfile.findOne({ storeName }).exec();
  },

  async updateApprovalStatus(
    id: string,
    status: VendorApprovalStatus,
    rejectionReason?: string
  ): Promise<IVendorProfile | null> {
    return VendorProfile.findByIdAndUpdate(
      id,
      { approvalStatus: status, rejectionReason: rejectionReason ?? undefined },
      { new: true }
    ).exec();
  },

  async findAllByStatus(status: VendorApprovalStatus): Promise<IVendorProfile[]> {
    return VendorProfile.find({ approvalStatus: status }).exec();
  },
};