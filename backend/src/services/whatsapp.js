/**
 * Singleton del cliente WhatsApp — importable desde cualquier módulo.
 * El servidor registra el cliente aquí, y el controlador de broadcast lo consume.
 */
import pkg from 'whatsapp-web.js';
import fs from 'fs';
const { Client, LocalAuth } = pkg;

let client = null;
let isReady = false;
let ioRef = null; // Referencia al servidor de Socket.io

export function setIo(io) {
    ioRef = io;
}

export function getClient() {
    return client;
}

export function getIsReady() {
    return isReady;
}

export function initWhatsApp() {
    const execPath = process.env.PUPPETEER_EXECUTABLE_PATH;
    const finalExecPath = execPath === '/nix/store/chromium' ? 'chromium' : (execPath || undefined);

    client = new Client({
        authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
        puppeteer: {
            executablePath: finalExecPath,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        }
    });

    client.on('qr', (qr) => {
        console.log('\n--- ESCANEA EL CÓDIGO QR EN LA WEB ---\n');
        ioRef?.emit('qr', qr);
    });

    client.on('authenticated', () => {
        console.log('Autenticación exitosa (Sesión guardada).');
        ioRef?.emit('loading', { message: 'Autenticando...' });
    });

    client.on('loading_screen', (percent, message) => {
        console.log('Cargando WhatsApp GUI:', percent, message);
        ioRef?.emit('loading', { message: `Cargando interfaz... ${percent}%` });
    });

    client.on('ready', () => {
        isReady = true;
        console.log('\n¡CONEXIÓN EXITOSA! ✅ El cliente de WhatsApp está listo.');
        ioRef?.emit('ready', { status: 'Conectado exitosamente' });
    });

    client.on('auth_failure', (msg) => {
        console.error('Fallo en la autenticación', msg);
        ioRef?.emit('auth_failure', { error: 'Fallo al autenticar', details: msg });
        isReady = false;
    });

    client.on('disconnected', (reason) => {
        console.log('Cliente desconectado:', reason);
        ioRef?.emit('disconnected', { reason });
        isReady = false;
        client.destroy();
        client = null;
    });

    console.log('Iniciando cliente de WhatsApp...');
    client.initialize();
}

/**
 * Envía un mensaje a un número de WhatsApp dado.
 * @param {string} phone Número completo con código de país
 * @param {string} text Texto a enviar
 */
export async function sendWhatsAppMessage(phone, text) {
    if (!client || !isReady) {
        throw new Error('WhatsApp no está conectado todavía.');
    }
    const numberId = await client.getNumberId(phone);
    if (!numberId) {
        throw new Error(`El número ${phone} no está registrado en WhatsApp.`);
    }
    await client.sendMessage(numberId._serialized, text);
}

export async function logoutWhatsApp() {
    if (client) {
        console.log('Cerrando sesión de WhatsApp...');
        try {
            if (isReady) await client.logout();
        } catch (e) {
            console.error('Error al hacer logout en el cliente:', e.message);
        }
        try {
            await client.destroy();
        } catch (e) {
            console.error('Error al destruir cliente:', e.message);
        }
        client = null;
        isReady = false;
    }
    
    if (fs.existsSync('./.wwebjs_auth')) {
        try {
            fs.rmSync('./.wwebjs_auth', { recursive: true, force: true });
            console.log('Carpeta .wwebjs_auth eliminada correctamente.');
        } catch (e) {
            console.error('Error al borrar carpeta de sesión:', e.message);
        }
    }
    
    ioRef?.emit('disconnected', 'Cierre de sesión manual');
}
