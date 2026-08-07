import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export class CategoryRepository {
  static async findById(id: string, includeDeleted = false) {
    return prisma.venueCategory.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  static async create(venueId: string, data: Prisma.VenueCategoryCreateWithoutVenueInput) {
    return prisma.venueCategory.create({
      data: {
        ...data,
        venueId,
      },
    });
  }

  static async update(id: string, data: Prisma.VenueCategoryUpdateInput) {
    return prisma.venueCategory.update({
      where: { id },
      data,
    });
  }

  static async softDelete(id: string) {
    return prisma.venueCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async restore(id: string) {
    return prisma.venueCategory.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  static async permanentDelete(id: string) {
    return prisma.venueCategory.delete({
      where: { id },
    });
  }

  static async findByVenueId(venueId: string, includeDeleted = false) {
    return prisma.venueCategory.findMany({
      where: {
        venueId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  static async findDeleted() {
    return prisma.venueCategory.findMany({
      where: { NOT: { deletedAt: null } },
      include: {
        venue: true,
      },
      orderBy: { deletedAt: 'desc' },
    });
  }

  static async updateDisplayOrder(categoryOrders: { id: string; displayOrder: number }[]) {
    return prisma.$transaction(
      categoryOrders.map((co) =>
        prisma.venueCategory.update({
          where: { id: co.id },
          data: { displayOrder: co.displayOrder },
        })
      )
    );
  }
}
