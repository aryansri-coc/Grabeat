import { prisma } from '../config/db';
import { Prisma, Day, MealType } from '@prisma/client';

export class MessMenuRepository {
  static async findById(id: string) {
    return prisma.messMenu.findUnique({
      where: { id },
    });
  }

  static async create(data: Prisma.MessMenuCreateInput) {
    return prisma.messMenu.create({ data });
  }

  static async update(id: string, data: Prisma.MessMenuUpdateInput) {
    return prisma.messMenu.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.messMenu.delete({
      where: { id },
    });
  }

  static async findAll() {
    return prisma.messMenu.findMany({
      orderBy: [
        { day: 'asc' },
        { mealType: 'asc' },
      ],
    });
  }

  static async findByDay(day: Day) {
    return prisma.messMenu.findMany({
      where: { day },
      orderBy: { mealType: 'asc' },
    });
  }

  static async saveDayMenu(day: Day, meals: { mealType: MealType; dishName: string }[]) {
    return prisma.$transaction(async (tx) => {
      // Clear existing dishes for this day
      await tx.messMenu.deleteMany({
        where: { day },
      });

      // Create new ones
      if (meals && meals.length > 0) {
        await tx.messMenu.createMany({
          data: meals.map((m) => ({
            day,
            mealType: m.mealType,
            dishName: m.dishName,
          })),
        });
      }

      return tx.messMenu.findMany({
        where: { day },
        orderBy: { mealType: 'asc' },
      });
    });
  }

  static async duplicateDay(sourceDay: Day, targetDay: Day) {
    return prisma.$transaction(async (tx) => {
      const sourceMeals = await tx.messMenu.findMany({
        where: { day: sourceDay },
      });

      await tx.messMenu.deleteMany({
        where: { day: targetDay },
      });

      if (sourceMeals.length > 0) {
        await tx.messMenu.createMany({
          data: sourceMeals.map((m) => ({
            day: targetDay,
            mealType: m.mealType,
            dishName: m.dishName,
          })),
        });
      }

      return tx.messMenu.findMany({
        where: { day: targetDay },
        orderBy: { mealType: 'asc' },
      });
    });
  }
}
