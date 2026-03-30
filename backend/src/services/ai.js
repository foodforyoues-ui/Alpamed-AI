import { AzureOpenAI } from 'openai';
import dotenv from 'dotenv';
import prisma from '../config/db.js';
dotenv.config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

if (!endpoint || !apiKey || endpoint.includes('your-resource')) {
    console.warn("⚠️ ADVERTENCIA: Las variables de entorno de Azure OpenAI no están configuradas correctamente.");
}

const client = new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
    deployment,
});

/**
 * Construye un System Prompt rico con todos los datos del expediente del paciente.
 * @param {Object} profile - El objeto Profile completo de la base de datos.
 * @param {string[]} previousMessages - Últimos mensajes enviados (para no repetirlos).
 * @param {Object|null} latestSnapshot - El snapshot más reciente de mediciones del paciente.
 * @returns {string} El System Prompt para Azure OpenAI.
 */
function buildSystemPrompt(profile, previousMessages = [], latestSnapshot = null) {
    const lines = [
        "Eres el asistente inteligente de 'Nutria', una plataforma usada por nutricionistas profesionales.",
        "Tu misión es redactar un ÚNICO mensaje de WhatsApp para el paciente.",
        "El mensaje debe ser: corto (máx 3 párrafos), muy motivador, cálido y profesional.",
        "EMOJIS: Usa MUCHOS emojis a lo largo de todo el mensaje (mínimo 6-8 en total). Incluye SIEMPRE el 🥑 y combínalo con emojis variados relacionados con: salud 💪🏃, comida sana 🥗🍎🥦, agua 💧, sueño 😴, logros 🎯✅⭐, motivación 🔥💫🌟, corazón ❤️ y los que sean relevantes según los hábitos del paciente (🏊 si nada, 🏀 si juega basquetball, etc.).",
        "Basa tu consejo ESTRICTAMENTE en el siguiente expediente clínico del paciente, sin inventar datos que no existan.",
        "",
        `--- EXPEDIENTE DE: ${profile.patientName} ---`,
    ];

    if (profile.realAge) lines.push(`• Edad real: ${profile.realAge} años`);
    
    lines.push(`• ¿Hace ejercicio?: ${profile.doesExercise ? 'Sí' : 'No'}`);
    if (profile.exerciseType) lines.push(`• Tipo de ejercicio: ${profile.exerciseType}`);
    if (profile.sleepHours != null) lines.push(`• Horas de sueño: ${profile.sleepHours} hrs/noche`);
    if (profile.dailySteps != null) lines.push(`• Pasos diarios: ${profile.dailySteps.toLocaleString()} pasos`);

    // Datos de la última medición (snapshot) si existen
    if (latestSnapshot) {
        const fecha = new Date(latestSnapshot.recordedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
        lines.push("", `--- MEDICIÓN MÁS RECIENTE (${fecha}) ---`);
        if (latestSnapshot.weight != null)               lines.push(`• Peso actual: ${latestSnapshot.weight} kg`);
        if (latestSnapshot.lostWeight != null)            lines.push(`• Peso perdido: ${latestSnapshot.lostWeight} kg ✅`);
        if (latestSnapshot.bmi != null)                   lines.push(`• IMC: ${latestSnapshot.bmi}`);
        if (latestSnapshot.bodyFatPercentage != null)     lines.push(`• % Grasa corporal: ${latestSnapshot.bodyFatPercentage}%`);
        if (latestSnapshot.muscleMassPercentage != null)  lines.push(`• % Masa muscular: ${latestSnapshot.muscleMassPercentage}%`);
        if (latestSnapshot.metabolicAge != null)          lines.push(`• Edad metabólica: ${latestSnapshot.metabolicAge} años`);
        if (latestSnapshot.notes)                         lines.push(`• Notas del nutricionista: ${latestSnapshot.notes}`);
    }

    if (profile.generalRecommendation) {
        lines.push("", "--- RECOMENDACIÓN GENERAL DEL NUTRICIONISTA ---");
        lines.push(profile.generalRecommendation);
    }

    if (profile.specificRecommendations && profile.specificRecommendations.length > 0) {
        lines.push("", "--- RECOMENDACIONES ESPECÍFICAS (úsalas como guía para este mensaje) ---");
        profile.specificRecommendations.forEach((rec, i) => {
            if (rec?.trim()) lines.push(`${i + 1}. ${rec}`);
        });
    }

    // Inyectar historial para evitar repeticiones
    if (previousMessages.length > 0) {
        lines.push("", "--- MENSAJES QUE YA ENVIASTE ANTERIORMENTE (NO repitas estas ideas, frases ni estructura) ---");
        previousMessages.forEach((msg, i) => {
            lines.push(`[Mensaje anterior ${i + 1}]: ${msg}`);
        });
        lines.push("", "IMPORTANTE: El mensaje de hoy DEBE ser completamente diferente en enfoque, tono y redacción a los anteriores.");
    }

    lines.push("", "---", "Redacta el mensaje de WhatsApp ahora, dirigido directamente al paciente:");

    return lines.join('\n');
}

/**
 * Genera un mensaje personalizado de WhatsApp usando el expediente del paciente.
 * @param {Object} profile - El objeto Profile completo proveniente de la base de datos.
 * @returns {Promise<string>} El mensaje generado por la IA.
 */
export async function generateMessageForProfile(profile) {
    if (!endpoint || !apiKey || endpoint.includes('your-resource')) {
        return `¡Hola ${profile.patientName}! ✨ Este es un mensaje de prueba estático porque aún no configuras tus credenciales de Azure OpenAI en el archivo .env. 🥑`;
    }

    // Obtener los últimos 5 mensajes enviados a este paciente para evitar repeticiones
    let previousMessages = [];
    try {
        const recentLogs = await prisma.messageLog.findMany({
            where: { profileId: profile.id, status: 'sent' },
            orderBy: { sentAt: 'desc' },
            take: 5,
            select: { content: true },
        });
        previousMessages = recentLogs.map(log => log.content);
    } catch (err) {
        console.warn('No se pudo obtener el historial previo:', err.message);
    }

    // Obtener el último snapshot (medición más reciente) del paciente
    let latestSnapshot = null;
    try {
        latestSnapshot = await prisma.profileSnapshot.findFirst({
            where: { profileId: profile.id },
            orderBy: { recordedAt: 'desc' },
        });
    } catch (err) {
        console.warn('No se pudo obtener el último snapshot:', err.message);
    }

    try {
        const systemPrompt = buildSystemPrompt(profile, previousMessages, latestSnapshot);

        const response = await client.chat.completions.create({
            model: deployment,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Genera el mensaje motivacional del día para ${profile.patientName}. Recuerda que debe ser DIFERENTE a los mensajes anteriores.` }
            ],
            max_tokens: 250,
            temperature: 0.85,
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error al generar el mensaje con Azure OpenAI:", error);
        return `Hubo un error al generar el mensaje con IA para ${profile.patientName}, pero la conexión de WhatsApp funciona bien. 🤖🥑`;
    }
}

/**
 * Genera un mensaje de recordatorio de cita personalizado.
 * @param {Object} profile - Perfil del paciente.
 * @param {Object} appointment - Objeto de la cita (date, reason).
 * @returns {Promise<string>} El mensaje de recordatorio.
 */
export async function generateAppointmentReminder(profile, appointment) {
    if (!endpoint || !apiKey || endpoint.includes('your-resource')) {
        return `Hola ${profile.patientName}, te recordamos tu cita el ${new Date(appointment.date).toLocaleString()} por el motivo: ${appointment.reason}. 🥑`;
    }

    const dateStr = new Date(appointment.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = new Date(appointment.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const systemPrompt = [
        "Eres el asistente de 'Nutria'. Tu misión es redactar un recordatorio de cita AMABLE y MOTIVADOR.",
        "El mensaje debe confirmar la fecha, hora y motivo de la consulta.",
        "Pide amablemente al paciente que confirme su asistencia respondiendo a este mensaje.",
        "Usa emojis (mínimo 4) incluyendo siempre el 🥑.",
        "Sé breve: máximo 2 párrafos cortos.",
        "",
        `PACIENTE: ${profile.patientName}`,
        `CITA: ${dateStr} a las ${timeStr}`,
        `MOTIVO: ${appointment.reason}`,
    ].join('\n');

    try {
        const response = await client.chat.completions.create({
            model: deployment,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Redacta el recordatorio para ${profile.patientName}.` }
            ],
            max_tokens: 200,
            temperature: 0.7,
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error al generar recordatorio:", error);
        return `Hola ${profile.patientName} 🥑, te recordamos tu cita de "${appointment.reason}" para el ${dateStr} a las ${timeStr}. ¡Te esperamos! ✨`;
    }
}

/**
 * Función de prueba básica (para compatibilidad con el ai-test.js original).
 */
export async function generateTestMessage(patientName = 'Paciente', topic = 'bienvenida') {
    return generateMessageForProfile({ patientName, doesExercise: false, specificRecommendations: [topic] });
}
