import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { orderService } from './order.service';
export const orderController = {
    placeOrder: asyncHandler(async (req: Request, res: Response) => {
        const order = await orderService.placeOrder(req.user!.userId, req.body);
        res.status(201).json({ success: true, data: { order } });
    }),
    getMyOrders: asyncHandler(async (req: Request, res: Response) => {
        const orders = await orderService.getMyOrders(req.user!.userId);
        res.status(200).json({ success: true, data: { orders } });
    }),
    getOrderById: asyncHandler(async (req: Request, res: Response) => {
        const order = await orderService.getOrderById(
            req.params.id,
            req.user!.userId,
            req.user!.role
        );
        res.status(200).json({ success: true, data: { order } });
    }),
    cancelOrder: asyncHandler(async (req: Request, res: Response) => {
        const order = await orderService.cancelOrder(
            req.params.id,
            req.user!.userId,
            req.body.reason
        );
        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: { order },
        });
    }),
    getVendorOrders: asyncHandler(async (req: Request, res: Response) => {
        const orders = await orderService.getVendorOrders(
            req.vendorProfileId as string
        );
        res.status(200).json({ success: true, data: { orders } });
    }),
    updateItemStatus: asyncHandler(async (req: Request, res: Response) => {
        const order = await orderService.updateItemStatus(
            req.params.id,
            req.params.itemId,
            req.vendorProfileId as string,
            req.body.status
        );
        res.status(200).json({ success: true, data: { order } });
    }),
};