import prisma from '../config/db.js';
import { generateMessageForProfile } from '../services/ai.js';
import { sendWhatsAppMessage, getAnyReadyClientId } from '../services/whatsapp.js';

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
            whatsappReady: !!getAnyReadyClientId(),
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
    const readyClientId = getAnyReadyClientId();
    if (!readyClientId) {
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
    processBroadcast(profiles, req.io, readyClientId);
}

async function processBroadcast(profiles, io, clientId) {
    console.log(`\n🚀 Iniciando broadcast de mensajes a ${profiles.length} pacientes...`);

    const results = [];
    const BATCH_SIZE = 5; // Generar 5 mensajes de IA en paralelo

    for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
        const batch = profiles.slice(i, i + BATCH_SIZE);
        
        // Generar mensajes de IA en paralelo para el lote actual
        const batchPromises = batch.map(async (profile) => {
            let text = null;
            let status = 'failed';
            let errorMsg = null;

            try {
                // Generar mensaje personalizado con el expediente del paciente
                text = await generateMessageForProfile(profile);
                return { profile, text, status: 'pending', errorMsg };
            } catch (err) {
                console.error(`❌ [${profile.patientName}] Error IA: ${err.message}`);
                return { profile, text: null, status: 'failed', errorMsg: err.message };
            }
        });

        const batchResults = await Promise.all(batchPromises);

        // Enviar los mensajes del lote secuencialmente por WhatsApp (con pequeño delay)
        for (const item of batchResults) {
            const { profile, text, errorMsg } = item;
            let currentStatus = item.status;
            let currentError = errorMsg;

            if (text) {
                try {
                    console.log(`\n📱 [${profile.patientName}] Enviando WhatsApp...`);
                    await sendWhatsAppMessage(clientId, profile.phone, text);
                    currentStatus = 'sent';
                    console.log(`✅ [${profile.patientName}] Enviado correctamente.`);
                } catch (err) {
                    currentStatus = 'failed';
                    currentError = err.message;
                    console.error(`❌ [${profile.patientName}] Error WhatsApp: ${err.message}`);
                }

                // Guardar en historial
                await prisma.messageLog.create({
                    data: { profileId: profile.id, content: text, status: currentStatus }
                }).catch(err => console.error('Error al guardar log:', err));
            }

            const resultEntry = {
                profileId: profile.id,
                patientName: profile.patientName,
                phone: profile.phone,
                status: currentStatus,
                error: currentError,
            };
            results.push(resultEntry);

            // Emitir progreso via WebSocket
            io?.emit('broadcast_progress', {
                current: results.length,
                total: profiles.length,
                latest: resultEntry,
            });

            // Delay mínimo entre envíos físicos de WhatsApp (800ms - 1.2s es seguro)
            await new Promise(r => setTimeout(r, 1000));
        }
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
