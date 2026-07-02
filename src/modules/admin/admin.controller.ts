import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { adminService } from './admin.service';

export const adminController = {
    getStats: asyncHandler(async (_req: Request, res: Response) => {
        const stats = await adminService.getStats();
        res.status(200).json({ success: true, data: { stats } });
    }),

    getAllUsers: asyncHandler(async (_req: Request, res: Response) => {
        const users = await adminService.getAllUsers();
        res.status(200).json({ success: true, data: { users } });
    }),

    deactivateUser: asyncHandler(async (req: Request, res: Response) => {
        const user = await adminService.deactivateUser(req.params.userId);
        res.status(200).json({
            success: true,
            message: 'User deactivated successfully',
            data: { user },
        });
    }),

    activateUser: asyncHandler(async (req: Request, res: Response) => {
        const user = await adminService.activateUser(req.params.userId);
        res.status(200).json({
            success: true,
            message: 'User activated successfully',
            data: { user },
        });
    }),

    getAllProducts: asyncHandler(async (_req: Request, res: Response) => {
        const products = await adminService.getAllProducts();
        res.status(200).json({ success: true, data: { products } });
    }),

    flagProduct: asyncHandler(async (req: Request, res: Response) => {
        const product = await adminService.flagProduct(req.params.productId);
        res.status(200).json({
            success: true,
            message: 'Product flagged successfully',
            data: { product },
        });
    }),

    unflagProduct: asyncHandler(async (req: Request, res: Response) => {
        const product = await adminService.unflagProduct(req.params.productId);
        res.status(200).json({
            success: true,
            message: 'Product unflagged successfully',
            data: { product },
        });
    }),

    deleteProduct: asyncHandler(async (req: Request, res: Response) => {
        await adminService.deleteProduct(req.params.productId);
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    }),

    getAllOrders: asyncHandler(async (_req: Request, res: Response) => {
        const orders = await adminService.getAllOrders();
        res.status(200).json({ success: true, data: { orders } });
    }),

    getPendingVendors: asyncHandler(async (_req: Request, res: Response) => {
        const vendors = await adminService.getPendingVendors();
        res.status(200).json({ success: true, data: { vendors } });
    }),

    getRevenueByMonth: asyncHandler(async (_req: Request, res: Response) => {
        const revenue = await adminService.getRevenueByMonth();
        res.status(200).json({ success: true, data: { revenue } });
    }),
};

