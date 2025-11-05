# 📋 Actualización del Sistema Nexos - Sistema de Aprobación y Gestión

## 🎯 Nuevas Funcionalidades Implementadas

### 1. **Sistema de Aprobación de Empresas**

#### Flujo de Registro de Empresas:
1. **Registro**: Las empresas se registran normalmente desde `login.html`
2. **Estado Pendiente**: La cuenta queda en estado "pendiente" y no puede iniciar sesión
3. **Notificación**: El sistema muestra el mensaje "Solicitud de empresa enviada. Pendiente de aprobación por el administrador."
4. **Aprobación/Rechazo**: El administrador debe aprobar o rechazar la solicitud desde el panel de administración
5. **Acceso**: Solo después de la aprobación, la empresa puede iniciar sesión

#### Estados de Empresas:
- **`pendiente`**: Recién registrada, esperando aprobación
- **`aprobada`**: Aprobada por admin, puede acceder al sistema
- **`rechazada`**: Rechazada por admin, no puede acceder

---

### 2. **Panel de Administración** (`admin.html`)

#### Acceso:
- Solo usuarios con `role: 'admin'` pueden acceder
- URL: `/admin.html`
- Enlace en el menú desplegable del usuario (solo visible para admin)

#### Secciones del Panel:

##### **📊 Estadísticas (Dashboard)**
- Solicitudes Pendientes
- Empresas Aprobadas
- Solicitudes Rechazadas
- Usuarios Totales

##### **⏰ Solicitudes Pendientes**
Tabla con:
- Razón Social
- RUT
- Email
- Fecha de Registro
- Acciones:
  - 👁️ **Ver Detalles**: Modal con toda la información
  - ✅ **Aprobar**: Mueve la empresa a "Aprobadas" y permite su acceso
  - ❌ **Rechazar**: Permite agregar un motivo de rechazo

##### **🏢 Todas las Empresas**
Lista de empresas aprobadas con:
- Razón Social, RUT, Email
- Rol (admin/empresa)
- Estado (aprobada)
- Ver detalles completos

##### **👥 Todos los Usuarios**
Lista de usuarios registrados con:
- Nombre completo
- Username, Email
- Rol (admin/user)
- Fecha de registro
- Ver detalles completos

##### **🚫 Rechazadas**
Lista de empresas rechazadas con:
- Datos de la empresa
- Fecha de rechazo
- Motivo del rechazo
- Ver detalles

---

### 3. **Gestión de Subastas/Rifas/Productos**

#### Nuevo Tab en Perfil de Empresa
Ubicación: `perfil-empresa.html` → Tab "Mis Subastas/Rifas"

#### Crear Publicaciones:
Las empresas aprobadas pueden crear:
- **Subastas**: Para rematar productos
- **Rifas**: Para sorteos
- **Venta de Productos**: Para venta directa

#### Formulario de Creación:
- **Tipo**: Subasta / Rifa / Venta
- **Título**: Nombre del producto/servicio
- **Descripción**: Detalles completos
- **Precio Inicial**: Monto de inicio
- **Fecha de Fin**: Cuándo finaliza
- **Imagen**: URL de la imagen (opcional)

#### Gestión:
- Lista de todas las publicaciones de la empresa
- Visualización con badges de tipo y estado
- Botón para eliminar publicaciones
- Información de precio actual y fecha de fin

---

### 4. **Cuentas de Prueba Creadas**

#### Usuario Normal:
```
Username: usuario1
Password: 1234
Email: usuario1@nexos.com
Rol: user
```

#### Empresa Normal:
```
Username: empresa1
Password: 1234
Email: empresa1@nexos.com
Razón Social: Organización Genérica
RUT: 98765432-1
Estado: aprobada
Rol: empresa
```

#### Administrador Usuario:
```
Username: admin
Password: 1234
Email: admin@nexos.com
Rol: admin (usuario)
```

#### Administrador Empresa:
```
Username: admin
Password: 1234
Email: admin.empresa@nexos.com
Rol: admin (empresa)
```

---

## 🔧 Funciones Nuevas en `auth.js`

### Gestión de Empresas:
```javascript
auth.getEmpresasPendientes()           // Obtiene empresas pendientes
auth.getEmpresasRechazadas()           // Obtiene empresas rechazadas
auth.aprobarEmpresa(empresaId)         // Aprobar empresa (solo admin)
auth.rechazarEmpresa(empresaId, motivo) // Rechazar empresa (solo admin)
```

### Gestión de Subastas:
```javascript
auth.crearSubasta(subastaData)         // Crear subasta/rifa/venta
auth.getSubastas(filtros)              // Obtener subastas (con filtros opcionales)
auth.eliminarSubasta(subastaId)        // Eliminar subasta
```

#### Filtros disponibles para `getSubastas()`:
```javascript
{
  empresaId: 'id_empresa',  // Filtrar por empresa
  tipo: 'subasta',          // subasta, rifa, venta
  estado: 'activa'          // activa, finalizada, cancelada
}
```

---

## 💾 Nuevas Claves en localStorage

```javascript
nexos_empresas_pendientes    // Empresas esperando aprobación
nexos_empresas_rechazadas    // Empresas rechazadas
nexos_subastas               // Todas las subastas/rifas/ventas
```

---

## 📱 Flujo Completo de Uso

### Para Empresas:
1. Registrarse en `login.html` (Tab "Inicio Empresa" → "Registro")
2. Ver mensaje de "Pendiente de aprobación"
3. Esperar aprobación del administrador
4. Recibir aprobación
5. Iniciar sesión con sus credenciales
6. Acceder a "Mi Perfil" → Tab "Mis Subastas/Rifas"
7. Crear subastas, rifas o productos
8. Gestionar sus publicaciones

### Para Administradores:
1. Iniciar sesión con `admin / 1234`
2. Click en el menú de usuario → "Panel Admin"
3. Ver estadísticas del sistema
4. Revisar solicitudes pendientes
5. Ver detalles de cada solicitud
6. Aprobar o rechazar (con motivo opcional)
7. Gestionar todas las cuentas del sistema

### Para Usuarios:
1. Registrarse normalmente
2. Acceso inmediato (sin aprobación requerida)
3. Ver subastas/rifas de empresas aprobadas
4. Participar en subastas

---

## 🎨 Mejoras de UI

### Panel de Admin:
- Dashboard con estadísticas en cards con colores
- Tabs para organizar la información
- Tablas responsivas con hover effects
- Modal para ver detalles completos
- Badges de colores para estados y roles
- Botones de acción con iconos

### Perfil de Empresa:
- Nuevo tab "Mis Subastas/Rifas"
- Formulario intuitivo para crear publicaciones
- Lista visual de publicaciones con badges
- Botón de eliminación con confirmación

### Menú de Usuario:
- Enlace "Panel Admin" solo visible para administradores
- Rediseño para incluir más opciones

---

## 🔒 Seguridad y Permisos

### Validaciones Implementadas:
- ✅ Solo admin puede acceder a `admin.html`
- ✅ Solo admin puede aprobar/rechazar empresas
- ✅ Solo empresas aprobadas pueden crear subastas
- ✅ Solo el dueño o admin pueden eliminar subastas
- ✅ Empresas pendientes no pueden iniciar sesión
- ✅ Validación de duplicados en RUT, email, username

---

## 📄 Archivos Modificados/Creados

### Nuevos Archivos:
- ✅ `admin.html` - Panel de administración completo

### Archivos Modificados:
- ✅ `auth.js` - Agregadas funciones de gestión de empresas y subastas
- ✅ `perfil-empresa.html` - Agregado tab de subastas/rifas
- ✅ Todas las páginas principales ya tienen `config.js` integrado

---

## 🚀 Próximos Pasos Sugeridos

1. **Sistema de Pujas**: Permitir a usuarios pujar en subastas activas
2. **Notificaciones**: Alertar a empresas cuando sean aprobadas/rechazadas
3. **Dashboard de Usuario**: Ver historial de participación en subastas
4. **Filtros y Búsqueda**: En la página de subastas públicas
5. **Upload de Imágenes**: Integrar servicio para subir imágenes reales
6. **Internacionalización**: Implementar cambio real de idioma (es/en)

---

## 🧪 Cómo Probar

### Probar Registro de Empresa:
1. Ir a `login.html`
2. Tab "Inicio Empresa" → "Registro"
3. Llenar formulario y registrar
4. Intentar iniciar sesión → Ver mensaje "Pendiente de aprobación"

### Probar Panel de Admin:
1. Iniciar sesión con `admin / 1234`
2. Click en menú usuario → "Panel Admin"
3. Navegar por las tabs
4. Aprobar/rechazar solicitudes

### Probar Creación de Subastas:
1. Iniciar sesión con `empresa1 / 1234` (o aprobar una nueva)
2. Ir a "Mi Perfil" → Tab "Mis Subastas/Rifas"
3. Llenar formulario y crear publicación
4. Ver lista de publicaciones
5. Eliminar una publicación

---

## 🎉 Resultado Final

Sistema completo de autenticación con:
- ✅ Registro de usuarios y empresas
- ✅ Sistema de aprobación para empresas
- ✅ Panel de administración robusto
- ✅ Gestión de subastas/rifas/productos
- ✅ Configuraciones funcionales (tema, accesibilidad)
- ✅ Cuentas de prueba pre-creadas
- ✅ Interfaz moderna y responsiva
- ✅ Validaciones de seguridad
- ✅ localStorage para persistencia

**Todo implementado con JavaScript vanilla, sin frameworks externos!** 🚀
