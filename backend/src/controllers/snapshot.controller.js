import prisma from '../config/db.js';

// GET /api/profiles/:id/snapshots → Historial de mediciones
export async function getSnapshots(req, res) {
    try {
        const { id } = req.params;
        const snapshots = await prisma.profileSnapshot.findMany({
            where: { profileId: parseInt(id) },
            orderBy: { recordedAt: 'desc' },
        });
        res.json(snapshots);
    } catch (error) {
        console.error('Error al obtener snapshots:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// POST /api/profiles/:id/snapshots → Registrar nueva medición
export async function createSnapshot(req, res) {
    try {
        const { id } = req.params;
        const profileId = parseInt(id);

        // Verificar que el perfil existe
        const profile = await prisma.profile.findUnique({ where: { id: profileId } });
        if (!profile) return res.status(404).json({ error: 'Perfil no encontrado' });

        const {
            weight, bmi, bodyFatPercentage, muscleMassPercentage,
            metabolicAge, lostWeight, isInitialRecord, notes,
        } = req.body;

        const snapshot = await prisma.profileSnapshot.create({
            data: {
                profileId,
                weight: weight != null ? parseFloat(weight) : null,
                bmi: bmi != null ? parseFloat(bmi) : null,
                bodyFatPercentage: bodyFatPercentage != null ? parseFloat(bodyFatPercentage) : null,
                muscleMassPercentage: muscleMassPercentage != null ? parseFloat(muscleMassPercentage) : null,
                metabolicAge: metabolicAge != null ? parseInt(metabolicAge) : null,
                lostWeight: lostWeight != null ? parseFloat(lostWeight) : null,
                isInitialRecord: isInitialRecord ?? false,
                notes: notes || null,
            }
        });

        res.status(201).json(snapshot);
    } catch (error) {
        console.error('Error al crear snapshot:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// DELETE /api/profiles/:id/snapshots/:snapshotId → Eliminar una medición
export async function deleteSnapshot(req, res) {
    try {
        const { snapshotId } = req.params;
        await prisma.profileSnapshot.delete({ where: { id: parseInt(snapshotId) } });
        res.json({ message: 'Medición eliminada correctamente' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Medición no encontrada' });
        console.error('Error al eliminar snapshot:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
