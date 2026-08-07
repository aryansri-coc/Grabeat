import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export class AnnouncementRepository {
  static async findById(id: string, includeDeleted = false) {
    return prisma.announcement.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  static async create(data: Prisma.AnnouncementCreateInput) {
    return prisma.announcement.create({ data });
  }

  static async update(id: string, data: Prisma.AnnouncementUpdateInput) {
    return prisma.announcement.update({
      where: { id },
      data,
    });
  }

  static async softDelete(id: string) {
    return prisma.announcement.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async restore(id: string) {
    return prisma.announcement.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  static async permanentDelete(id: string) {
    return prisma.announcement.delete({
      where: { id },
    });
  }

  static async findAll(includeDeleted = false) {
    return prisma.announcement.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      orderBy: [
        { pinned: 'desc' },
        { publishDate: 'desc' },
      ],
    });
  }

  static async findActive() {
    return prisma.announcement.findMany({
      where: {
        deletedAt: null,
        status: 'PUBLISHED',
        publishDate: { lte: new Date() },
      },
      orderBy: [
        { pinned: 'desc' },
        { publishDate: 'desc' },
      ],
    });
  }

  static async findDeleted() {
    return prisma.announcement.findMany({
      where: { NOT: { deletedAt: null } },
      orderBy: { deletedAt: 'desc' },
    });
  }
}
