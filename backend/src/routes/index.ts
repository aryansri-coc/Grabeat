import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import venueRoutes from './venue.routes';
import categoryRoutes from './category.routes';
import menuItemRoutes from './menuItem.routes';
import messMenuRoutes from './messMenu.routes';
import announcementRoutes from './announcement.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admins', adminRoutes);
router.use('/venues', venueRoutes);
router.use('/categories', categoryRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/mess-menu', messMenuRoutes);
router.use('/announcements', announcementRoutes);
router.use('/dashboard', analyticsRoutes);

export default router;
