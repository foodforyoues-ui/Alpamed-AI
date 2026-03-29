import { generateTestMessage } from './src/services/ai.js';

console.log('Iniciando prueba de Azure OpenAI...');

async function runTest() {
    try {
        console.log('Generando mensaje...');
        const mensaje = await generateTestMessage();
        console.log('\n--- Resultado de la IA ---');
        console.log(mensaje);
        console.log('--------------------------\n');
    } catch (error) {
        console.error('Error durante la prueba:', error);
    }
}

runTest();
