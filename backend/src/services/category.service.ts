import { CategoryRepository } from '../repositories/category.repository';
import { VenueRepository } from '../repositories/venue.repository';
import { AuditLogRepository } from '../repositories/auditLog.repository';
import { AppError } from '../utils/errors';

export class CategoryService {
  static async getCategoriesByVenue(venueId: string, includeDeleted = false) {
    const venue = await VenueRepository.findById(venueId, true);
    if (!venue) {
      throw new AppError('Venue not found', 404);
    }
    return CategoryRepository.findByVenueId(venueId, includeDeleted);
  }

  static async getDeletedCategories() {
    return CategoryRepository.findDeleted();
  }

  static async createCategory(
    actor: { id: string; email: string } | undefined,
    venueId: string,
    data: any
  ) {
    const venue = await VenueRepository.findById(venueId, true);
    if (!venue) {
      throw new AppError('Venue not found', 404);
    }

    const category = await CategoryRepository.create(venueId, data);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'CREATE',
        'Category',
        category.id,
        null,
        category
      );
    }

    return category;
  }

  static async updateCategory(
    actor: { id: string; email: string } | undefined,
    id: string,
    data: any
  ) {
    const oldCat = await CategoryRepository.findById(id, true);
    if (!oldCat) {
      throw new AppError('Category not found', 404);
    }

    const updated = await CategoryRepository.update(id, data);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'UPDATE',
        'Category',
        id,
        oldCat,
        updated
      );
    }

    return updated;
  }

  static async softDeleteCategory(
    actor: { id: string; email: string } | undefined,
    id: string
  ) {
    const oldCat = await CategoryRepository.findById(id);
    if (!oldCat) {
      throw new AppError('Category not found', 404);
    }

    const deleted = await CategoryRepository.softDelete(id);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'DELETE',
        'Category',
        id,
        oldCat,
        deleted
      );
    }

    return deleted;
  }

  static async restoreCategory(
    actor: { id: string; email: string } | undefined,
    id: string
  ) {
    const oldCat = await CategoryRepository.findById(id, true);
    if (!oldCat || !oldCat.deletedAt) {
      throw new AppError('Category not found or not deleted', 404);
    }

    const restored = await CategoryRepository.restore(id);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'RESTORE',
        'Category',
        id,
        oldCat,
        restored
      );
    }

    return restored;
  }

  static async permanentDeleteCategory(
    actor: { id: string; email: string } | undefined,
    id: string
  ) {
    const oldCat = await CategoryRepository.findById(id, true);
    if (!oldCat) {
      throw new AppError('Category not found', 404);
    }

    await CategoryRepository.permanentDelete(id);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'PERMANENT_DELETE',
        'Category',
        id,
        oldCat,
        null
      );
    }

    return { id };
  }

  static async reorderCategories(
    actor: { id: string; email: string } | undefined,
    orders: { id: string; displayOrder: number }[]
  ) {
    if (!orders || orders.length === 0) return [];
    
    const result = await CategoryRepository.updateDisplayOrder(orders);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'UPDATE_ORDER',
        'Category',
        'bulk',
        null,
        orders
      );
    }

    return result;
  }
}
