# 🚀 IT Helpdesk Portal

Un sistema moderno de mesa de ayuda (Helpdesk) construido con **React (Vite)** y **Firebase**. Diseñado para gestionar tickets de soporte técnico, administrar niveles de servicio (SLA) dinámicos y organizar tareas mediante flujos Kanban.

## ✨ Características Principales

- **Gestión Integral de Tickets:** Creación, categorización (Hardware, Software, Redes, etc.) y asignación de tickets a técnicos.
- **Tablero Kanban Interactivo:** Interfaz fluida con *Drag & Drop* para gestionar visualmente los estados de los tickets (Abierto, En Progreso, Resuelto).
- **Dashboard de KPIs:** Analíticas en tiempo real para el equipo de staff (Tiempo Medio de Resolución, Tickets Vencidos, SLAs Incumplidos).
- **Matriz SLA Dinámica:** Sistema avanzado que calcula automáticamente la fecha de vencimiento según el impacto, la urgencia y horarios laborales configurables.
- **Base de Conocimientos (FAQ):** Portal de autoayuda para que los usuarios encuentren soluciones antes de levantar un ticket.
- **Roles y Permisos:** Control de accesos basado en Roles (RBAC) diferenciando entre Usuario Final, Técnico de Soporte y Administrador.
- **Exportación de Datos:** Capacidad de generar y descargar reportes CSV directamente desde el portal.

## 🛠️ Stack Tecnológico

- **Frontend:** React 18, Vite, CSS puro (Variables & CSS Grid/Flexbox).
- **Backend / BaaS:** Firebase (Authentication, Firestore, Storage).
- **Librerías Destacadas:** 
  - `@hello-pangea/dnd` para la vista Kanban.
  - Funcionalidad nativa de exportación a CSV.

## 🚀 Instalación y Uso Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/TU_USUARIO/helpdesk-react-firebase.git
   cd helpdesk-react-firebase
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Firebase:**
   - Crea un proyecto en Firebase y habilita Authentication, Firestore y Storage.
   - Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales (usa `.env.example` como referencia).

4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

## 📄 Licencia

Este proyecto es de uso personal y educativo.
