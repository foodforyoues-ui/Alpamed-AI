import prisma from '../config/db.js';

// GET /api/profiles → Todos los perfiles con su último snapshot
export async function getAllProfiles(req, res) {
    try {
        const profiles = await prisma.profile.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { messages: true, snapshots: true } },
                snapshots: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1, // el snapshot más reciente para mostrar en la tarjeta
                }
            }
        });
        res.json(profiles);
    } catch (error) {
        console.error('Error al obtener perfiles:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// GET /api/profiles/:id → Perfil con historial de mensajes
export async function getProfileById(req, res) {
    try {
        const { id } = req.params;
        const profile = await prisma.profile.findUnique({
            where: { id: parseInt(id) },
            include: {
                messages: { orderBy: { sentAt: 'desc' }, take: 20 },
                snapshots: { orderBy: { recordedAt: 'desc' } },
            }
        });
        if (!profile) return res.status(404).json({ error: 'Perfil no encontrado' });
        res.json(profile);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// POST /api/profiles → Crear nuevo perfil
export async function createProfile(req, res) {
    try {
        const {
            patientName, phone, realAge,
            doesExercise, exerciseType, sleepHours, dailySteps,
            generalRecommendation, specificRecommendations
        } = req.body;

        if (!patientName || !phone) {
            return res.status(400).json({ error: 'Se requiere nombre y teléfono del paciente' });
        }

        const profile = await prisma.profile.create({
            data: {
                patientName,
                phone,
                realAge: realAge != null ? parseInt(realAge) : null,
                doesExercise: doesExercise ?? false,
                exerciseType: exerciseType || null,
                sleepHours: sleepHours != null ? parseFloat(sleepHours) : null,
                dailySteps: dailySteps != null ? parseInt(dailySteps) : null,
                generalRecommendation: generalRecommendation || null,
                specificRecommendations: Array.isArray(specificRecommendations)
                    ? specificRecommendations.filter(r => r?.trim())
                    : [],
            }
        });

        res.status(201).json(profile);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Ya existe un perfil con ese número de teléfono' });
        }
        console.error('Error al crear perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// PUT /api/profiles/:id → Actualizar datos del perfil (no mediciones)
export async function updateProfile(req, res) {
    try {
        const { id } = req.params;
        const {
            patientName, phone, realAge,
            doesExercise, exerciseType, sleepHours, dailySteps,
            generalRecommendation, specificRecommendations
        } = req.body;

        const data = {};
        if (patientName !== undefined) data.patientName = patientName;
        if (phone !== undefined) data.phone = phone;
        if (realAge !== undefined) data.realAge = realAge != null ? parseInt(realAge) : null;
        if (doesExercise !== undefined) data.doesExercise = doesExercise;
        if (exerciseType !== undefined) data.exerciseType = exerciseType;
        if (sleepHours !== undefined) data.sleepHours = sleepHours != null ? parseFloat(sleepHours) : null;
        if (dailySteps !== undefined) data.dailySteps = dailySteps != null ? parseInt(dailySteps) : null;
        if (generalRecommendation !== undefined) data.generalRecommendation = generalRecommendation;
        if (specificRecommendations !== undefined) {
            data.specificRecommendations = Array.isArray(specificRecommendations)
                ? specificRecommendations.filter(r => r?.trim())
                : [];
        }

        const profile = await prisma.profile.update({ where: { id: parseInt(id) }, data });
        res.json(profile);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Perfil no encontrado' });
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// DELETE /api/profiles/:id → Eliminar perfil
export async function deleteProfile(req, res) {
    try {
        const { id } = req.params;
        const numId = parseInt(id);
        await prisma.messageLog.deleteMany({ where: { profileId: numId } });
        await prisma.profileSnapshot.deleteMany({ where: { profileId: numId } });
        await prisma.profile.delete({ where: { id: numId } });
        res.json({ message: 'Perfil eliminado correctamente' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Perfil no encontrado' });
        console.error('Error al eliminar perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
