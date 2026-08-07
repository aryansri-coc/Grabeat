import { AnnouncementRepository } from '../repositories/announcement.repository';
import { AuditLogRepository } from '../repositories/auditLog.repository';
import { AppError } from '../utils/errors';

export class AnnouncementService {
  static async getAnnouncements(includeDeleted = false) {
    return AnnouncementRepository.findAll(includeDeleted);
  }

  static async getActiveAnnouncements() {
    return AnnouncementRepository.findActive();
  }

  static async getDeletedAnnouncements() {
    return AnnouncementRepository.findDeleted();
  }

  static async getAnnouncementById(id: string, includeDeleted = false) {
    const item = await AnnouncementRepository.findById(id, includeDeleted);
    if (!item) {
      throw new AppError('Announcement not found', 404);
    }
    return item;
  }

  static async createAnnouncement(
    actor: { id: string; email: string } | undefined,
    data: any
  ) {
    const announcement = await AnnouncementRepository.create(data);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'CREATE',
        'Announcement',
        announcement.id,
        null,
        announcement
      );
    }

    return announcement;
  }

  static async updateAnnouncement(
    actor: { id: string; email: string } | undefined,
    id: string,
    data: any
  ) {
    const oldAnn = await AnnouncementRepository.findById(id, true);
    if (!oldAnn) {
      throw new AppError('Announcement not found', 404);
    }

    const updated = await AnnouncementRepository.update(id, data);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'UPDATE',
        'Announcement',
        id,
        oldAnn,
        updated
      );
    }

    return updated;
  }

  static async softDeleteAnnouncement(
    actor: { id: string; email: string } | undefined,
    id: string
  ) {
    const oldAnn = await AnnouncementRepository.findById(id);
    if (!oldAnn) {
      throw new AppError('Announcement not found', 404);
    }

    const deleted = await AnnouncementRepository.softDelete(id);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'DELETE',
        'Announcement',
        id,
        oldAnn,
        deleted
      );
    }

    return deleted;
  }

  static async restoreAnnouncement(
    actor: { id: string; email: string } | undefined,
    id: string
  ) {
    const oldAnn = await AnnouncementRepository.findById(id, true);
    if (!oldAnn || !oldAnn.deletedAt) {
      throw new AppError('Announcement not found or not deleted', 404);
    }

    const restored = await AnnouncementRepository.restore(id);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'RESTORE',
        'Announcement',
        id,
        oldAnn,
        restored
      );
    }

    return restored;
  }

  static async permanentDeleteAnnouncement(
    actor: { id: string; email: string } | undefined,
    id: string
  ) {
    const oldAnn = await AnnouncementRepository.findById(id, true);
    if (!oldAnn) {
      throw new AppError('Announcement not found', 404);
    }

    await AnnouncementRepository.permanentDelete(id);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'PERMANENT_DELETE',
        'Announcement',
        id,
        oldAnn,
        null
      );
    }

    return { id };
  }
}
