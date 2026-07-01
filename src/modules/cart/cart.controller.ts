import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { cartService } from './cart.service';

export const cartController = {
    getCart: asyncHandler(async (req: Request, res: Response) => {
        const cart = await cartService.getCart(req.user!.userId);
        res.status(200).json({ success: true, data: { cart } });
    }),

    addItem: asyncHandler(async (req: Request, res: Response) => {
        const { productId, quantity } = req.body;
        const cart = await cartService.addItem(
            req.user!.userId,
            productId,        
            quantity
        );
        res.status(200).json({ success: true, data: { cart } });
    }),

    updateItem: asyncHandler(async (req: Request, res: Response) => {
        const { productId } = req.params;
        const { quantity } = req.body;
        const cart = await cartService.updateItem(
            req.user!.userId,
            productId,
            quantity
        );
        res.status(200).json({ success: true, data: { cart } });
    }),

    removeItem: asyncHandler(async (req: Request, res: Response) => {
        const cart = await cartService.removeItem(
            req.user!.userId,
            req.params.productId
        );
        res.status(200).json({ success: true, data: { cart } });
    }),

    clearCart: asyncHandler(async (req: Request, res: Response) => {
        await cartService.clearCart(req.user!.userId);
        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
        });
    }),
};