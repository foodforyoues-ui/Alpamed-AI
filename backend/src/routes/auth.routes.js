import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rutas de autenticación
router.post('/register', register);
router.post('/login', login);

// Ruta protegida para obtener al usuario actual
router.get('/me', requireAuth, getMe);

export default router;
