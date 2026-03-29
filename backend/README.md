# Nutria - Backend API & Services

Este es el servidor central de la plataforma Nutria, encargado de la lógica de negocio, integración con IA (Azure OpenAI), gestión de sesiones de WhatsApp y persistencia de datos.

## 🛠️ Tecnologías

- **Node.js & Express**: Servidor web y API REST.
- **Socket.io**: Comunicación en tiempo real para el estado de WhatsApp y progreso de envíos.
- **Prisma ORM**: Gestión de la base de datos PostgreSQL.
- **whatsapp-web.js**: Motor para la automatización de WhatsApp.
- **Azure OpenAI**: Generación de mensajes personalizados con modelos GPT.

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- Una instancia de PostgreSQL (se recomienda Azure Database for PostgreSQL)
- Cuenta de Azure OpenAI con un despliegue de modelo de chat.

## 🚀 Instalación

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Configuración de Ambiente**:
    Copia el archivo `.env.example` a `.env` y completa las variables:
    ```bash
    cp .env.example .env
    ```

3.  **Base de Datos**:
    Genera el cliente de Prisma y sincroniza el esquema:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

## 🏃 Ejecución

```bash
npm start
```

## 📁 Estructura de Carpetas

- `src/controllers/`: Lógica de los endpoints (Perfiles, Snapshots, Broadcast).
- `src/routes/`: Definición de rutas de la API.
- `src/services/`: 
  - `ai.js`: Lógica de interacción con Azure OpenAI y construcción de prompts.
  - `whatsapp.js`: Singleton del cliente de WhatsApp y manejo de ventos.
- `prisma/`: Esquema de la base de datos.
- `server.js`: Punto de entrada que inicializa Express y Socket.io.

## 📢 Endpoints Principales

- `GET /api/profiles`: Lista de pacientes.
- `POST /api/profiles/:id/snapshots`: Registrar nueva medición de bioimpedancia.
- `POST /api/messages/broadcast`: Iniciar envío masivo personalizado con IA.
