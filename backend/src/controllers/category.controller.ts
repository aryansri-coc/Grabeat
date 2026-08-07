import { Response } from 'express';
import { CategoryService } from '../services/category.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { categorySchema } from '../validators';
import { AuthenticatedRequest } from '../types';

export const getVenueCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const venueId = req.params.venueId;
  const includeDeleted = req.query.includeDeleted === 'true';
  const categories = await CategoryService.getCategoriesByVenue(venueId, includeDeleted);
  return sendSuccess(res, 'Venue categories retrieved successfully', categories);
});

export const getDeletedCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const categories = await CategoryService.getDeletedCategories();
  return sendSuccess(res, 'Deleted categories retrieved successfully', categories);
});

export const createCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const venueId = req.params.venueId;
  const parsedData = categorySchema.parse(req.body);
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const category = await CategoryService.createCategory(actor, venueId, parsedData);
  return sendSuccess(res, 'Category created successfully', category, 201);
});

export const updateCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const parsedData = categorySchema.partial().parse(req.body);
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const category = await CategoryService.updateCategory(actor, id, parsedData);
  return sendSuccess(res, 'Category updated successfully', category);
});

export const softDeleteCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const result = await CategoryService.softDeleteCategory(actor, id);
  return sendSuccess(res, 'Category soft deleted successfully', result);
});

export const restoreCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const result = await CategoryService.restoreCategory(actor, id);
  return sendSuccess(res, 'Category restored successfully', result);
});

export const permanentDeleteCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const result = await CategoryService.permanentDeleteCategory(actor, id);
  return sendSuccess(res, 'Category permanently deleted successfully', result);
});

export const reorderCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const orders = req.body.orders; // Expecting array of { id, displayOrder }
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const result = await CategoryService.reorderCategories(actor, orders);
  return sendSuccess(res, 'Categories reordered successfully', result);
});
