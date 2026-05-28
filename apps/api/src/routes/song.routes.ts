import { Router } from 'express';
import { SongController } from '@/controllers/song.controller';
import { authMiddleware, requireRole } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

const canWrite = requireRole('ADMIN', 'LEADER');

router.get('/', SongController.list);
router.post('/', canWrite, SongController.create);
router.get('/:id', SongController.findById);
router.put('/:id', canWrite, SongController.update);
router.delete('/:id', canWrite, SongController.delete);

router.get('/:id/transpose/:targetKey', SongController.transpose);

router.get('/:id/sections', SongController.getSections);
router.post('/:id/sections', canWrite, SongController.createSection);
router.put('/:id/sections/:sectionId', canWrite, SongController.updateSection);
router.delete('/:id/sections/:sectionId', canWrite, SongController.deleteSection);

export default router;
