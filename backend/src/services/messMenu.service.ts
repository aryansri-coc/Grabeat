import { MessMenuRepository } from '../repositories/messMenu.repository';
import { AuditLogRepository } from '../repositories/auditLog.repository';
import { Day, MealType } from '@prisma/client';
import { AppError } from '../utils/errors';

export class MessMenuService {
  static async getMessMenu() {
    return MessMenuRepository.findAll();
  }

  static async getMessMenuByDay(day: Day) {
    return MessMenuRepository.findByDay(day);
  }

  static async getTodayMessMenu() {
    const daysOfWeek: Day[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const todayIndex = new Date().getDay();
    const todayDay = daysOfWeek[todayIndex];
    return MessMenuRepository.findByDay(todayDay);
  }

  static async saveDayMenu(
    actor: { id: string; email: string } | undefined,
    day: Day,
    meals: { mealType: MealType; dishName: string }[]
  ) {
    const oldMenu = await MessMenuRepository.findByDay(day);
    const saved = await MessMenuRepository.saveDayMenu(day, meals);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'UPDATE_MESS_MENU',
        'MessMenu',
        day,
        oldMenu,
        saved
      );
    }

    return saved;
  }

  static async duplicateDayMenu(
    actor: { id: string; email: string } | undefined,
    sourceDay: Day,
    targetDay: Day
  ) {
    const oldMenu = await MessMenuRepository.findByDay(targetDay);
    const duplicated = await MessMenuRepository.duplicateDay(sourceDay, targetDay);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'DUPLICATE_MESS_MENU',
        'MessMenu',
        targetDay,
        oldMenu,
        duplicated
      );
    }

    return duplicated;
  }

  static async rateMessMenuItem(id: string, rating: number) {
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }
    return MessMenuRepository.rateItem(id, rating);
  }
}
