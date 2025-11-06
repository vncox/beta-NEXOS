# Nexos APP

## Descripción

Este proyecto contiene únicamente el **frontend** de la aplicación Nexos APP.

## Estado del proyecto

⚠️ **Nota importante**: Este repositorio solo incluye la interfaz de usuario (frontend). El backend aún no está implementado.

## Vistas disponibles

- **Inicio**: Página de bienvenida
- **Login/Registro**: Acceso a la aplicación con recuperación de contraseña
- **Vista privada**: Área de usuario autenticado
- **Panel Admin**: Gestión de usuarios, empresas y solicitudes de restablecimiento

## ✨ Nuevas Funcionalidades

### 🆔 RUT Obligatorio para Usuarios

**Actualización del 5 de noviembre de 2025:**
- ✅ El campo **RUT** es ahora **obligatorio** para todos los usuarios normales
- ✅ Validación de formato chileno: `12.345.678-9` o `12345678-9`
- ✅ Validación de unicidad: No se permiten RUT duplicados
- ✅ Visible en panel administrativo y detalles de usuario
- ✅ Usuarios existentes mantienen compatibilidad con RUT por defecto

### 🔑 Sistema de Recuperación de Contraseña

Se ha implementado un sistema completo de recuperación de contraseña con las siguientes características:

#### Para Usuarios
- Recuperación automática con contraseña temporal generada al instante
- No requiere aprobación del administrador
- La contraseña temporal se muestra en pantalla después de la solicitud

#### Para Empresas
- Las solicitudes quedan pendientes de aprobación del administrador
- El admin debe revisar y establecer la nueva contraseña manualmente
- Opción de aprobar o rechazar con motivo

#### Panel Administrativo
- Nueva pestaña **"Restablecimientos"** para gestionar solicitudes
- Vista completa de todas las solicitudes con estado y filtros
- Modales intuitivos para aprobar/rechazar (sin prompts del navegador)
- Registro completo de todas las acciones para auditoría

📖 **Documentación completa**: Ver [RECUPERACION_CONTRASENA.md](./RECUPERACION_CONTRASENA.md)

## Tecnologías

- HTML5
- CSS3
- JavaScript

## Instalación

Simplemente abre el archivo `index.html` en tu navegador web.

---

*Proyecto en desarrollo* 🚧
