import { VenueRepository, VenueFilterOptions } from '../repositories/venue.repository';
import { AuditLogRepository } from '../repositories/auditLog.repository';
import { AppError } from '../utils/errors';
import { Day, VenueStatus } from '@prisma/client';

export class VenueService {
  private static calculateIsOpenNow(venue: any): boolean {
    if (!venue) return false;

    // Manual status override
    if (venue.status === 'TEMPORARILY_CLOSED' || venue.status === 'COMING_SOON' || venue.status === 'MAINTENANCE') {
      return false;
    }
    if (venue.status === 'CLOSED') {
      return false;
    }

    // If manual status is OPEN, check if operating hours are met or if there are none, default to true
    if (!venue.operatingHours || venue.operatingHours.length === 0) {
      return venue.status === 'OPEN';
    }

    const daysOfWeek: Day[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    // We should use local timezone or target server timezone
    const now = new Date();
    const todayDay = daysOfWeek[now.getDay()];

    const todayHours = venue.operatingHours.find((oh: any) => oh.day === todayDay);
    if (!todayHours || todayHours.isClosed) {
      return false;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = todayHours.openingTime.split(':').map(Number);
    const [closeH, closeM] = todayHours.closingTime.split(':').map(Number);

    const openMinutes = openH * 60 + openM;
    let closeMinutes = closeH * 60 + closeM;

    if (closeMinutes <= openMinutes) {
      // Overnight timing (e.g. 09:00 to 02:00 next day)
      closeMinutes += 24 * 60;
      // Also check if current time is in the early morning part of overnight schedule
      if (currentMinutes < openMinutes) {
        // We check yesterday's schedule
        const yesterdayIndex = (now.getDay() - 1 + 7) % 7;
        const yesterdayDay = daysOfWeek[yesterdayIndex];
        const yesterdayHours = venue.operatingHours.find((oh: any) => oh.day === yesterdayDay);
        if (yesterdayHours && !yesterdayHours.isClosed) {
          const [yOpenH, yOpenM] = yesterdayHours.openingTime.split(':').map(Number);
          const [yCloseH, yCloseM] = yesterdayHours.closingTime.split(':').map(Number);
          const yOpenMin = yOpenH * 60 + yOpenM;
          let yCloseMin = yCloseH * 60 + yCloseM;
          if (yCloseMin <= yOpenMin) {
            yCloseMin += 24 * 60;
            const currentMinAdjusted = currentMinutes + 24 * 60;
            return currentMinAdjusted >= yOpenMin && currentMinAdjusted <= yCloseMin;
          }
        }
        return false;
      }
    }

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }

  static enrichVenue(venue: any) {
    if (!venue) return null;
    const isOpenNow = this.calculateIsOpenNow(venue);
    return {
      ...venue,
      isOpenNow,
    };
  }

  static async getVenues(options: VenueFilterOptions = {}) {
    const result = await VenueRepository.findAll(options);
    const enrichedItems = result.items.map((venue) => this.enrichVenue(venue));
    return {
      ...result,
      items: enrichedItems,
    };
  }

  static async getVenueById(id: string, includeDeleted = false) {
    const venue = await VenueRepository.findById(id, includeDeleted);
    if (!venue) {
      throw new AppError('Venue not found', 404);
    }
    return this.enrichVenue(venue);
  }

  static async getDeletedVenues() {
    return VenueRepository.findDeleted();
  }

  static async createVenue(actor: { id: string; email: string } | undefined, data: any) {
    const venue = await VenueRepository.create(data);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'CREATE',
        'Venue',
        venue.id,
        null,
        venue
      );
    }

    return this.enrichVenue(venue);
  }

  static async updateVenue(actor: { id: string; email: string } | undefined, id: string, data: any) {
    const oldVenue = await VenueRepository.findById(id, true);
    if (!oldVenue) {
      throw new AppError('Venue not found', 404);
    }

    const updated = await VenueRepository.update(id, data);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'UPDATE',
        'Venue',
        id,
        oldVenue,
        updated
      );
    }

    return this.enrichVenue(updated);
  }

  static async softDeleteVenue(actor: { id: string; email: string } | undefined, id: string) {
    const oldVenue = await VenueRepository.findById(id);
    if (!oldVenue) {
      throw new AppError('Venue not found', 404);
    }

    const deleted = await VenueRepository.softDelete(id);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'DELETE',
        'Venue',
        id,
        oldVenue,
        deleted
      );
    }

    return deleted;
  }

  static async restoreVenue(actor: { id: string; email: string } | undefined, id: string) {
    const oldVenue = await VenueRepository.findById(id, true);
    if (!oldVenue || !oldVenue.deletedAt) {
      throw new AppError('Venue not found or not deleted', 404);
    }

    const restored = await VenueRepository.restore(id);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'RESTORE',
        'Venue',
        id,
        oldVenue,
        restored
      );
    }

    return this.enrichVenue(restored);
  }

  static async permanentDeleteVenue(actor: { id: string; email: string } | undefined, id: string) {
    const oldVenue = await VenueRepository.findById(id, true);
    if (!oldVenue) {
      throw new AppError('Venue not found', 404);
    }

    await VenueRepository.permanentDelete(id);

    if (actor) {
      await AuditLogRepository.createLog(
        actor.id,
        actor.email,
        'PERMANENT_DELETE',
        'Venue',
        id,
        oldVenue,
        null
      );
    }

    return { id };
  }
}
