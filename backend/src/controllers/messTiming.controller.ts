import { Response } from 'express';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { MealType } from '@prisma/client';
import { AppError } from '../utils/errors';

export const getMessTimings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const timings = await prisma.messTiming.findMany({
    orderBy: { mealType: 'asc' },
  });
  return sendSuccess(res, 'Mess timings retrieved successfully', timings);
});

export const updateMessTiming = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { mealType, openingTime, closingTime } = req.body;

  if (!Object.values(MealType).includes(mealType)) {
    throw new AppError('Invalid meal type', 400);
  }

  // Time format validation HH:MM
  const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(openingTime) || !timeRegex.test(closingTime)) {
    throw new AppError('Opening and closing times must be in HH:MM format', 400);
  }

  const updatedTiming = await prisma.messTiming.upsert({
    where: { mealType },
    update: { openingTime, closingTime },
    create: { mealType, openingTime, closingTime },
  });

  return sendSuccess(res, 'Mess timing updated successfully', updatedTiming);
});
