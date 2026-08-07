import { Router } from 'express';
import {
  getMessMenu,
  getTodayMessMenu,
  getMessMenuByDay,
  saveDayMenu,
  duplicateDayMenu,
} from '../controllers/messMenu.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/', getMessMenu);
router.get('/today', getTodayMessMenu);
router.get('/day/:day', getMessMenuByDay);

// Admin-only routes
router.use(protect);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.post('/day/:day', saveDayMenu);
router.post('/duplicate', duplicateDayMenu);

export default router;
