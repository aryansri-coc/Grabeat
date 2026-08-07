import { Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { AuditLogRepository } from '../repositories/auditLog.repository';

export const getDashboardStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const stats = await AnalyticsService.getDashboardStats();
  return sendSuccess(res, 'Dashboard statistics retrieved successfully', stats);
});

export const getAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
  
  const logs = await AuditLogRepository.getLogs(limit, offset);
  const total = await AuditLogRepository.getLogsCount();
  
  return sendSuccess(res, 'Audit logs retrieved successfully', { logs, total, limit, offset });
});
