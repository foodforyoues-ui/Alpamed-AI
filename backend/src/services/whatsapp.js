import pkg from 'whatsapp-web.js';
import fs from 'fs';
import path from 'path';
const { Client, LocalAuth } = pkg;

const clients = new Map();
const mapIsReady = new Map();
let ioRef = null;

const AUTH_DIR = './.wwebjs_auth';

export function setIo(io) {
    ioRef = io;
}

export function getClient(clientId) {
    return clients.get(clientId) || null;
}

export function getIsReady(clientId) {
    return mapIsReady.get(clientId) || false;
}

/** Returns the first clientId that is currently connected and ready, or null if none. */
export function getAnyReadyClientId() {
    for (const [clientId, ready] of mapIsReady.entries()) {
        if (ready) return clientId;
    }
    return null;
}

export function getSavedSessions(userId) {
    if (!fs.existsSync(AUTH_DIR)) return [];
    try {
        const items = fs.readdirSync(AUTH_DIR);
        // LocalAuth creates subdirectories named "session-<clientId>"
        return items
            .filter(item => item.startsWith(`session-user_${userId}_`))
            .map(item => item.replace(`session-user_${userId}_`, ''));
    } catch (e) {
        console.error('Error al leer sesiones:', e.message);
        return [];
    }
}

export function initWhatsApp(clientId, userId) {
    if (!clientId) throw new Error("Se requiere un clientId");
    
    const frontendId = clientId.replace(`user_${userId}_`, '');

    if (clients.has(clientId)) {
        if (mapIsReady.get(clientId)) {
            ioRef?.to(`user_${userId}`).emit('ready', { clientId: frontendId, status: 'Conectado exitosamente' });
        }
        return;
    }

    const execPath = process.env.PUPPETEER_EXECUTABLE_PATH;
    const finalExecPath = execPath === '/nix/store/chromium' ? 'chromium' : (execPath || undefined);

    const client = new Client({
        authStrategy: new LocalAuth({ dataPath: AUTH_DIR, clientId: clientId }),
        puppeteer: {
            executablePath: finalExecPath,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        }
    });

    client.on('qr', (qr) => {
        console.log(`\n--- [${clientId}] ESCANEA EL CÓDIGO QR EN LA WEB ---\n`);
        ioRef?.to(`user_${userId}`).emit('qr', { clientId: frontendId, qr });
    });

    client.on('authenticated', () => {
        console.log(`[${clientId}] Autenticación exitosa.`);
        ioRef?.to(`user_${userId}`).emit('loading', { clientId: frontendId, message: 'Autenticando...' });
    });

    client.on('loading_screen', (percent, message) => {
        console.log(`[${clientId}] Cargando WhatsApp GUI: ${percent}% ${message}`);
        ioRef?.to(`user_${userId}`).emit('loading', { clientId: frontendId, message: `Cargando interfaz... ${percent}%` });
    });

    client.on('ready', () => {
        mapIsReady.set(clientId, true);
        console.log(`\n[${clientId}] ¡CONEXIÓN EXITOSA! ✅ El cliente está listo.`);
        ioRef?.to(`user_${userId}`).emit('ready', { clientId: frontendId, status: 'Conectado exitosamente' });
    });

    client.on('auth_failure', (msg) => {
        console.error(`[${clientId}] Fallo en la autenticación`, msg);
        ioRef?.to(`user_${userId}`).emit('auth_failure', { clientId: frontendId, error: 'Fallo al autenticar', details: msg });
        mapIsReady.set(clientId, false);
    });

    client.on('disconnected', (reason) => {
        console.log(`[${clientId}] Cliente desconectado:`, reason);
        ioRef?.to(`user_${userId}`).emit('disconnected', { clientId: frontendId, reason });
        mapIsReady.set(clientId, false);
        client.destroy();
        clients.delete(clientId);
    });

    console.log(`[${clientId}] Iniciando cliente de WhatsApp...`);
    clients.set(clientId, client);
    mapIsReady.set(clientId, false);
    client.initialize();
}

/**
 * Envía un mensaje a un número.
 * @param {string} clientId 
 * @param {string} phone 
 * @param {string} text 
 */
export async function sendWhatsAppMessage(clientId, phone, text) {
    const client = clients.get(clientId);
    if (!client || !mapIsReady.get(clientId)) {
        throw new Error(`WhatsApp (${clientId}) no está conectado.`);
    }
    const numberId = await client.getNumberId(phone);
    if (!numberId) {
        throw new Error(`El número ${phone} no está registrado en WhatsApp.`);
    }
    await client.sendMessage(numberId._serialized, text);
}

export async function logoutWhatsApp(clientId, userId) {
    const client = clients.get(clientId);
    const frontendId = userId ? clientId.replace(`user_${userId}_`, '') : clientId;

    if (client) {
        console.log(`[${clientId}] Cerrando sesión de WhatsApp...`);
        try {
            if (mapIsReady.get(clientId)) await client.logout();
        } catch (e) {
            console.error(`[${clientId}] Error logout:`, e.message);
        }
        try {
            await client.destroy();
        } catch (e) {
            console.error(`[${clientId}] Error destroy:`, e.message);
        }
        clients.delete(clientId);
        mapIsReady.delete(clientId);
    }
    
    const sessionDir = path.join(AUTH_DIR, `session-${clientId}`);
    if (fs.existsSync(sessionDir)) {
        try {
            fs.rmSync(sessionDir, { recursive: true, force: true });
            console.log(`[${clientId}] Carpeta eliminada.`);
        } catch (e) {
            console.error(`[${clientId}] Error borrar carpeta:`, e.message);
        }
    }
    
    if (userId) {
        ioRef?.to(`user_${userId}`).emit('disconnected', { clientId: frontendId, reason: 'Cierre de sesión manual' });
    } else {
        ioRef?.emit('disconnected', { clientId: frontendId, reason: 'Cierre de sesión manual' });
    }
}
