import { Router } from 'express';
import {
  getAdmins,
  getDeletedAdmins,
  createAdmin,
  updateAdmin,
  softDeleteAdmin,
  restoreAdmin,
  permanentDeleteAdmin,
} from '../controllers/admin.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Only SUPER_ADMIN can manage administrative accounts
router.use(protect);
router.use(restrictTo('SUPER_ADMIN'));

router.get('/', getAdmins);
router.get('/deleted', getDeletedAdmins);
router.post('/', createAdmin);
router.put('/:id', updateAdmin);
router.delete('/:id', softDeleteAdmin);
router.post('/:id/restore', restoreAdmin);
router.delete('/:id/permanent', permanentDeleteAdmin);

export default router;
