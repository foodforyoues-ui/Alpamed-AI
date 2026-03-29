import { Router } from 'express';
import { getSnapshots, createSnapshot, deleteSnapshot } from '../controllers/snapshot.controller.js';

const router = Router({ mergeParams: true }); // mergeParams para acceder al :id del perfil padre

router.get('/', getSnapshots);
router.post('/', createSnapshot);
router.delete('/:snapshotId', deleteSnapshot);

export default router;
