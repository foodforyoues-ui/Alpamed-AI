import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { generateTestMessage } from './src/services/ai.js';

console.log('Iniciando script de prueba WhatsApp + IA...');

// Inicializar el cliente
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', (qr) => {
    console.log('\n--- ESCANEA ESTE CÓDIGO QR CON TU WHATSAPP ---\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('\n¡CONEXIÓN EXITOSA! ✅ El cliente de WhatsApp está listo.');
    
    const userJid = client.info.wid._serialized;
    console.log(`\nVamos a enviar un mensaje generado por IA a tu propio número: ${userJid}`);
    
    try {
        console.log('Generando mensaje con Azure OpenAI...');
        const mensajeIA = await generateTestMessage();
        console.log('\nMensaje generado:');
        console.log(`"${mensajeIA}"\n`);
        
        console.log('Enviando mensaje por WhatsApp...');
        await client.sendMessage(userJid, mensajeIA);
        console.log('¡Mensaje enviado con éxito! 🚀🥑');
        
        // Podemos cerrar el cliente después de la prueba si queremos
        console.log('\nPrueba finalizada. Presiona Ctrl+C para salir.');
    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    }
});

client.on('auth_failure', msg => {
    console.error('Hubo un fallo en la autenticación', msg);
});

client.initialize();
