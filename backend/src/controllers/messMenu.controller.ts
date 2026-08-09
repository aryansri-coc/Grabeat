import { Response } from 'express';
import { MessMenuService } from '../services/messMenu.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { messMenuSchema } from '../validators';
import { AuthenticatedRequest } from '../types';
import { Day, MealType } from '@prisma/client';
import { AppError } from '../utils/errors';

export const getMessMenu = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await MessMenuService.getMessMenu();
  return sendSuccess(res, 'Weekly mess menu retrieved successfully', result);
});

export const getTodayMessMenu = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await MessMenuService.getTodayMessMenu();
  return sendSuccess(res, "Today's mess menu retrieved successfully", result);
});

export const getMessMenuByDay = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const day = req.params.day.toUpperCase() as Day;
  if (!Object.values(Day).includes(day)) {
    throw new AppError('Invalid day parameter', 400);
  }
  const result = await MessMenuService.getMessMenuByDay(day);
  return sendSuccess(res, `Mess menu for ${day} retrieved successfully`, result);
});

export const saveDayMenu = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const day = req.params.day.toUpperCase() as Day;
  if (!Object.values(Day).includes(day)) {
    throw new AppError('Invalid day parameter', 400);
  }

  const meals = req.body.meals; // Expecting array of { mealType, dishName }
  if (!Array.isArray(meals)) {
    throw new AppError('Meals must be an array of items', 400);
  }

  // Validate each item
  meals.forEach((m: any) => {
    if (!Object.values(MealType).includes(m.mealType)) {
      throw new AppError(`Invalid mealType: ${m.mealType}`, 400);
    }
    if (typeof m.dishName !== 'string' || m.dishName.trim().length === 0) {
      throw new AppError('Dish name must be a non-empty string', 400);
    }
  });

  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;
  const result = await MessMenuService.saveDayMenu(actor, day, meals);
  return sendSuccess(res, `Mess menu for ${day} updated successfully`, result);
});

export const duplicateDayMenu = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { sourceDay, targetDay } = req.body;

  if (!Object.values(Day).includes(sourceDay) || !Object.values(Day).includes(targetDay)) {
    throw new AppError('Invalid source or target day', 400);
  }

  const actor = req.user ? { id: req.user.id, email: req.user.email } : undefined;
  const result = await MessMenuService.duplicateDayMenu(actor, sourceDay, targetDay);
  return sendSuccess(res, `Mess menu duplicated from ${sourceDay} to ${targetDay} successfully`, result);
});

export const rateMessMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const rating = Number(req.body.rating);

  if (isNaN(rating)) {
    throw new AppError('Rating must be a number', 400);
  }

  const result = await MessMenuService.rateMessMenuItem(id, rating);
  return sendSuccess(res, 'Dish rated successfully', result);
});
