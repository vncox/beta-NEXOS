# 🚀 Guía Rápida - Sistema NEXOS (Backend API)

## 📋 Índice Rápido
- [Iniciar Sistema](#iniciar-sistema)
- [Managers Disponibles](#managers-disponibles)
- [Endpoints Backend](#endpoints-backend)
- [Solución de Problemas](#solución-de-problemas)

---

## 🏃 Iniciar Sistema

### Backend (Puerto 4000)
```bash
cd backend-full
npm install
npm start
```

### Frontend (Puerto 3000)
```bash
python -m http.server 3000
```

### Verificar Backend
```bash
curl http://localhost:4000/api/subastas
```

---

## 🔧 Managers Disponibles

### 1. Autenticación
```javascript
// auth-backend.js
authBackend.login(email, password)
authBackend.register(userData)
authBackend.logout()
authBackend.isAuthenticated()
authBackend.getSession()
```

### 2. Perfil de Usuario
```javascript
// perfil-manager.js
perfilManager.cargarPerfil()
perfilManager.actualizarPerfil(datos)
perfilManager.cambiarPassword(oldPass, newPass)
perfilManager.cargarHistorialPujas()
perfilManager.cargarHistorialCompras()
perfilManager.cargarParticipacionRifas()
perfilManager.eliminarCuenta(password)
```

### 3. Subastas
```javascript
// subastas-manager.js
subastasManager.getSubastas()
subastasManager.getSubastaById(id)
subastasManager.crearSubasta(datos)
subastasManager.realizarPuja(subastaId, monto)
subastasManager.getPujasBySubasta(subastaId)
```

### 4. Rifas
```javascript
// rifas-manager.js
rifasManager.getRifas()
rifasManager.getRifaById(id)
rifasManager.crearRifa(datos)
rifasManager.comprarBoleto(rifaId, cantidad)
rifasManager.eliminarRifa(id)
```

### 5. Productos
```javascript
// productos-manager.js
productosManager.getProductos()
productosManager.getProductoById(id)
productosManager.crearProducto(datos)
productosManager.actualizarProducto(id, datos)
productosManager.eliminarProducto(id)
productosManager.comprarProducto(productoId, cantidad)
```

### 6. Causas
```javascript
// causas-manager.js
causasManager.getCausas()
causasManager.getCausaById(id)
causasManager.donar(causaId, monto, mensaje)
```

### 7. Administración
```javascript
// admin-manager.js
adminManager.getEstadisticas()
adminManager.getEmpresas()
adminManager.getUsuarios()
adminManager.aprobarEmpresa(id)
adminManager.rechazarEmpresa(id)
```

### 8. Empresa
```javascript
// empresa-manager.js
empresaManager.getPerfil()
empresaManager.actualizarPerfil(datos)
empresaManager.getProductos()
empresaManager.getRifas()
empresaManager.getSubastas()
```

### 9. Wallet
```javascript
// wallet-manager.js
walletManager.getWallet()
walletManager.depositar(monto)
walletManager.retirar(monto)
walletManager.getTransacciones()
```

### 10. Detalle de Subasta
```javascript
// detalle-subasta-manager.js
detalleSubastaManager.cargarSubasta()
detalleSubastaManager.realizarPuja(monto)
detalleSubastaManager.cargarPujas()
```

---

## 🌐 Endpoints Backend

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/refresh` - Refrescar token

### Usuarios
- `GET /api/users/perfil` - Obtener perfil
- `PUT /api/users/perfil` - Actualizar perfil
- `PUT /api/users/password` - Cambiar contraseña
- `GET /api/users/historial/pujas` - Historial de pujas
- `GET /api/users/historial/compras` - Historial de compras
- `GET /api/users/historial/rifas` - Participación en rifas
- `DELETE /api/users/cuenta` - Eliminar cuenta

### Subastas
- `GET /api/subastas` - Listar subastas
- `GET /api/subastas/:id` - Detalle de subasta
- `POST /api/subastas` - Crear subasta
- `PUT /api/subastas/:id` - Actualizar subasta
- `DELETE /api/subastas/:id` - Eliminar subasta
- `POST /api/pujas` - Realizar puja
- `GET /api/subastas/:id/pujas` - Obtener pujas

### Rifas
- `GET /api/rifas` - Listar rifas
- `GET /api/rifas/:id` - Detalle de rifa
- `POST /api/rifas` - Crear rifa
- `PUT /api/rifas/:id` - Actualizar rifa
- `DELETE /api/rifas/:id` - Eliminar rifa
- `POST /api/rifas/:id/comprar` - Comprar boleto

### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/:id` - Detalle de producto
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto
- `POST /api/productos/:id/comprar` - Comprar producto

### Causas
- `GET /api/causas` - Listar causas
- `GET /api/causas/:id` - Detalle de causa
- `POST /api/donaciones` - Realizar donación
- `GET /api/donaciones/mis-donaciones` - Mis donaciones

### Wallet
- `GET /api/wallet` - Obtener wallet
- `POST /api/wallet/depositar` - Depositar
- `POST /api/wallet/retirar` - Retirar
- `GET /api/wallet/transacciones` - Historial

### Admin
- `GET /api/admin/estadisticas` - Dashboard
- `GET /api/admin/empresas` - Listar empresas
- `GET /api/admin/usuarios` - Listar usuarios
- `PUT /api/admin/empresa/:id/aprobar` - Aprobar empresa
- `PUT /api/admin/empresa/:id/rechazar` - Rechazar empresa

---

## 🛠️ Solución de Problemas

### Error: "Backend no responde"
```bash
# Verificar que el backend está corriendo
netstat -ano | findstr :4000

# Si no está corriendo
cd backend-full
npm start
```

### Error: "401 Unauthorized"
```javascript
// El token expiró, hacer login nuevamente
authBackend.logout();
window.location.href = 'login.html';
```

### Error: "Cannot read property 'manager' of undefined"
```html
<!-- Verificar que el manager está incluido en el HTML -->
<script src="productos-manager.js"></script>
```

### Error: "CORS policy"
```javascript
// Verificar que el backend tiene CORS habilitado
// backend-full/src/server.js debe tener:
app.use(cors());
```

### Error: "Network request failed"
```javascript
// Verificar la configuración de la URL del backend
// En api-config.js:
BASE_URL: 'http://localhost:4000/api'
```

---

## 📝 Ejemplo de Uso Completo

### Cargar y mostrar subastas
```html
<!-- En el HTML -->
<script src="api-config.js"></script>
<script src="auth-backend.js"></script>
<script src="subastas-manager.js"></script>

<script>
async function cargarSubastas() {
    const result = await subastasManager.getSubastas();
    
    if (result.success) {
        const subastas = result.subastas;
        subastas.forEach(subasta => {
            console.log(subasta.titulo, subasta.precio_actual);
        });
    } else {
        console.error('Error:', result.message);
    }
}

// Llamar al cargar la página
cargarSubastas();
</script>
```

### Realizar una puja
```javascript
async function realizarPuja(subastaId, monto) {
    // Verificar autenticación
    if (!authBackend.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Realizar puja
    const result = await subastasManager.realizarPuja(subastaId, monto);
    
    if (result.success) {
        notify.success('Puja realizada correctamente');
        // Recargar subasta
        cargarSubasta();
    } else {
        notify.error('Error: ' + result.message);
    }
}
```

### Actualizar perfil
```javascript
async function actualizarMiPerfil() {
    const datos = {
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '+56912345678'
    };
    
    const result = await perfilManager.actualizarPerfil(datos);
    
    if (result.success) {
        notify.success('Perfil actualizado');
    } else {
        notify.error('Error: ' + result.message);
    }
}
```

---

## 🔐 Manejo de Autenticación

### Proteger una página
```javascript
// Al inicio del archivo JS
if (!authBackend.isAuthenticated()) {
    window.location.href = 'login.html';
}
```

### Obtener usuario actual
```javascript
const session = authBackend.getSession();
console.log('Usuario:', session.username);
console.log('Email:', session.email);
console.log('Rol:', session.role);
```

### Verificar rol de administrador
```javascript
if (session.role === 'admin') {
    // Mostrar funciones de admin
}
```

---

## 📚 Archivos Importantes

### Frontend
- `api-config.js` - Configuración de API y cliente
- `auth-backend.js` - Autenticación JWT
- `*-manager.js` - Managers para cada módulo
- `notify.js` - Sistema de notificaciones

### Backend
- `backend-full/src/server.js` - Servidor principal
- `backend-full/src/routes/*.js` - Rutas API
- `backend-full/src/controllers/*.js` - Controladores
- `backend-full/src/models/*.js` - Modelos de base de datos
- `backend-full/src/middleware/auth.js` - Middleware JWT

---

## 🎯 Convenciones de Código

### Naming
- Managers: `nombreManager` (camelCase)
- Endpoints: `/api/recurso` (kebab-case)
- Funciones: `verboNombre()` (camelCase)

### Responses
```javascript
// Success
{
    success: true,
    data: {...},
    message: 'Operación exitosa'
}

// Error
{
    success: false,
    message: 'Descripción del error',
    error: {...}
}
```

### Async/Await
```javascript
// Siempre usar try-catch
async function miFuncion() {
    try {
        const result = await manager.metodo();
        if (result.success) {
            // Éxito
        } else {
            // Error
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
```

---

**Última actualización:** 6 de noviembre de 2025  
**Versión:** 2.0 - Backend API  

Para más información, consultar:
- `MIGRACION_COMPLETADA.md` - Resumen ejecutivo
- `RESUMEN_MIGRACION.md` - Métricas detalladas
- `MIGRACION_LOCALSTORAGE.md` - Plan de migración
