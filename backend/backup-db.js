/**
 * backup-db.js — Exporta toda la base de datos a JSON
 * No requiere pg_dump instalado. Usa Prisma directamente.
 * 
 * Uso: node backup-db.js
 * Genera: backup/alpamed_backup_YYYYMMDD.json
 */
import prisma from './src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function backup() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const outDir = path.join(__dirname, 'backup');
  const outFile = path.join(outDir, `alpamed_backup_${date}.json`);

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  console.log('🔄 Conectando a la base de datos...');
  
  const [users, profiles, snapshots, messages, appointments] = await Promise.all([
    prisma.user.findMany(),
    prisma.profile.findMany(),
    prisma.profileSnapshot.findMany(),
    prisma.messageLog.findMany(),
    prisma.appointment.findMany(),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    tables: {
      User:            { count: users.length,        data: users },
      Profile:         { count: profiles.length,     data: profiles },
      ProfileSnapshot: { count: snapshots.length,    data: snapshots },
      MessageLog:      { count: messages.length,     data: messages },
      Appointment:     { count: appointments.length, data: appointments },
    }
  };

  fs.writeFileSync(outFile, JSON.stringify(backup, null, 2), 'utf8');

  const sizeKB = (fs.statSync(outFile).size / 1024).toFixed(1);

  console.log('\n✅ Backup completado:');
  console.log(`   📁 Archivo: backup/alpamed_backup_${date}.json`);
  console.log(`   📦 Tamaño:  ${sizeKB} KB`);
  console.log('\n📊 Registros exportados:');
  console.log(`   👤 Users:            ${users.length}`);
  console.log(`   🧑‍⚕️  Profiles:         ${profiles.length}`);
  console.log(`   📋 ProfileSnapshots: ${snapshots.length}`);
  console.log(`   💬 MessageLogs:      ${messages.length}`);
  console.log(`   📅 Appointments:     ${appointments.length}`);
  console.log('\n💡 Para restaurar en otra BD, corre: node backup/restore-db.js');

  await prisma.$disconnect();
}

backup().catch(async (e) => {
  console.error('❌ Error en backup:', e.message);
  await prisma.$disconnect();
  process.exit(1);
});
