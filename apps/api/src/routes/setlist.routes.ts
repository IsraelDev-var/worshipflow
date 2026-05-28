import { Router } from 'express';
import { SetlistController } from '@/controllers/setlist.controller';
import { authMiddleware, requireRole } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

const canWrite = requireRole('ADMIN', 'LEADER');

router.get('/', SetlistController.list);
router.post('/', canWrite, SetlistController.create);
router.get('/:id', SetlistController.findById);
router.put('/:id', canWrite, SetlistController.update);
router.delete('/:id', canWrite, SetlistController.delete);

router.post('/:id/duplicate', canWrite, SetlistController.duplicate);
router.put('/:id/publish', canWrite, SetlistController.publish);
router.put('/:id/reorder', canWrite, SetlistController.reorder);

router.post('/:id/songs', canWrite, SetlistController.addSong);
router.put('/:id/songs/:songId', canWrite, SetlistController.updateSong);
router.delete('/:id/songs/:songId', canWrite, SetlistController.removeSong);

export default router;
