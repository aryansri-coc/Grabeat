import { prisma } from '../config/db';

export class AuditLogRepository {
  static async createLog(
    adminId: string | null | undefined,
    adminEmail: string | null | undefined,
    action: string,
    entity: string,
    entityId: string,
    oldValues?: any,
    newValues?: any
  ) {
    try {
      return await prisma.auditLog.create({
        data: {
          adminId: adminId || null,
          adminEmail: adminEmail || null,
          action,
          entity,
          entityId,
          oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
          newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  static async getLogs(limit = 50, offset = 0) {
    return prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  static async getLogsCount() {
    return prisma.auditLog.count();
  }
}
