import prisma from '../config/db.js';
import { generateMessageForProfile } from '../services/ai.js';
import { sendWhatsAppMessage, getIsReady } from '../services/whatsapp.js';

/**
 * GET /api/messages/status
 * Devuelve el estado actual del WhatsApp y estadísticas de mensajes.
 */
export async function getStatus(req, res) {
    try {
        const total = await prisma.messageLog.count();
        const sent = await prisma.messageLog.count({ where: { status: 'sent' } });
        const totalProfiles = await prisma.profile.count();
        res.json({
            whatsappReady: getIsReady(),
            totalMessages: total,
            sentMessages: sent,
            totalProfiles,
        });
    } catch (error) {
        console.error('Error al obtener estado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

/**
 * POST /api/messages/broadcast
 * Genera y envía un mensaje personalizado a TODOS los pacientes registrados.
 * Emite progreso en tiempo real via WebSocket si ioRef está disponible.
 */
export async function broadcastMessages(req, res) {
    if (!getIsReady()) {
        return res.status(400).json({
            error: 'WhatsApp no está conectado. Ve a la sección WhatsApp del dashboard y vincula tu cuenta primero.'
        });
    }

    // Obtener todos los perfiles activos
    const profiles = await prisma.profile.findMany({ 
        where: { active: true },
        orderBy: { patientName: 'asc' } 
    });

    if (profiles.length === 0) {
        return res.status(400).json({ error: 'No hay pacientes registrados.' });
    }

    // Responder inmediatamente — el proceso ocurre en background
    res.json({
        message: `Iniciando envío a ${profiles.length} paciente(s)...`,
        total: profiles.length,
    });

    // Ejecutar en background  
    processBroadcast(profiles, req.io);
}

async function processBroadcast(profiles, io) {
    console.log(`\n🚀 Iniciando broadcast de mensajes a ${profiles.length} pacientes...`);

    const results = [];

    for (const profile of profiles) {
        let text = null;
        let status = 'failed';
        let errorMsg = null;

        try {
            // Generar mensaje personalizado con el expediente del paciente
            text = await generateMessageForProfile(profile);
            console.log(`\n📱 [${profile.patientName}] Mensaje generado → Enviando...`);

            // Enviar por WhatsApp
            await sendWhatsAppMessage(profile.phone, text);
            status = 'sent';

            console.log(`✅ [${profile.patientName}] Enviado correctamente.`);
        } catch (err) {
            errorMsg = err.message;
            console.error(`❌ [${profile.patientName}] Error: ${err.message}`);
        }

        // Guardar en historial
        if (text) {
            await prisma.messageLog.create({
                data: { profileId: profile.id, content: text, status }
            }).catch(err => console.error('Error al guardar log:', err));
        }

        const resultEntry = {
            profileId: profile.id,
            patientName: profile.patientName,
            phone: profile.phone,
            status,
            error: errorMsg,
        };
        results.push(resultEntry);

        // Emitir progreso via WebSocket
        io?.emit('broadcast_progress', {
            current: results.length,
            total: profiles.length,
            latest: resultEntry,
        });

        // Pequeña pausa entre mensajes para evitar bloqueos de WhatsApp
        await new Promise(r => setTimeout(r, 1500));
    }

    // Emitir resultado final
    const sentCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    io?.emit('broadcast_complete', {
        total: profiles.length,
        sent: sentCount,
        failed: failedCount,
        results,
    });

    console.log(`\n🎉 Broadcast completado: ${sentCount} enviados, ${failedCount} fallidos.`);
}
