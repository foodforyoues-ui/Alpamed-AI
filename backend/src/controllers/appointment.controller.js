import prisma from '../config/db.js';
import { generateAppointmentReminder } from '../services/ai.js';
import { sendWhatsAppMessage, getIsReady } from '../services/whatsapp.js';

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
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID de cita inválido' });

    const appointment = await prisma.appointment.findUnique({
      where: { id },
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


export const sendAppointmentReminders = async (req, res) => {
  const io = req.app.get('io');
  
  if (!getIsReady()) {
    return res.status(503).json({ error: 'WhatsApp no está conectado' });
  }

  try {
    const pendingAppointments = await prisma.appointment.findMany({
      where: { 
        status: 'pendiente',
        profile: { active: true }
      },
      include: { profile: true },
      orderBy: { date: 'asc' }
    });

    if (pendingAppointments.length === 0) {
      return res.status(200).json({ message: 'No hay citas pendientes para recordar' });
    }

    res.status(202).json({ 
      message: 'Procesando recordatorios...',
      total: pendingAppointments.length 
    });

    // Procesar en segundo plano
    (async () => {
      let sentCount = 0;
      let failedCount = 0;
      console.log(`Iniciando envío de ${pendingAppointments.length} recordatorios...`);

      for (const app of pendingAppointments) {
        try {
          console.log(`Generando recordatorio para: ${app.profile.patientName}...`);
          const text = await generateAppointmentReminder(app.profile, app);
          
          console.log(`Enviando a ${app.profile.phone}...`);
          await sendWhatsAppMessage(app.profile.phone, text);
          
          sentCount++;
          console.log(`✅ Enviado con éxito a ${app.profile.patientName}`);
        } catch (err) {
          console.error(`❌ Error en recordatorio para ${app.profile.patientName}:`, err.message);
          failedCount++;
        }

        io.emit('appointment_reminder_progress', {
          current: sentCount + failedCount,
          total: pendingAppointments.length,
          lastPatient: app.profile.patientName,
          success: true
        });

        // Retraso de 2 segundos entre envíos
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(`Envío completado. Éxito: ${sentCount}, Fallos: ${failedCount}`);
      io.emit('appointment_reminder_complete', { sentCount, failedCount });
    })();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
