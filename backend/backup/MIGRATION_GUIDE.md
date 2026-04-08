# 🗄️ Guía de Migración de Base de Datos — Alpamed AI Assistant

> Sigue este proceso si tu base de datos muere, necesitas migrar de servidor, o cambia tu proveedor de PostgreSQL.

---

## 📋 Prerrequisitos

- Acceso a la BD actual (aunque sea parcial)
- `psql` y `pg_dump` instalados localmente
- Variables de entorno del archivo `backend/.env`

---

## 🔁 Flujo Completo de Migración

```mermaid
graph LR
  A[BD Actual] --> B[pg_dump backup]
  B --> C[Nueva BD vacía]
  C --> D[prisma migrate deploy]
  D --> E[pg_restore datos]
  E --> F[✅ Listo]
```

---

## PASO 1 — Hacer Backup de la Base de Datos Actual

### Opción A) Backup completo (recomendado si la BD aún responde)

```bash
# Formato custom para restauración flexible
pg_dump "TU_DATABASE_URL_ACTUAL" \
  --format=custom \
  --file=alpamed_backup_$(date +%Y%m%d).dump

# Formato SQL plano (alternativa)
pg_dump "TU_DATABASE_URL_ACTUAL" > alpamed_backup_$(date +%Y%m%d).sql
```

### Opción B) Solo datos (sin schema)

```bash
pg_dump "TU_DATABASE_URL_ACTUAL" \
  --data-only \
  --format=custom \
  --file=alpamed_data_only.dump
```

### ☁️ Si usas Railway

Railway tiene backups automáticos. Para descargar:
1. Panel Railway → tu servicio PostgreSQL → **Backups**
2. Descarga el `.sql` más reciente
3. O usa datos de conexión de Railway para correr `pg_dump` localmente

```bash
pg_dump "postgresql://user:pass@roundhouse.proxy.rlwy.net:PORT/railway" \
  --format=custom --file=backup.dump
```

---

## PASO 2 — Crear Nueva Base de Datos

### En Railway
1. New Service → **PostgreSQL**
2. Copia la `DATABASE_URL` del nuevo servicio
3. Actualiza tu `backend/.env` y variables de entorno en Railway

### En Supabase / Neon / cualquier Postgres
1. Crea un proyecto nuevo
2. Copia la Connection String (formato `postgresql://...`)
3. Actualiza `DATABASE_URL` en tu `.env`

---

## PASO 3 — Aplicar Schema con Prisma

```bash
cd backend

# Instala dependencias si es necesario
npm install

# Aplica todas las migraciones existentes
npx prisma migrate deploy

# Genera el cliente
npx prisma generate
```

> Si no tienes carpeta `prisma/migrations/`, corre:
> ```bash
> npx prisma db push
> ```

---

## PASO 4 — Restaurar los Datos

### Si tienes un `.dump` (formato custom)

```bash
pg_restore \
  --dbname="TU_NUEVA_DATABASE_URL" \
  --no-owner \
  --no-privileges \
  --verbose \
  alpamed_backup.dump
```

### Si tienes un `.sql` plano

```bash
psql "TU_NUEVA_DATABASE_URL" < alpamed_backup.sql
```

---

## PASO 5 — Validar la Migración

```bash
# Conectarte a la nueva BD
psql "TU_NUEVA_DATABASE_URL"

# Verificar registros
SELECT COUNT(*) FROM "Profile";
SELECT COUNT(*) FROM "ProfileSnapshot";
SELECT COUNT(*) FROM "Appointment";
SELECT COUNT(*) FROM "User";
\q
```

O usando Prisma Studio:

```bash
cd backend
npx prisma studio
```

---

## 🚨 Escenario: BD completamente muerta (sin backup)

Si la BD murió sin backup y solo tienes el código, usa los seeds incluidos en el proyecto:

```bash
cd backend

# 1. Crear schema
npx prisma migrate deploy

# 2. Recrear admin
node create-admin.js

# 3. Re-insertar pacientes de prueba
node seed-patients.js

# 4. Re-insertar snapshots y citas
node seed-snapshots.js
```

> ⚠️ Los datos reales de pacientes se perderán. Solo los datos de demostración se recuperan con los seeds.

---

## 🛡️ Recomendaciones de Backup Preventivo

### Backup automático semanal (cron en tu servidor)

```bash
# Agrega a crontab: cada domingo a las 2am
0 2 * * 0 pg_dump "$DATABASE_URL" --format=custom > /backups/alpamed_$(date +\%Y\%m\%d).dump
```

### Variables de entorno críticas a guardar

Guarda estas en un lugar seguro (1Password, Bitwarden, etc.):

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión PostgreSQL |
| `JWT_SECRET` | Token de autenticación |
| `AZURE_OPENAI_API_KEY` | API de IA |
| `AZURE_OPENAI_ENDPOINT` | Endpoint Azure |
| `NEXT_PUBLIC_API_URL` | URL del backend |

---

## 🔗 URLs de Referencia

- Prisma Migrations: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Railway Backups: https://docs.railway.app/databases/postgresql#backups
- pg_dump docs: https://www.postgresql.org/docs/current/app-pgdump.html
