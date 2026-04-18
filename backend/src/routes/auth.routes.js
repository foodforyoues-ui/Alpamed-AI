import express from 'express';
import { register, login, getMe, getUsers, deleteUser, updateUserRole } from '../controllers/auth.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rutas de autenticación
router.post('/register', register);
router.post('/login', login);

// Ruta protegida para obtener al usuario actual
router.get('/me', requireAuth, getMe);

// Rutas de administración de usuarios (Solo Admin)
router.get('/users', requireAuth, requireAdmin, getUsers);
router.delete('/users/:id', requireAuth, requireAdmin, deleteUser);
router.put('/users/:id/role', requireAuth, requireAdmin, updateUserRole);

export default router;
