# Sistema de Autenticación Nexos

## Descripción

Sistema completo de autenticación para la plataforma Nexos que permite el registro, inicio de sesión y gestión de perfiles para usuarios y empresas. Los datos se almacenan en `localStorage` del navegador.

## Características

### ✅ Funcionalidades Implementadas

1. **Registro de Usuarios**
   - Formulario de registro con validación
   - Campos: usuario, nombre, apellido, email, teléfono, contraseña
   - Validación de campos únicos (username, email)

2. **Registro de Empresas**
   - Formulario específico para empresas
   - Campos: usuario, razón social, RUT, email, teléfono, dirección, sitio web, contraseña
   - Validación de RUT único

3. **Inicio de Sesión**
   - Login separado para usuarios y empresas
   - Validación de credenciales
   - Redirección automática a perfil correspondiente

4. **Perfiles de Usuario**
   - Página de perfil con información personal
   - Edición de datos personales
   - Configuración de notificaciones
   - Opciones de accesibilidad (alto contraste, tamaño de texto, animaciones reducidas)
   - Cambio de contraseña

5. **Perfiles de Empresa**
   - Página de perfil con información corporativa
   - Edición de datos de la empresa
   - Configuraciones específicas para empresas

6. **Menú de Usuario Autenticado**
   - Aparece en el navbar cuando hay sesión activa
   - Muestra nombre del usuario/empresa
   - Dropdown con opciones: Mi Perfil, Configuración, Cerrar Sesión

7. **Cuentas Admin Predeterminadas**
   - **Usuario Admin:** `admin` / `1234`
   - **Empresa Admin:** `admin` / `1234`

## Estructura de Archivos

```
Nexos-APP/
├── auth.js              # Módulo de autenticación
├── login.html           # Página de login y registro
├── perfil.html          # Perfil de usuario
├── perfil-empresa.html  # Perfil de empresa
├── style.css            # Estilos (incluye estilos de menú de usuario)
├── index.html           # Página principal (con auth integrado)
├── subastas.html        # Subastas (con auth integrado)
├── causas.html          # Causas (con auth integrado)
├── empresas.html        # Empresas (con auth integrado)
├── contacto.html        # Contacto (con auth integrado)
└── README.md            # Este archivo
```

## Cómo Usar

### 1. Iniciar la Aplicación

Simplemente abre `index.html` en tu navegador. El sistema de autenticación se cargará automáticamente.

### 2. Registrarse

1. Ve a la página de Login (`login.html`)
2. Selecciona el tipo de cuenta (Usuario o Empresa)
3. Haz clic en "Registrarse"
4. Completa el formulario con tus datos
5. Haz clic en "Registrarse" o "Registrar Empresa"

### 3. Iniciar Sesión

**Opción A: Con cuenta admin predefinida**
- Usuario: `admin`
- Contraseña: `1234`

**Opción B: Con cuenta creada**
- Usuario: tu_usuario
- Contraseña: tu_contraseña

### 4. Acceder al Perfil

Una vez autenticado:
- Verás tu nombre en el navbar (esquina superior derecha)
- Haz clic en tu nombre para ver el menú desplegable
- Selecciona "Mi Perfil" para ver/editar tu información

### 5. Configurar Preferencias

En tu perfil:
- **Tab "Mis Datos"**: Edita tu información personal/empresarial
- **Tab "Configuración"**: Ajusta notificaciones, tema, idioma y accesibilidad
- **Tab "Seguridad"**: Cambia tu contraseña

### 6. Cerrar Sesión

- Haz clic en tu nombre en el navbar
- Selecciona "Cerrar Sesión"

## Datos Almacenados en localStorage

El sistema guarda tres elementos en `localStorage`:

1. **nexos_users**: Array con todos los usuarios registrados
2. **nexos_empresas**: Array con todas las empresas registradas
3. **nexos_session**: Objeto con la sesión activa actual

### Estructura de Usuario

```javascript
{
  id: "id_1234567890_abc123",
  username: "usuario1",
  password: "1234",
  email: "usuario@email.com",
  nombre: "Juan",
  apellido: "Pérez",
  telefono: "+56 9 1234 5678",
  role: "user", // o "admin"
  configuraciones: {
    tema: "light",
    idioma: "es",
    notificaciones: true,
    emailNotificaciones: true,
    accesibilidad: {
      altoContraste: false,
      tamañoTexto: "normal",
      lectorPantalla: false,
      animacionesReducidas: false
    }
  },
  fechaRegistro: "2025-11-05T12:00:00.000Z"
}
```

### Estructura de Empresa

```javascript
{
  id: "id_1234567890_xyz789",
  username: "empresa1",
  password: "1234",
  email: "empresa@email.com",
  razonSocial: "Empresa SA",
  rut: "12.345.678-9",
  telefono: "+56 2 2345 6789",
  direccion: "Calle Principal 123",
  sitioWeb: "https://www.empresa.com",
  role: "empresa", // o "admin"
  configuraciones: {
    tema: "light",
    idioma: "es",
    notificaciones: true,
    emailNotificaciones: true,
    visibilidadPerfil: "publico",
    recibirSolicitudes: true
  },
  fechaRegistro: "2025-11-05T12:00:00.000Z"
}
```

### Estructura de Sesión

```javascript
{
  id: "id_1234567890_abc123",
  username: "usuario1",
  type: "user", // o "empresa"
  role: "user", // o "empresa" o "admin"
  loginTime: "2025-11-05T12:00:00.000Z"
}
```

## API del Sistema de Autenticación (auth.js)

### Métodos Principales

```javascript
// Registrar usuario
auth.registerUser(userData)

// Registrar empresa
auth.registerEmpresa(empresaData)

// Iniciar sesión
auth.login(username, password, type) // type: 'user' o 'empresa'

// Cerrar sesión
auth.logout()

// Verificar si hay sesión activa
auth.isLoggedIn() // retorna true/false

// Obtener sesión actual
auth.getSession() // retorna objeto de sesión o null

// Obtener datos de cuenta actual
auth.getCurrentAccount() // retorna objeto de usuario/empresa

// Actualizar usuario
auth.updateUser(userId, updates)

// Actualizar empresa
auth.updateEmpresa(empresaId, updates)

// Actualizar configuraciones
auth.updateConfig(configUpdates)

// Cambiar contraseña
auth.changePassword(currentPassword, newPassword)
```

## Flujo de Autenticación

```
1. Usuario visita la aplicación
   ↓
2. auth.js inicializa y crea cuentas admin si no existen
   ↓
3. Si no hay sesión → Botón "Iniciar Sesión" visible
   ↓
4. Usuario hace login → Sesión guardada en localStorage
   ↓
5. Navbar actualiza → Muestra menú de usuario
   ↓
6. Usuario navega por la app con sesión activa
   ↓
7. Usuario cierra sesión → Sesión eliminada, vuelve al paso 3
```

## Seguridad

⚠️ **IMPORTANTE**: Este es un sistema de demostración que almacena datos en `localStorage`. No es seguro para producción.

### Limitaciones:
- Las contraseñas se almacenan en texto plano
- No hay encriptación de datos
- Los datos pueden ser accedidos desde la consola del navegador
- No hay validación del lado del servidor

### Para Producción, se debería:
- Usar un backend con base de datos segura
- Implementar hashing de contraseñas (bcrypt, argon2)
- Usar JWT o sesiones del servidor
- Implementar HTTPS
- Añadir autenticación de dos factores
- Validación del lado del servidor

## Reiniciar Datos

Para borrar todos los datos y empezar de nuevo:

```javascript
// Abrir consola del navegador (F12) y ejecutar:
localStorage.removeItem('nexos_users');
localStorage.removeItem('nexos_empresas');
localStorage.removeItem('nexos_session');
location.reload();
```

O simplemente borrar los datos de localStorage desde las DevTools del navegador.

## Pruebas

### Casos de Prueba Básicos

1. ✅ Registro de usuario nuevo
2. ✅ Registro de empresa nueva
3. ✅ Login con usuario admin (admin/1234)
4. ✅ Login con empresa admin (admin/1234)
5. ✅ Login con credenciales incorrectas (debe fallar)
6. ✅ Editar perfil de usuario
7. ✅ Editar perfil de empresa
8. ✅ Cambiar configuraciones
9. ✅ Cambiar contraseña
10. ✅ Cerrar sesión
11. ✅ Persistencia de sesión (recargar página mantiene sesión)
12. ✅ Redirección automática cuando hay sesión activa

## Próximas Mejoras

- [ ] Recuperación de contraseña
- [ ] Validación de email (formato, dominio)
- [ ] Validación de RUT chileno
- [ ] Foto de perfil
- [ ] Historial de actividad
- [ ] Verificación de email
- [ ] Autenticación de dos factores
- [ ] Integración con OAuth (Google, Facebook)
- [ ] Backend con API REST
- [ ] Base de datos real

## Soporte

Para dudas o problemas, revisa el código en `auth.js` o contacta al desarrollador.

---

**Última actualización:** 5 de noviembre de 2025
**Versión:** 1.0.0
