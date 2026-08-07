import { Router } from 'express';
import {
  getMenuItems,
  getDeletedMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  softDeleteMenuItem,
  restoreMenuItem,
  permanentDeleteMenuItem,
  uploadMenuItemImage,
} from '../controllers/menuItem.controller';
import { protect, restrictTo } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// Public routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

// Admin-only routes
router.use(protect);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.get('/deleted/all', getDeletedMenuItems);
router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', softDeleteMenuItem);
router.post('/:id/restore', restoreMenuItem);
router.delete('/:id/permanent', permanentDeleteMenuItem);

// Image uploading route for menu item images
router.post('/upload-image', upload.single('image'), uploadMenuItemImage);

export default router;
