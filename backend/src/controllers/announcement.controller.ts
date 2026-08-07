import { Response } from 'express';
import { AnnouncementService } from '../services/announcement.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { announcementSchema } from '../validators';
import { AuthenticatedRequest } from '../types';

export const getAnnouncements = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const includeDeleted = req.query.includeDeleted === 'true';
  const showAll = req.query.showAll === 'true'; // Admin view vs public view
  
  let result;
  if (showAll) {
    result = await AnnouncementService.getAnnouncements(includeDeleted);
  } else {
    result = await AnnouncementService.getActiveAnnouncements();
  }
  return sendSuccess(res, 'Announcements retrieved successfully', result);
});

export const getDeletedAnnouncements = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await AnnouncementService.getDeletedAnnouncements();
  return sendSuccess(res, 'Deleted announcements retrieved successfully', result);
});

export const getAnnouncementById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const includeDeleted = req.query.includeDeleted === 'true';
  const item = await AnnouncementService.getAnnouncementById(id, includeDeleted);
  return sendSuccess(res, 'Announcement retrieved successfully', item);
});

export const createAnnouncement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsedData = announcementSchema.parse(req.body);
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const announcement = await AnnouncementService.createAnnouncement(actor, parsedData);
  return sendSuccess(res, 'Announcement created successfully', announcement, 201);
});

export const updateAnnouncement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const parsedData = announcementSchema.partial().parse(req.body);
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const announcement = await AnnouncementService.updateAnnouncement(actor, id, parsedData);
  return sendSuccess(res, 'Announcement updated successfully', announcement);
});

export const softDeleteAnnouncement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const result = await AnnouncementService.softDeleteAnnouncement(actor, id);
  return sendSuccess(res, 'Announcement soft deleted successfully', result);
});

export const restoreAnnouncement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const result = await AnnouncementService.restoreAnnouncement(actor, id);
  return sendSuccess(res, 'Announcement restored successfully', result);
});

export const permanentDeleteAnnouncement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;

  const result = await AnnouncementService.permanentDeleteAnnouncement(actor, id);
  return sendSuccess(res, 'Announcement permanently deleted successfully', result);
});
