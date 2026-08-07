import bcrypt from 'bcrypt';
import { AdminRepository } from '../repositories/admin.repository';
import { AuditLogRepository } from '../repositories/auditLog.repository';
import { AppError } from '../utils/errors';

export class AdminService {
  static async getAdmins(includeDeleted = false) {
    return AdminRepository.findAll(includeDeleted);
  }

  static async getDeletedAdmins() {
    return AdminRepository.findDeleted();
  }

  static async createAdmin(
    actor: { id: string; email: string },
    data: any
  ) {
    const existing = await AdminRepository.findByEmail(data.email, true);
    if (existing) {
      throw new AppError('An admin with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password || 'password123', 10);
    const admin = await AdminRepository.create({
      ...data,
      password: hashedPassword,
    });

    await AuditLogRepository.createLog(
      actor.id,
      actor.email,
      'CREATE',
      'Admin',
      admin.id,
      null,
      { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
    );

    return admin;
  }

  static async updateAdmin(
    actor: { id: string; email: string },
    id: string,
    data: any
  ) {
    const existing = await AdminRepository.findById(id, true);
    if (!existing) {
      throw new AppError('Admin not found');
    }

    const oldValues = { name: existing.name, email: existing.email, role: existing.role };
    const updateData: any = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await AdminRepository.update(id, updateData);

    await AuditLogRepository.createLog(
      actor.id,
      actor.email,
      'UPDATE',
      'Admin',
      id,
      oldValues,
      { name: updated.name, email: updated.email, role: updated.role }
    );

    return updated;
  }

  static async softDeleteAdmin(
    actor: { id: string; email: string },
    id: string
  ) {
    if (actor.id === id) {
      throw new AppError('You cannot delete your own admin account');
    }

    const existing = await AdminRepository.findById(id);
    if (!existing) {
      throw new AppError('Admin not found');
    }

    const deleted = await AdminRepository.softDelete(id);

    await AuditLogRepository.createLog(
      actor.id,
      actor.email,
      'DELETE',
      'Admin',
      id,
      { name: existing.name, email: existing.email, role: existing.role },
      { deletedAt: deleted.deletedAt }
    );

    return deleted;
  }

  static async restoreAdmin(
    actor: { id: string; email: string },
    id: string
  ) {
    const existing = await AdminRepository.findById(id, true);
    if (!existing || !existing.deletedAt) {
      throw new AppError('Admin not found or not deleted');
    }

    const restored = await AdminRepository.restore(id);

    await AuditLogRepository.createLog(
      actor.id,
      actor.email,
      'RESTORE',
      'Admin',
      id,
      { deletedAt: existing.deletedAt },
      { deletedAt: null }
    );

    return restored;
  }

  static async permanentDeleteAdmin(
    actor: { id: string; email: string },
    id: string
  ) {
    if (actor.id === id) {
      throw new AppError('You cannot delete your own admin account');
    }

    const existing = await AdminRepository.findById(id, true);
    if (!existing) {
      throw new AppError('Admin not found');
    }

    await AdminRepository.permanentDelete(id);

    await AuditLogRepository.createLog(
      actor.id,
      actor.email,
      'PERMANENT_DELETE',
      'Admin',
      id,
      { name: existing.name, email: existing.email, role: existing.role },
      null
    );

    return { id };
  }
}
