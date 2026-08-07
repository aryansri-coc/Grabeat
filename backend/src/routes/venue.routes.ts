import { Router } from 'express';
import {
  getVenues,
  getVenueById,
  getDeletedVenues,
  createVenue,
  updateVenue,
  softDeleteVenue,
  restoreVenue,
  permanentDeleteVenue,
  uploadVenueImage,
} from '../controllers/venue.controller';
import { protect, restrictTo } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// Public routes
router.get('/', getVenues);
router.get('/:id', getVenueById);

// Admin-only routes
router.use(protect);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.get('/deleted/all', getDeletedVenues);
router.post('/', createVenue);
router.put('/:id', updateVenue);
router.delete('/:id', softDeleteVenue);
router.post('/:id/restore', restoreVenue);
router.delete('/:id/permanent', permanentDeleteVenue);

// Image uploading route
router.post('/upload-image', upload.single('image'), uploadVenueImage);

export default router;
