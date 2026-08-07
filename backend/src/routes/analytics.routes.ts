import { Router } from 'express';
import { getDashboardStats, getAuditLogs } from '../controllers/analytics.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.use(protect);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/audit-logs', getAuditLogs);

export default router;
