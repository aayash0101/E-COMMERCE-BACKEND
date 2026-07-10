import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { productService } from './product.service';
import { ApiError } from '@utils/ApiError';
export const productController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { search, categoryId, minPrice, maxPrice, page, limit, sortBy } = req.query as never;
    const result = await productService.list(
      { search, categoryId, minPrice, maxPrice },
      { page, limit, sortBy }
    );
    res.status(200).json({ success: true, data: result });
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getById(req.params.id);
    res.status(200).json({ success: true, data: { product } });
  }),
  getMine: asyncHandler(async (req: Request, res: Response) => {
    const products = await productService.getMine(req.vendorProfileId as string);
    res.status(200).json({ success: true, data: { products } });
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      throw ApiError.badRequest('At least one product image is required');
    }
    const imagePaths = files.map((file) => file.path);
    const product = await productService.create(
      req.vendorProfileId as string,
      req.body,
      imagePaths
    );
    res.status(201).json({ success: true, data: { product } });
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.update(
      req.params.id,
      req.vendorProfileId as string,
      req.body
    );
    res.status(200).json({ success: true, data: { product } });
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await productService.remove(req.params.id, req.vendorProfileId as string);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  }),
};