# Nutria - Dashboard de Nutricionista

Este es el frontend de la plataforma Nutria, construido con Next.js 15. Proporciona una interfaz intuitiva para la gestión de pacientes, registro de mediciones de bioimpedancia y comunicación automática via WhatsApp con IA.

## 🛠️ Tecnologías

- **Next.js 15 (App Router)**: Framework de React para el desarrollo de aplicaciones web de alto rendimiento.
- **Tailwind CSS**: Estilado moderno y personalizable.
- **Lucide React**: Iconografía elegante y compacta.
- **Socket.io-client**: Conexión bidireccional con el backend para estado de WhatsApp y progreso.
- **TypeScript**: Tipado estático para mayor calidad de código.

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- Backend de Nutria corriendo en `http://localhost:3001` (por defecto).

## 🚀 Instalación

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Configuración**:
    Actualmente, la URL del backend está configurada a `http://localhost:3001` en los archivos de la aplicación. Asegúrate de modificarla si el puerto es diferente.

## 🏃 Ejecución

```bash
npm run dev
```

## ✨ Funcionalidades Incluidas

- **Página de Inicio (Dashboard)**: Visualización rápida de todos los pacientes, sus mediciones clave (Edad, Peso, IMC) y acceso directo a edición o mensajería.
- **Panel de WhatsApp**: Sección dedicada para vincular el dispositivo mediante código QR, ver estado de conexión y realizar envíos masivos.
- **Expediente Detallado**:
  - **Pestaña de Edición**: Datos fijos (Hábitos, Recomendaciones de IA).
  - **Pestaña de Seguimiento (Snapshots)**: Historial completo de consultas con progreso de peso (↓/↑) y notas clínicas.
  - **Pestaña de Mensajería**: Historial de todos los mensajes enviados al paciente con su estado (Enviado/Fallido).

## 📁 Estructura de Carpetas

- `src/app/`: Estructura de rutas (App Router).
- `src/app/profiles/[id]/`: Vista detallada de cada paciente y formulario de envío de IA individual.
- `src/app/profiles/new/`: Formulario de creación de nuevos pacientes.
- `src/app/page.tsx`: Dashboard principal y sección de WhatsApp.
- `public/`: Assets estáticos.
