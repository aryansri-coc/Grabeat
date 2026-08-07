import { Router } from 'express';
import {
  getAnnouncements,
  getDeletedAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  softDeleteAnnouncement,
  restoreAnnouncement,
  permanentDeleteAnnouncement,
} from '../controllers/announcement.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/', getAnnouncements); // Public lists only active published announcements
router.get('/:id', getAnnouncementById);

// Admin-only routes
router.use(protect);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.get('/deleted/all', getDeletedAnnouncements);
router.post('/', createAnnouncement);
router.put('/:id', updateAnnouncement);
router.delete('/:id', softDeleteAnnouncement);
router.post('/:id/restore', restoreAnnouncement);
router.delete('/:id/permanent', permanentDeleteAnnouncement);

export default router;
