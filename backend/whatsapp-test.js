import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

// Initialize the client with LocalAuth to save session
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

// Generate and display the QR code
client.on('qr', (qr) => {
    console.log('\n--- ESCANEA ESTE CÓDIGO QR CON TU WHATSAPP ---\n');
    qrcode.generate(qr, { small: true });
});

// Provide feedback when ready
client.on('ready', () => {
    console.log('\n¡CONEXIÓN EXITOSA! ✅ El cliente está listo.');
    
    // El número formateado. Para whatsapp-web.js, usualmente es el ID interno del dispositivo, o podemos intentar obtener el número propio.
    // getContactById nos dejaría enviarnos a nosotros mismos.
    const userJid = client.info.wid._serialized;
    console.log(`Enviando mensaje de prueba a: ${userJid}`);
    
    client.sendMessage(userJid, '¡Hola! Este es un mensaje de prueba desde el bot de Nutria (usando whatsapp-web.js). 🥑✨')
        .then(() => {
            console.log('Mensaje enviado con éxito. 🚀');
        })
        .catch(err => {
            console.error('Error al enviar el mensaje:', err);
        });
});

// Handle authentication failure
client.on('auth_failure', msg => {
    console.error('Hubo un fallo en la autenticación', msg);
});

// Listen for messages
client.on('message', async msg => {
    if (msg.body === '!ping') {
        msg.reply('pong');
    }
});

console.log('Iniciando cliente de WhatsApp...');
client.initialize();
