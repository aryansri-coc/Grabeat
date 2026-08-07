import { prisma } from '../config/db';
import { VenueService } from './venue.service';

export class AnalyticsService {
  static async getDashboardStats() {
    const [
      totalVenues,
      totalCategories,
      totalMenuItems,
      announcementsCount,
      venueImagesCount,
      menuItemImagesCount,
      deletedVenuesCount,
      deletedCategoriesCount,
      deletedMenuItemsCount,
      deletedAnnouncementsCount,
      deletedAdminsCount,
    ] = await Promise.all([
      prisma.venue.count({ where: { deletedAt: null } }),
      prisma.venueCategory.count({ where: { deletedAt: null } }),
      prisma.menuItem.count({ where: { deletedAt: null } }),
      prisma.announcement.count({ where: { deletedAt: null } }),
      prisma.venueImage.count(),
      prisma.menuItemImage.count(),
      prisma.venue.count({ where: { NOT: { deletedAt: null } } }),
      prisma.venueCategory.count({ where: { NOT: { deletedAt: null } } }),
      prisma.menuItem.count({ where: { NOT: { deletedAt: null } } }),
      prisma.announcement.count({ where: { NOT: { deletedAt: null } } }),
      prisma.admin.count({ where: { NOT: { deletedAt: null } } }),
    ]);

    // Get "Most Recently Updated Venue"
    const mostRecentlyUpdatedVenue = await prisma.venue.findFirst({
      where: { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, updatedAt: true },
    });

    // Get "Recently Added Venues"
    const recentlyAddedVenues = await prisma.venue.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        images: { orderBy: { displayOrder: 'asc' }, take: 1 },
      },
    });

    // Get Today's Mess Menu
    const messService = require('./messMenu.service').MessMenuService;
    const todayMessMenu = await messService.getTodayMessMenu();

    // Get Venues Open Now
    const allVenues = await prisma.venue.findMany({
      where: { deletedAt: null },
      include: { operatingHours: true },
    });
    
    const venuesWithOpenStatus = allVenues.map((v) => VenueService.enrichVenue(v));
    const openNowCount = venuesWithOpenStatus.filter((v: any) => v.isOpenNow).length;

    // Calculate simulated storage usage
    const totalImages = venueImagesCount + menuItemImagesCount;
    const estimatedStorageMb = parseFloat(((totalImages * 240) / 1024).toFixed(2)); // ~240 KB per image on average

    return {
      totalVenues,
      totalCategories,
      totalMenuItems,
      announcementsCount,
      openNowCount,
      estimatedStorageMb,
      totalImages,
      mostRecentlyUpdatedVenue,
      recentlyAddedVenues,
      todayMessMenu,
      deletedRecords: {
        venues: deletedVenuesCount,
        categories: deletedCategoriesCount,
        menuItems: deletedMenuItemsCount,
        announcements: deletedAnnouncementsCount,
        admins: deletedAdminsCount,
        total: deletedVenuesCount + deletedCategoriesCount + deletedMenuItemsCount + deletedAnnouncementsCount + deletedAdminsCount,
      },
    };
  }
}
