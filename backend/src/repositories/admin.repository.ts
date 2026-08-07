import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export class AdminRepository {
  static async findById(id: string, includeDeleted = false) {
    return prisma.admin.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  static async findByEmail(email: string, includeDeleted = false) {
    return prisma.admin.findFirst({
      where: {
        email,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  static async create(data: Prisma.AdminCreateInput) {
    return prisma.admin.create({ data });
  }

  static async update(id: string, data: Prisma.AdminUpdateInput) {
    return prisma.admin.update({
      where: { id },
      data,
    });
  }

  static async softDelete(id: string) {
    return prisma.admin.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async restore(id: string) {
    return prisma.admin.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  static async permanentDelete(id: string) {
    return prisma.admin.delete({
      where: { id },
    });
  }

  static async findAll(includeDeleted = false) {
    return prisma.admin.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findDeleted() {
    return prisma.admin.findMany({
      where: { NOT: { deletedAt: null } },
      orderBy: { deletedAt: 'desc' },
    });
  }
}
