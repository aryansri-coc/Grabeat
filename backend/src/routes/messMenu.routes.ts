import { Router } from 'express';
import {
  getMessMenu,
  getTodayMessMenu,
  getMessMenuByDay,
  saveDayMenu,
  duplicateDayMenu,
  rateMessMenuItem,
} from '../controllers/messMenu.controller';
import { getMessTimings, updateMessTiming } from '../controllers/messTiming.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/', getMessMenu);
router.get('/today', getTodayMessMenu);
router.get('/day/:day', getMessMenuByDay);
router.post('/:id/rate', rateMessMenuItem);
router.get('/timings', getMessTimings);

// Admin-only routes
router.use(protect);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.post('/day/:day', saveDayMenu);
router.post('/duplicate', duplicateDayMenu);
router.put('/timings', updateMessTiming);

export default router;
