import { Router } from 'express';
import {
  getVenueCategories,
  getDeletedCategories,
  createCategory,
  updateCategory,
  softDeleteCategory,
  restoreCategory,
  permanentDeleteCategory,
  reorderCategories,
} from '../controllers/category.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Public route to get categories for a venue
// Since it's mounted under /categories and we need venueId, we can support GET /categories/venue/:venueId
router.get('/venue/:venueId', getVenueCategories);

// Admin-only routes
router.use(protect);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.get('/deleted/all', getDeletedCategories);
router.post('/venue/:venueId', createCategory);
router.put('/reorder', reorderCategories);
router.put('/:id', updateCategory);
router.delete('/:id', softDeleteCategory);
router.post('/:id/restore', restoreCategory);
router.delete('/:id/permanent', permanentDeleteCategory);

export default router;
