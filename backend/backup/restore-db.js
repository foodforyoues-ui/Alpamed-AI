/**
 * restore-db.js — Restaura la base de datos desde un JSON de backup
 * 
 * Uso: node backup/restore-db.js backup/alpamed_backup_YYYYMMDD.json
 *   o: node backup/restore-db.js  (busca el backup más reciente automáticamente)
 */
import prisma from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function restore() {
  // Buscar el archivo de backup
  let backupFile = process.argv[2];
  
  if (!backupFile) {
    // Auto-detectar el más reciente
    const files = fs.readdirSync(__dirname)
      .filter(f => f.startsWith('alpamed_backup_') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.error('❌ No se encontró ningún archivo de backup en la carpeta backup/');
      console.error('   Usa: node backup/restore-db.js backup/alpamed_backup_YYYYMMDD.json');
      process.exit(1);
    }
    
    backupFile = path.join(__dirname, files[0]);
    console.log(`📂 Usando backup más reciente: ${files[0]}`);
  }

  if (!fs.existsSync(backupFile)) {
    console.error(`❌ Archivo no encontrado: ${backupFile}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(backupFile, 'utf8');
  const { tables, exportedAt } = JSON.parse(raw);

  console.log(`\n🔄 Restaurando desde backup del ${new Date(exportedAt).toLocaleString('es-MX')}`);
  console.log('⚠️  Esto NO elimina datos existentes, solo inserta los que no existan.\n');

  // ---- USERS ----
  let usersOk = 0;
  for (const u of tables.User.data) {
    try {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { id: u.id, email: u.email, password: u.password, name: u.name,
                  createdAt: new Date(u.createdAt), updatedAt: new Date(u.updatedAt) }
      });
      usersOk++;
    } catch (e) { /* skip duplicates */ }
  }
  console.log(`✅ Users:            ${usersOk}/${tables.User.count}`);

  // ---- PROFILES ----
  let profilesOk = 0;
  for (const p of tables.Profile.data) {
    try {
      await prisma.profile.upsert({
        where: { phone: p.phone },
        update: {},
        create: {
          id: p.id, patientName: p.patientName, phone: p.phone,
          realAge: p.realAge, userId: p.userId,
          doesExercise: p.doesExercise, exerciseType: p.exerciseType,
          sleepHours: p.sleepHours, dailySteps: p.dailySteps,
          generalRecommendation: p.generalRecommendation,
          specificRecommendations: p.specificRecommendations,
          active: p.active,
          createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt)
        }
      });
      profilesOk++;
    } catch (e) { /* skip */ }
  }
  console.log(`✅ Profiles:         ${profilesOk}/${tables.Profile.count}`);

  // ---- SNAPSHOTS ----
  let snapshotsOk = 0;
  for (const s of tables.ProfileSnapshot.data) {
    try {
      const exists = await prisma.profileSnapshot.findUnique({ where: { id: s.id } });
      if (!exists) {
        await prisma.profileSnapshot.create({
          data: {
            id: s.id, profileId: s.profileId,
            weight: s.weight, bmi: s.bmi, bodyFatPercentage: s.bodyFatPercentage,
            muscleMassPercentage: s.muscleMassPercentage, metabolicAge: s.metabolicAge,
            lostWeight: s.lostWeight, isInitialRecord: s.isInitialRecord,
            notes: s.notes, recordedAt: new Date(s.recordedAt)
          }
        });
        snapshotsOk++;
      }
    } catch (e) { /* skip */ }
  }
  console.log(`✅ ProfileSnapshots: ${snapshotsOk}/${tables.ProfileSnapshot.count}`);

  // ---- MESSAGES ----
  let msgsOk = 0;
  for (const m of tables.MessageLog.data) {
    try {
      const exists = await prisma.messageLog.findUnique({ where: { id: m.id } });
      if (!exists) {
        await prisma.messageLog.create({
          data: { id: m.id, profileId: m.profileId, content: m.content, status: m.status, sentAt: new Date(m.sentAt) }
        });
        msgsOk++;
      }
    } catch (e) { /* skip */ }
  }
  console.log(`✅ MessageLogs:      ${msgsOk}/${tables.MessageLog.count}`);

  // ---- APPOINTMENTS ----
  let aptsOk = 0;
  for (const a of tables.Appointment.data) {
    try {
      const exists = await prisma.appointment.findUnique({ where: { id: a.id } });
      if (!exists) {
        await prisma.appointment.create({
          data: {
            id: a.id, profileId: a.profileId, reason: a.reason,
            date: new Date(a.date), status: a.status, notes: a.notes,
            createdAt: new Date(a.createdAt), updatedAt: new Date(a.updatedAt)
          }
        });
        aptsOk++;
      }
    } catch (e) { /* skip */ }
  }
  console.log(`✅ Appointments:     ${aptsOk}/${tables.Appointment.count}`);

  console.log('\n🎉 Restauración completada.');
  await prisma.$disconnect();
}

restore().catch(async (e) => {
  console.error('❌ Error en restauración:', e.message);
  await prisma.$disconnect();
  process.exit(1);
});
