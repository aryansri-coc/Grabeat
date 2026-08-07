import { Response, NextFunction } from 'express';
import { VenueService } from '../services/venue.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { venueSchema } from '../validators';
import { AuthenticatedRequest } from '../types';
import { uploadToCloudinary } from '../middlewares/upload';
import { AppError } from '../utils/errors';
import { VenueStatus } from '@prisma/client';

export const getVenues = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, building, search, includeDeleted, page, limit } = req.query;

  const options = {
    status: status as VenueStatus | undefined,
    building: building as string | undefined,
    search: search as string | undefined,
    includeDeleted: includeDeleted === 'true',
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  };

  const result = await VenueService.getVenues(options);
  return sendSuccess(res, 'Venues retrieved successfully', result);
});

export const getDeletedVenues = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await VenueService.getDeletedVenues();
  return sendSuccess(res, 'Deleted venues retrieved successfully', result);
});

export const getVenueById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const includeDeleted = req.query.includeDeleted === 'true';
  const venue = await VenueService.getVenueById(id, includeDeleted);
  return sendSuccess(res, 'Venue retrieved successfully', venue);
});

export const createVenue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsedData = venueSchema.parse(req.body);
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const venue = await VenueService.createVenue(actor, parsedData);
  return sendSuccess(res, 'Venue created successfully', venue, 201);
});

export const updateVenue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const parsedData = venueSchema.partial().parse(req.body);
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const venue = await VenueService.updateVenue(actor, id, parsedData);
  return sendSuccess(res, 'Venue updated successfully', venue);
});

export const softDeleteVenue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const result = await VenueService.softDeleteVenue(actor, id);
  return sendSuccess(res, 'Venue soft deleted successfully', result);
});

export const restoreVenue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const result = await VenueService.restoreVenue(actor, id);
  return sendSuccess(res, 'Venue restored successfully', result);
});

export const permanentDeleteVenue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const result = await VenueService.permanentDeleteVenue(actor, id);
  return sendSuccess(res, 'Venue permanently deleted successfully', result);
});

export const uploadVenueImage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const result = await uploadToCloudinary(req.file.buffer, 'venues');
  return sendSuccess(res, 'Image uploaded successfully to Cloudinary', result);
});
