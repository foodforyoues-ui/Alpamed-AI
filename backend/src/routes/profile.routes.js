import { Router } from 'express';
import {
    getAllProfiles,
    getProfileById,
    createProfile,
    updateProfile,
    deleteProfile
} from '../controllers/profile.controller.js';

const router = Router();

router.get('/', getAllProfiles);
router.get('/:id', getProfileById);
router.post('/', createProfile);
router.put('/:id', updateProfile);
router.delete('/:id', deleteProfile);

export default router;
