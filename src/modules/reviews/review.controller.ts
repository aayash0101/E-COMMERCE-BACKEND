import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { reviewService } from './review.service';

export const reviewController = {
    create: asyncHandler(async (req: Request, res: Response) => {
        const review = await reviewService.create(req.user!.userId, req.body);
        res.status(201).json({ success: true, data: { review } });
    }),

    getProductReviews: asyncHandler(async (req: Request, res: Response) => {
        const reviews = await reviewService.getProductReviews(
            req.params.productId
        );
        res.status(200).json({ success: true, data: { reviews } });
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
        const review = await reviewService.update(
            req.params.id,
            req.user!.userId,
            req.body
        );
        res.status(200).json({ success: true, data: { review } });
    }),

    delete: asyncHandler(async (req: Request, res: Response) => {
        await reviewService.delete(req.params.id, req.user!.userId);
        res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
        });
    }),
};
