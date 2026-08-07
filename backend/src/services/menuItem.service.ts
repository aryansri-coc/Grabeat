import { MenuItemRepository, MenuItemQueryOptions } from '../repositories/menuItem.repository';
import { VenueRepository } from '../repositories/venue.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { TagRepository } from '../repositories/tag.repository';
import { AuditLogRepository } from '../repositories/auditLog.repository';
import { AppError } from '../utils/errors';

export class MenuItemService {
  static async getMenuItems(options: MenuItemQueryOptions = {}) {
    return MenuItemRepository.findAll(options);
  }

  static async getMenuItemById(id: string, includeDeleted = false) {
    const item = await MenuItemRepository.findById(id, includeDeleted);
    if (!item) {
      throw new AppError('Menu item not found', 404);
    }
    return item;
  }

  static async getDeletedMenuItems() {
    return MenuItemRepository.findDeleted();
  }

  static async getMenuItemsByCategory(categoryId: string, includeDeleted = false) {
    const category = await CategoryRepository.findById(categoryId, true);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return MenuItemRepository.findAll({ categoryId, includeDeleted, limit: 100 });
  }

  static async getMenuItemsByVenue(venueId: string, includeDeleted = false) {
    const venue = await VenueRepository.findById(venueId, true);
    if (!venue) {
      throw new AppError('Venue not found', 404);
    }
    return MenuItemRepository.findAll({ venueId, includeDeleted, limit: 100 });
  }

  static async createMenuItem(
    actor: { id: string; email: string } | undefined,
    data: any
  ) {
    const { categoryId, tags, ...itemData } = data;

    // 1. Verify Category exists
    const category = await CategoryRepository.findById(categoryId, true);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const venueId = category.venueId;

    // 2. Resolve tags to Tag IDs if tags are passed as strings
    let tagIds: string[] = [];
    if (tags && tags.length > 0) {
      const resolvedTags = await TagRepository.findOrCreateMany(tags);
      tagIds = resolvedTags.map((t) => t.id);
    }

    // 3. Create menu item
    const menuItem = await MenuItemRepository.create({
      ...itemData,
      categoryId,
      venueId,
      tagIds,
    });

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'CREATE',
        'MenuItem',
        menuItem.id,
        null,
        menuItem
      );
    }

    return menuItem;
  }

  static async updateMenuItem(
    actor: { id: string; email: string } | undefined,
    id: string,
    data: any
  ) {
    const oldItem = await MenuItemRepository.findById(id, true);
    if (!oldItem) {
      throw new AppError('Menu item not found', 404);
    }

    const { categoryId, tags, ...itemData } = data;

    let updateData: any = { ...itemData };

    if (categoryId) {
      const category = await CategoryRepository.findById(categoryId, true);
      if (!category) {
        throw new AppError('Category not found', 404);
      }
      updateData.categoryId = categoryId;
      updateData.venueId = category.venueId;
    }

    if (tags) {
      const resolvedTags = await TagRepository.findOrCreateMany(tags);
      updateData.tagIds = resolvedTags.map((t) => t.id);
    }

    const updated = await MenuItemRepository.update(id, updateData);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'UPDATE',
        'MenuItem',
        id,
        oldItem,
        updated
      );
    }

    return updated;
  }

  static async softDeleteMenuItem(
    actor: { id: string; email: string } | undefined,
    id: string
  ) {
    const oldItem = await MenuItemRepository.findById(id);
    if (!oldItem) {
      throw new AppError('Menu item not found', 404);
    }

    const deleted = await MenuItemRepository.softDelete(id);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'DELETE',
        'MenuItem',
        id,
        oldItem,
        deleted
      );
    }

    return deleted;
  }

  static async restoreMenuItem(
    actor: { id: string; email: string } | undefined,
    id: string
  ) {
    const oldItem = await MenuItemRepository.findById(id, true);
    if (!oldItem || !oldItem.deletedAt) {
      throw new AppError('Menu item not found or not deleted', 404);
    }

    const restored = await MenuItemRepository.restore(id);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'RESTORE',
        'MenuItem',
        id,
        oldItem,
        restored
      );
    }

    return restored;
  }

  static async permanentDeleteMenuItem(
    actor: { id: string; email: string } | undefined,
    id: string
  ) {
    const oldItem = await MenuItemRepository.findById(id, true);
    if (!oldItem) {
      throw new AppError('Menu item not found', 404);
    }

    await MenuItemRepository.permanentDelete(id);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'PERMANENT_DELETE',
        'MenuItem',
        id,
        oldItem,
        null
      );
    }

    return { id };
  }
}
