import { Router } from 'express';
import { CategoryController } from '@/controllers/category.controller';
import { authMiddleware, requireRole } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

const canWrite = requireRole('ADMIN', 'LEADER');

router.get('/', CategoryController.list);
router.post('/', canWrite, CategoryController.create);
router.put('/:id', canWrite, CategoryController.update);
router.delete('/:id', canWrite, CategoryController.delete);

export default router;
