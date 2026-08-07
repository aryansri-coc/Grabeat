import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export interface MenuItemQueryOptions {
  categoryId?: string;
  venueId?: string;
  search?: string;
  vegOnly?: boolean;
  featuredOnly?: boolean;
  availableOnly?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
}

export class MenuItemRepository {
  static async findById(id: string, includeDeleted = false) {
    return prisma.menuItem.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        tags: { include: { tag: true } },
        category: true,
        venue: true,
      },
    });
  }

  static async create(data: Prisma.MenuItemCreateInput & {
    images?: { url: string; publicId: string; width?: number; height?: number; altText?: string; displayOrder?: number }[];
    tagIds?: string[];
  }) {
    const { images, tagIds, ...itemData } = data;

    return prisma.menuItem.create({
      data: {
        ...itemData,
        images: images ? {
          create: images,
        } : undefined,
        tags: tagIds ? {
          create: tagIds.map((tagId) => ({ tagId })),
        } : undefined,
      },
      include: {
        images: true,
        tags: { include: { tag: true } },
      },
    });
  }

  static async update(id: string, data: Prisma.MenuItemUpdateInput & {
    images?: { url: string; publicId: string; width?: number; height?: number; altText?: string; displayOrder?: number }[];
    tagIds?: string[];
  }) {
    const { images, tagIds, ...itemData } = data;

    return prisma.$transaction(async (tx) => {
      // Handle images replacement if provided
      if (images) {
        await tx.menuItemImage.deleteMany({ where: { menuItemId: id } });
        await tx.menuItemImage.createMany({
          data: images.map((img) => ({ ...img, menuItemId: id })),
        });
      }

      // Handle tags replacement if provided
      if (tagIds) {
        await tx.menuItemTag.deleteMany({ where: { menuItemId: id } });
        await tx.menuItemTag.createMany({
          data: tagIds.map((tagId) => ({ tagId, menuItemId: id })),
        });
      }

      return tx.menuItem.update({
        where: { id },
        data: itemData,
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          tags: { include: { tag: true } },
          category: true,
          venue: true,
        },
      });
    });
  }

  static async softDelete(id: string) {
    return prisma.menuItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async restore(id: string) {
    return prisma.menuItem.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  static async permanentDelete(id: string) {
    return prisma.menuItem.delete({
      where: { id },
    });
  }

  static async findAll(options: MenuItemQueryOptions = {}) {
    const {
      categoryId,
      venueId,
      search,
      vegOnly,
      featuredOnly,
      availableOnly,
      includeDeleted = false,
      page = 1,
      limit = 20,
    } = options;

    const skip = (page - 1) * limit;

    const whereClause: Prisma.MenuItemWhereInput = {
      ...(includeDeleted ? {} : { deletedAt: null }),
      ...(categoryId ? { categoryId } : {}),
      ...(venueId ? { venueId } : {}),
      ...(featuredOnly ? { featured: true } : {}),
      ...(availableOnly ? { available: true } : {}),
    };

    // If searching, build standard filtering
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venue: { name: { contains: search, mode: 'insensitive' } } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        {
          tags: {
            some: {
              tag: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    // Special condition if vegOnly is requested, check if item has "Veg" tag
    if (vegOnly) {
      whereClause.tags = {
        some: {
          tag: {
            name: { equals: 'Veg', mode: 'insensitive' },
          },
        },
      };
    }

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where: whereClause,
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          tags: { include: { tag: true } },
          category: true,
          venue: {
            select: { id: true, name: true, status: true, building: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.menuItem.count({ where: whereClause }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  static async findDeleted() {
    return prisma.menuItem.findMany({
      where: { NOT: { deletedAt: null } },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
        venue: true,
      },
      orderBy: { deletedAt: 'desc' },
    });
  }
}
