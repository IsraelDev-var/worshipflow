import { Router } from 'express';
import { EventController } from '@/controllers/event.controller';
import { authMiddleware, requireRole } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

const canWrite = requireRole('ADMIN', 'LEADER');

router.get('/', EventController.list);
router.post('/', canWrite, EventController.create);
router.get('/:id', EventController.findById);
router.put('/:id', canWrite, EventController.update);
router.delete('/:id', canWrite, EventController.delete);

router.post('/:id/members', canWrite, EventController.assignMember);
router.put('/:id/members/:memberId', canWrite, EventController.updateMember);
router.delete('/:id/members/:memberId', canWrite, EventController.removeMember);
router.put('/:id/members/:memberId/respond', EventController.respondToAssignment);

export default router;
