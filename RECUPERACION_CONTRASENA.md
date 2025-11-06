# Sistema de Recuperación de Contraseña - Nexos

## 📋 Descripción General

Se ha implementado un sistema completo de recuperación de contraseña para usuarios y empresas en la plataforma Nexos. El sistema distingue entre usuarios normales y empresas, aplicando flujos diferentes para cada tipo.

## ✨ Características Principales

### Para Usuarios Normales
- ✅ **Recuperación Automática**: Al solicitar recuperación, se genera una contraseña temporal de inmediato
- ✅ **Sin Aprobación Admin**: El proceso es instantáneo y no requiere intervención del administrador
- ✅ **Contraseña Visible**: La contraseña temporal se muestra en pantalla después de la solicitud
- ✅ **Registro en Sistema**: Todas las solicitudes quedan registradas en el panel admin para auditoría

### Para Empresas
- ⏳ **Requiere Aprobación**: Las solicitudes quedan en estado "pendiente" hasta que el admin las revise
- 🔐 **Admin Establece Contraseña**: El administrador debe aprobar y establecer la nueva contraseña manualmente
- ✉️ **Notificación**: El sistema registra la solicitud para que el admin la gestione
- ❌ **Opción de Rechazo**: El admin puede rechazar solicitudes con un motivo

## 🎯 Flujo de Uso

### 1. Solicitud de Recuperación (Login)

1. Usuario/Empresa hace clic en **"¿Olvidaste tu contraseña?"** en la página de login
2. Se abre un modal solicitando el correo electrónico
3. Ingresa el correo y hace clic en **"Solicitar Recuperación"**

**Resultado Usuario:**
```
✅ Solicitud procesada
Tu nueva contraseña temporal es: abc12xyz
Puedes usarla para iniciar sesión ahora.
```

**Resultado Empresa:**
```
✅ Solicitud enviada
El administrador debe aprobarla o rechazarla.
```

### 2. Gestión Admin (Panel Administrativo)

#### Ver Solicitudes
1. Login como admin (usuario: `admin`, contraseña: `1234`)
2. Ir a `admin.html`
3. Hacer clic en la pestaña **"Restablecimientos"**
4. Ver listado de todas las solicitudes con:
   - Tipo (Usuario/Empresa)
   - Nombre de la cuenta
   - Email
   - Fecha de solicitud
   - Estado (Pendiente/Aprobada/Rechazada)

#### Aprobar Solicitud (Solo Empresas)
1. Hacer clic en botón **"Aprobar"** en la solicitud pendiente
2. Se abre modal para establecer nueva contraseña
3. Ingresar contraseña (mínimo 4 caracteres) y confirmar
4. Hacer clic en **"Aprobar y Establecer Contraseña"**
5. La contraseña se muestra al admin para que la comunique a la empresa

#### Rechazar Solicitud (Solo Empresas)
1. Hacer clic en botón **"Rechazar"** en la solicitud pendiente
2. Opcionalmente ingresar motivo del rechazo
3. Confirmar rechazo
4. La solicitud cambia a estado "Rechazada"

#### Ver Detalles
Para cualquier solicitud (usuario o empresa), hacer clic en **"Ver"** para ver:
- ID de solicitud
- Información completa de la cuenta
- Contraseña temporal (si aplica)
- Estado y fechas
- Motivo de rechazo (si aplica)

## 🗄️ Estructura de Datos

### LocalStorage
```javascript
nexos_password_reset_requests = [
  {
    id: "id_1234567890_abc123",
    accountId: "id_del_usuario_o_empresa",
    username: "nombreusuario",
    email: "correo@ejemplo.com",
    displayName: "Nombre Completo / Razón Social",
    type: "user" | "empresa",
    status: "pendiente" | "aprobada" | "rechazada",
    createdAt: "2025-11-05T12:30:00.000Z",
    tempPassword: "abc12xyz", // solo para usuarios
    motivoRechazo: "motivo del rechazo", // solo si rechazada
    adminId: "id_del_admin", // quien aprobó/rechazó
    adminDecisionAt: "2025-11-05T13:00:00.000Z"
  }
]
```

## 🔧 Archivos Modificados

### `auth.js`
- ✅ Inicialización de `nexos_password_reset_requests` en localStorage
- ✅ Método `getPasswordResetRequests()`: Obtiene todas las solicitudes
- ✅ Método `requestPasswordReset(email)`: Crea solicitud de recuperación
- ✅ Método `approvePasswordReset(requestId, newPassword)`: Aprueba solicitud (admin)
- ✅ Método `rejectPasswordReset(requestId, motivo)`: Rechaza solicitud (admin)

### `login.html`
- ✅ Enlace "¿Olvidaste tu contraseña?" en formularios de login
- ✅ Modal de recuperación con formulario de email
- ✅ Estilos CSS para modal responsive
- ✅ Funciones JavaScript para abrir/cerrar modal y procesar solicitud
- ✅ Alertas visuales dentro del modal (no prompts del navegador)

### `admin.html`
- ✅ Nueva pestaña "Restablecimientos" en navegación
- ✅ Tabla de solicitudes con filtros por estado
- ✅ Modal para aprobar solicitud con formulario de contraseña
- ✅ Modal para rechazar solicitud con campo de motivo
- ✅ Función `cargarRestablecimientos()`: Carga y muestra solicitudes
- ✅ Funciones de gestión: aprobar, rechazar, ver detalles
- ✅ Badges visuales para tipo y estado

## 🎨 Elementos UI

### Login
- **Enlace**: Color primario, con icono de llave
- **Modal**: Fondo blur, centrado, con botón de cerrar (X)
- **Alertas**: Verde para éxito, rojo para error (dentro del modal)

### Panel Admin
- **Badges**:
  - 🟢 Usuario: Badge gris con icono de usuario
  - 🔵 Empresa: Badge verde con icono de edificio
  - 🟡 Pendiente: Badge amarillo
  - 🟢 Aprobada: Badge verde
  - 🔴 Rechazada: Badge rojo
- **Botones**:
  - ✅ Aprobar: Verde
  - ❌ Rechazar: Rojo
  - 👁️ Ver: Azul

## 🧪 Cómo Probar

### Test 1: Recuperación de Usuario
```
1. Abrir login.html
2. Click en "¿Olvidaste tu contraseña?" (sección Usuario)
3. Ingresar: usuario1@nexos.com
4. Ver contraseña temporal en pantalla
5. Probar login con la nueva contraseña
```

### Test 2: Recuperación de Empresa
```
1. Abrir login.html
2. Click en "¿Olvidaste tu contraseña?" (sección Empresa)
3. Ingresar: empresa1@nexos.com
4. Ver mensaje de "solicitud enviada"
5. Login como admin (admin/1234)
6. Ir a admin.html > Restablecimientos
7. Aprobar solicitud con nueva contraseña
8. Volver a login y probar con la nueva contraseña
```

### Test 3: Rechazo de Solicitud
```
1. Crear solicitud de empresa (empresa1@nexos.com)
2. Login como admin
3. Ir a Restablecimientos
4. Click en Rechazar
5. Ingresar motivo: "Documentación incompleta"
6. Verificar que aparece en estado "Rechazada"
7. Click en "Ver" para revisar el motivo
```

## 📊 Consideraciones

### Seguridad
- ⚠️ **Contraseñas en texto plano**: El sistema actual guarda contraseñas sin hash en localStorage (solo para demo)
- ⚠️ **Sin verificación de email**: No hay envío real de correos (simulado)
- ✅ **Validación de permisos**: Solo admin puede aprobar/rechazar solicitudes
- ✅ **Auditoría completa**: Todas las solicitudes quedan registradas

### Limitaciones
- 📧 No hay envío real de correos electrónicos (requiere backend)
- 🔒 LocalStorage puede ser inspeccionado en DevTools
- 🌐 Sin persistencia entre dispositivos (datos locales al navegador)

### Mejoras Futuras
1. **Backend real**: Implementar servidor con Node.js/Express
2. **Envío de emails**: Integrar servicio SMTP (SendGrid, Mailgun, etc.)
3. **Tokens temporales**: Usar tokens JWT con expiración
4. **Hash de contraseñas**: Implementar bcrypt o similar
5. **2FA opcional**: Agregar autenticación de dos factores
6. **Historial**: Dashboard de estadísticas de recuperaciones

## 🐛 Troubleshooting

### Problema: No aparece la contraseña temporal
**Solución**: Revisar la consola del navegador (F12) - puede haber un error en auth.js

### Problema: Solicitud no aparece en panel admin
**Solución**: Verificar localStorage en DevTools > Application > Local Storage > nexos_password_reset_requests

### Problema: No se puede aprobar solicitud
**Solución**: Verificar que estás logueado como admin (role === 'admin')

### Problema: Modal no se cierra
**Solución**: Hacer clic en la X o fuera del modal, o recargar la página

## 📝 Notas de Desarrollo

- ✅ Compatible con todos los navegadores modernos
- ✅ Responsive design para móviles
- ✅ No requiere dependencias externas
- ✅ Código JavaScript vanilla (sin frameworks)
- ✅ Estilos consistentes con el resto de la aplicación

## 📞 Soporte

Para reportar bugs o sugerir mejoras:
1. Revisar localStorage y consola del navegador
2. Documentar pasos para reproducir el problema
3. Incluir screenshots si es posible

---

**Versión**: 1.0.0  
**Fecha**: Noviembre 2025  
**Autor**: Sistema Nexos
