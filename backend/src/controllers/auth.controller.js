import prisma from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nutria_super_secret_key_2026';

export const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const finalRole = (role === 'admin' || role === 'user') ? role : 'user';

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: finalRole,
            },
        });

        const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error en getMe:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error en getUsers:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        
        if (req.user.id === userId) {
            return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error en deleteUser:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (role !== 'admin' && role !== 'user') {
            return res.status(400).json({ error: 'Rol inválido' });
        }
        
        const userId = parseInt(id);
        
        if (req.user.id === userId) {
            return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        res.status(200).json({ message: 'Rol actualizado exitosamente', user: { id: updatedUser.id, role: updatedUser.role } });
    } catch (error) {
        console.error('Error en updateUserRole:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
