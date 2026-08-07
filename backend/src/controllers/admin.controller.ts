import { Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { adminSchema } from '../validators';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';

export const getAdmins = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const includeDeleted = req.query.includeDeleted === 'true';
  const admins = await AdminService.getAdmins(includeDeleted);
  return sendSuccess(res, 'Admins retrieved successfully', admins);
});

export const getDeletedAdmins = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const admins = await AdminService.getDeletedAdmins();
  return sendSuccess(res, 'Deleted admins retrieved successfully', admins);
});

export const createAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = adminSchema.parse(req.body);
  const actor = { id: req.user!.id, email: req.user!.email };
  
  const admin = await AdminService.createAdmin(actor, data);
  return sendSuccess(res, 'Admin created successfully', admin, 201);
});

export const updateAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = { id: req.user!.id, email: req.user!.email };
  
  // Custom validation for updates (password is optional)
  const validationResult = adminSchema.partial().parse(req.body);
  
  const admin = await AdminService.updateAdmin(actor, id, validationResult);
  return sendSuccess(res, 'Admin updated successfully', admin);
});

export const softDeleteAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = { id: req.user!.id, email: req.user!.email };
  
  const result = await AdminService.softDeleteAdmin(actor, id);
  return sendSuccess(res, 'Admin soft deleted successfully', result);
});

export const restoreAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = { id: req.user!.id, email: req.user!.email };
  
  const result = await AdminService.restoreAdmin(actor, id);
  return sendSuccess(res, 'Admin restored successfully', result);
});

export const permanentDeleteAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = { id: req.user!.id, email: req.user!.email };
  
  const result = await AdminService.permanentDeleteAdmin(actor, id);
  return sendSuccess(res, 'Admin permanently deleted successfully', result);
});
