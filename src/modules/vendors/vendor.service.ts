import { vendorProfileRepository } from '@repositories/vendorProfile.repository';
import { userRepository } from '@repositories/user.repository';
import { ApiError } from '@utils/ApiError';
import { IVendorProfile } from '@models/vendorProfile.model';
import { ApplyAsVendorInput, UpdateStoreProfileInput } from './vendor.validation';

export const vendorService = {
    async apply(userId: string, input: ApplyAsVendorInput): Promise<IVendorProfile> {
        const existing = await vendorProfileRepository.findByUserId(userId);
        if (existing) {
            throw ApiError.conflict(
                'You have already applied to become a vendor'
            );
        }

        const storeNameTaken = await vendorProfileRepository.findByStoreName(
            input.storeName
        );
        if (storeNameTaken) {
            throw ApiError.conflict(
                'This store name is already taken'
            );
        }

        await userRepository.updateRole(userId, 'vendor');

        return vendorProfileRepository.create({
            userId,
            storeName: input.storeName,
            storeDescription: input.storeDescription,
        });
    },

    async getMyProfile(userId: string): Promise<IVendorProfile> {
        const profile = await vendorProfileRepository.findByUserId(userId);
        if (!profile) {
            throw ApiError.notFound('Vendor profile not found');
        }
        return profile;
    },

    async updateMyProfile(
        userId: string,
        input: UpdateStoreProfileInput
    ): Promise<IVendorProfile> {
        const profile = await vendorProfileRepository.findByUserId(userId);
        if (!profile) {
            throw ApiError.notFound('Vendor profile not found');
        }

        if (input.storeName && input.storeName !== profile.storeName) {
            const taken = await vendorProfileRepository.findByStoreName(input.storeName);
            if (taken) throw ApiError.conflict('This store name is already taken');
        }

        const updated = await vendorProfileRepository.update(
            profile._id.toString(),
            input
        );
        if (!updated) throw ApiError.notFound('Vendor profile not found');
        return updated;
    },
    async getAllVendors(): Promise<IVendorProfile[]> {
        return vendorProfileRepository.findAllByStatus('pending')
            .then(() => vendorProfileRepository.findAll());
    },

    async getVendorById(id: string): Promise<IVendorProfile> {
        const profile = await vendorProfileRepository.findById(id);
        if (!profile) throw ApiError.notFound('Vendor not found');
        return profile;
    },

    async approve(vendorId: string): Promise<IVendorProfile> {
        const profile = await vendorProfileRepository.findById(vendorId);
        if (!profile) throw ApiError.notFound('Vendor not found');

        if (profile.approvalStatus === 'approved') {
            throw ApiError.conflict('This vendor is already approved');
        }

        const updated = await vendorProfileRepository.updateApprovalStatus(
            vendorId,
            'approved'
        );
        if (!updated) throw ApiError.notFound('Vendor not found');
        return updated;
    },

    async reject(vendorId: string, reason: string): Promise<IVendorProfile> {
        const profile = await vendorProfileRepository.findById(vendorId);
        if (!profile) throw ApiError.notFound('Vendor not found');

        if (profile.approvalStatus === 'rejected') {
            throw ApiError.conflict('This vendor is already rejected');
        }

        const updated = await vendorProfileRepository.updateApprovalStatus(
            vendorId,
            'rejected',
            reason
        );
        if (!updated) throw ApiError.notFound('Vendor not found');
        return updated;
    },
};