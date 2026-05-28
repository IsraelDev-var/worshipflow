import { Router } from 'express';
import { OrganizationController } from '@/controllers/organization.controller';
import { authMiddleware, requireRole } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/current', OrganizationController.getCurrent);
router.put('/current', requireRole('ADMIN'), OrganizationController.update);
router.get('/current/stats', requireRole('ADMIN', 'LEADER'), OrganizationController.getStats);

export default router;
