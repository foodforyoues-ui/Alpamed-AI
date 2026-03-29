import { Router } from 'express';
import { broadcastMessages, getStatus } from '../controllers/broadcast.controller.js';

const router = Router();

// Middleware que inyecta el io en el req para que el controlador pueda emitir eventos
router.use((req, res, next) => {
    req.io = req.app.get('io');
    next();
});

router.get('/status', getStatus);
router.post('/broadcast', broadcastMessages);

export default router;
