import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { categoryService } from './category.service';

export const categoryController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.list();
    res.status(200).json({ success: true, data: { categories } });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.create(req.body);
    res.status(201).json({ success: true, data: { category } });
  }),
};