import prisma from '../config/db.js';

export const getAppointments = async (req, res) => {
  try {
    const now = new Date();
    
    // Primero actualizamos las que han pasado su fecha y siguen pendientes
    await prisma.appointment.updateMany({
      where: {
        date: { lt: now },
        status: 'pendiente'
      },
      data: { status: 'caducada' }
    });

    const appointments = await prisma.appointment.findMany({
      include: { profile: true },
      orderBy: { date: 'asc' },
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { profile: true },
    });
    if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { profileId, date, reason, notes } = req.body;
    const appointment = await prisma.appointment.create({
      data: {
        profileId: parseInt(profileId),
        date: new Date(date),
        reason,
        notes,
      },
      include: { profile: true }
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { date, reason, status, notes } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(req.params.id) },
      data: {
        date: date ? new Date(date) : undefined,
        reason,
        status,
        notes,
      },
      include: { profile: true }
    });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    await prisma.appointment.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
