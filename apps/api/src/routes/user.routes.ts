import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';
import { authMiddleware, requireRole } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.put('/me', UserController.updateMe);
router.get('/', requireRole('ADMIN', 'LEADER'), UserController.list);
router.get('/:id', UserController.findById);
router.put('/:id', requireRole('ADMIN'), UserController.update);
router.delete('/:id', requireRole('ADMIN'), UserController.deactivate);

export default router;
