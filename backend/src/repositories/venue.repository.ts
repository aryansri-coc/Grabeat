import { prisma } from '../config/db';
import { Prisma, VenueStatus, Day } from '@prisma/client';

export interface VenueFilterOptions {
  status?: VenueStatus;
  building?: string;
  search?: string;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
}

export class VenueRepository {
  static async findById(id: string, includeDeleted = false) {
    return prisma.venue.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        operatingHours: true,
        categories: {
          where: includeDeleted ? {} : { deletedAt: null },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  static async create(data: Prisma.VenueCreateInput & { 
    operatingHours?: { day: Day; openingTime: string; closingTime: string; isClosed?: boolean }[];
    images?: { url: string; publicId: string; width?: number; height?: number; altText?: string; displayOrder?: number }[];
  }) {
    const { operatingHours, images, ...venueData } = data;

    return prisma.venue.create({
      data: {
        ...venueData,
        images: images ? {
          create: images,
        } : undefined,
        operatingHours: operatingHours ? {
          create: operatingHours,
        } : undefined,
      },
      include: {
        images: true,
        operatingHours: true,
      },
    });
  }

  static async update(id: string, data: Prisma.VenueUpdateInput & {
    operatingHours?: { day: Day; openingTime: string; closingTime: string; isClosed?: boolean }[];
    images?: { url: string; publicId: string; width?: number; height?: number; altText?: string; displayOrder?: number }[];
  }) {
    const { operatingHours, images, ...venueData } = data;

    // Use a transaction to perform clean updates
    return prisma.$transaction(async (tx) => {
      // If operatingHours is provided, delete existing ones and create new ones
      if (operatingHours) {
        await tx.venueOperatingHours.deleteMany({
          where: { venueId: id },
        });
        await tx.venueOperatingHours.createMany({
          data: operatingHours.map((oh) => ({ ...oh, venueId: id })),
        });
      }

      // If images is provided, delete existing ones and create new ones
      if (images) {
        await tx.venueImage.deleteMany({
          where: { venueId: id },
        });
        await tx.venueImage.createMany({
          data: images.map((img) => ({ ...img, venueId: id })),
        });
      }

      return tx.venue.update({
        where: { id },
        data: venueData,
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          operatingHours: true,
        },
      });
    });
  }

  static async softDelete(id: string) {
    return prisma.venue.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async restore(id: string) {
    return prisma.venue.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  static async permanentDelete(id: string) {
    return prisma.venue.delete({
      where: { id },
    });
  }

  static async findAll(options: VenueFilterOptions = {}) {
    const {
      status,
      building,
      search,
      includeDeleted = false,
      page = 1,
      limit = 10,
    } = options;

    const skip = (page - 1) * limit;

    const whereClause: Prisma.VenueWhereInput = {
      ...(includeDeleted ? {} : { deletedAt: null }),
      ...(status ? { status } : {}),
      ...(building ? { building: { contains: building, mode: 'insensitive' } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.venue.findMany({
        where: whereClause,
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          operatingHours: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.venue.count({ where: whereClause }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  static async findDeleted() {
    return prisma.venue.findMany({
      where: { NOT: { deletedAt: null } },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
      },
      orderBy: { deletedAt: 'desc' },
    });
  }
}
