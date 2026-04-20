import prisma from '../config/db.js';
import { generateAppointmentReminder } from '../services/ai.js';
import { sendWhatsAppMessage, getAnyReadyClientId } from '../services/whatsapp.js';

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

    // Para evitar problemas de zona horaria con servidores en Europa (ej. europe-west4),
    // calculamos las fechas usando matematicas absolutas en UTC para El Salvador (UTC-6).
    const nowSV = new Date(now.getTime() - (6 * 60 * 60 * 1000));
    const svTomorrow = new Date(Date.UTC(nowSV.getUTCFullYear(), nowSV.getUTCMonth(), nowSV.getUTCDate() + 1));

    const markedAppointments = appointments.map(app => {
      const appDateSV = new Date(new Date(app.date).getTime() - (6 * 60 * 60 * 1000));
      const isNextDay = 
        appDateSV.getUTCFullYear() === svTomorrow.getUTCFullYear() &&
        appDateSV.getUTCMonth() === svTomorrow.getUTCMonth() &&
        appDateSV.getUTCDate() === svTomorrow.getUTCDate();

      return {
        ...app,
        isNextDay
      };
    });

    res.json(markedAppointments);
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
  const readyClientId = getAnyReadyClientId();

  if (!readyClientId) {
    return res.status(503).json({ error: 'WhatsApp no está conectado' });
  }

  try {
    const rawAppointments = await prisma.appointment.findMany({
      where: { 
        status: 'pendiente',
        profile: { active: true }
      },
      include: { profile: true },
      orderBy: { date: 'asc' }
    });

    // El Salvador is UTC-6. "Tomorrow in SV" = the 24-hour window that
    // starts at SV midnight (= UTC+6h) and ends 24h later.
    const now = new Date();
    // Shift "now" to SV local time expressed in UTC fields
    const nowSV = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const svYear  = nowSV.getUTCFullYear();
    const svMonth = nowSV.getUTCMonth();
    const svDate  = nowSV.getUTCDate();

    // SV midnight = UTC + 6 hours  (UTC-6 means midnight SV is 06:00 UTC next UTC day)
    const tomorrowStartUTC = new Date(Date.UTC(svYear, svMonth, svDate + 1, 6, 0, 0)); // April 21 00:00 SV
    const tomorrowEndUTC   = new Date(Date.UTC(svYear, svMonth, svDate + 2, 6, 0, 0)); // April 22 00:00 SV

    const tomorrowAppointments = rawAppointments.filter(app => {
      const t = new Date(app.date).getTime();
      return t >= tomorrowStartUTC.getTime() && t < tomorrowEndUTC.getTime();
    });

    if (tomorrowAppointments.length === 0) {
      return res.status(200).json({ message: 'No hay citas para recordar mañana' });
    }

    res.status(202).json({ 
      message: 'Procesando recordatorios...',
      total: tomorrowAppointments.length 
    });

    // Procesar en segundo plano
    (async () => {
      let processedCount = 0;
      let sentCount = 0;
      let failedCount = 0;
      const BATCH_SIZE = 5;
      
      console.log(`Iniciando envío de ${tomorrowAppointments.length} recordatorios fijos...`);

      const formatTimeSV = (dateUTC) => {
        const d = new Date(new Date(dateUTC).getTime() - (6 * 60 * 60 * 1000));
        let hours = d.getUTCHours();
        const minutes = d.getUTCMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12;
        const strMins = minutes > 0 ? `:${minutes < 10 ? '0'+minutes : minutes}` : '';
        return `${hours}${strMins} ${ampm}`;
      };

      for (let i = 0; i < tomorrowAppointments.length; i += BATCH_SIZE) {
        const batch = tomorrowAppointments.slice(i, i + BATCH_SIZE);
        
        const batchResults = batch.map((app) => {
          const firstName = app.profile.patientName.split(' ')[0];
          const timeStr = formatTimeSV(app.date);
          const text = `¡Hola ${firstName}! 🌟 Te recordamos tu cita de checkeo el dia de mañana a las ${timeStr}. Es un momento importante para cuidar de ti y tu bienestar, ¡vamos con toda la energía! 💪✨\n\nPor favor, confirma tu asistencia respondiendo a este mensaje. ¡Te esperamos con mucha alegría! 😊`;
          return { app, text, error: null };
        });

        // Enviar por WhatsApp con delay
        for (const item of batchResults) {
          const { app, text, error } = item;
          
          if (text) {
            try {
              console.log(`Enviando WhatsApp a ${app.profile.phone}...`);
              await sendWhatsAppMessage(readyClientId, app.profile.phone, text);
              sentCount++;
              console.log(`✅ Enviado con éxito a ${app.profile.patientName}`);
            } catch (err) {
              console.error(`❌ Error WhatsApp para ${app.profile.patientName}:`, err.message);
              failedCount++;
            }
          }

          processedCount++;
          io.emit('appointment_reminder_progress', {
            current: processedCount,
            total: tomorrowAppointments.length,
            lastPatient: app.profile.patientName,
            success: true
          });

          // Delay de 1 segundo entre envíos físicos
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`Envío completado. Éxito: ${sentCount}, Fallos: ${failedCount}`);
      io.emit('appointment_reminder_complete', { sentCount, failedCount });
    })();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
