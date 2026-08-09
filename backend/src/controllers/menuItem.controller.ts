import { Response } from 'express';
import { MenuItemService } from '../services/menuItem.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { menuItemSchema } from '../validators';
import { AuthenticatedRequest } from '../types';
import { uploadToCloudinary } from '../middlewares/upload';
import { AppError } from '../utils/errors';

export const getMenuItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { categoryId, venueId, search, vegOnly, featuredOnly, availableOnly, includeDeleted, page, limit } = req.query;

  const options = {
    categoryId: categoryId as string | undefined,
    venueId: venueId as string | undefined,
    search: search as string | undefined,
    vegOnly: vegOnly === 'true',
    featuredOnly: featuredOnly === 'true',
    availableOnly: availableOnly === 'true',
    includeDeleted: includeDeleted === 'true',
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  };

  const result = await MenuItemService.getMenuItems(options);
  return sendSuccess(res, 'Menu items retrieved successfully', result);
});

export const getDeletedMenuItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await MenuItemService.getDeletedMenuItems();
  return sendSuccess(res, 'Deleted menu items retrieved successfully', result);
});

export const getMenuItemById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const includeDeleted = req.query.includeDeleted === 'true';
  const item = await MenuItemService.getMenuItemById(id, includeDeleted);
  return sendSuccess(res, 'Menu item retrieved successfully', item);
});

export const createMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsedData = menuItemSchema.parse(req.body);
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const item = await MenuItemService.createMenuItem(actor, parsedData);
  return sendSuccess(res, 'Menu item created successfully', item, 201);
});

export const updateMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const parsedData = menuItemSchema.partial().parse(req.body);
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const item = await MenuItemService.updateMenuItem(actor, id, parsedData);
  return sendSuccess(res, 'Menu item updated successfully', item);
});

export const softDeleteMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const result = await MenuItemService.softDeleteMenuItem(actor, id);
  return sendSuccess(res, 'Menu item soft deleted successfully', result);
});

export const restoreMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const result = await MenuItemService.restoreMenuItem(actor, id);
  return sendSuccess(res, 'Menu item restored successfully', result);
});

export const permanentDeleteMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const result = await MenuItemService.permanentDeleteMenuItem(actor, id);
  return sendSuccess(res, 'Menu item permanently deleted successfully', result);
});

export const uploadMenuItemImage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const result = await uploadToCloudinary(req.file.buffer, 'products');
  return sendSuccess(res, 'Image uploaded successfully to Cloudinary', result);
});
