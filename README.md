# Nutria - Plataforma de Nutrición Digital con IA

Nutria es una plataforma SaaS diseñada para nutricionistas que automatiza el seguimiento de pacientes mediante WhatsApp, utilizando Inteligencia Artificial para generar recomendaciones personalizadas basadas en datos antropométricos y hábitos de vida.

## 🚀 Características Principales

- **Gestión de Pacientes**: Expedientes completos con historial de mediciones.
- **Seguimiento por Consultas (Snapshots)**: Registro histórico de peso, IMC, % de grasa y masa muscular para visualizar el progreso.
- **Integración con WhatsApp**: Conexión real via Qr Code para enviar mensajes directamente.
- **IA Nutricional**: Generación de consejos personalizados utilizando Azure OpenAI, analizando el contexto específico del paciente.
- **Envío Masivo (Broadcast)**: Envía recomendaciones a todos tus pacientes de forma automatizada con un solo botón.
- **Historial de Mensajes**: Registro de todas las interacciones enviadas para un mejor control clínico.

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, Tailwind CSS, Lucide React, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, Prisma ORM.
- **Base de Datos**: PostgreSQL (Azure Database for PostgreSQL).
- **IA**: Azure OpenAI (GPT-4 / GPT-3.5 Turbo).
- **WhatsApp**: [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).

## 📦 Estructura del Proyecto

```text
Nutria/
├── frontend/   # Aplicación Next.js (Dashboard y Gestión)
└── backend/    # Servidor Express (API, WhatsApp, IA y Prisma)
```

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Walter-D3v/Nutria.git
cd Nutria
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```
Crea un archivo `.env` en la carpeta `backend/` basado en `.env.example`:
```env
PORT=3001
DATABASE_URL="tu-url-de-postgresql"
AZURE_OPENAI_ENDPOINT="..."
AZURE_OPENAI_API_KEY="..."
AZURE_OPENAI_DEPLOYMENT="nutrition-gpt"
```
**Inicializar base de datos:**
```bash
npx prisma generate
npx prisma db push
```

### 3. Configurar el Frontend
```bash
cd ../frontend
npm install
```

## 🏃 Cómo Ejecutar

1.  **Iniciar Backend**:
    ```bash
    cd backend
    npm start
    ```
2.  **Iniciar Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```
3.  Accede a `http://localhost:3000`.

## 🔒 Seguridad
Asegúrate de no compartir tu archivo `.env` ni las carpetas `.wwebjs_auth` (que contienen tu sesión de WhatsApp activa). Estas ya están incluidas en el `.gitignore`.

---
*Desarrollado para la automatización y eficiencia en consultorios de nutrición.*
