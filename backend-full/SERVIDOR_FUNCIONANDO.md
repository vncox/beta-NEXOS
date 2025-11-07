# 🎉 ¡BACKEND FUNCIONANDO!

## ✅ Estado Actual

Tu backend está **CORRIENDO** correctamente en:
- **URL:** http://localhost:4000
- **Estado:** ✅ Online
- **Base de Datos:** PostgreSQL 18 ✅ Conectada
- **Tablas:** 11 tablas creadas
- **Usuario Admin:** Disponible

---

## 📊 Datos Disponibles

### Admin
- **Username:** `admin`
- **Password:** `admin123`

---

## 🧪 PRUEBAS DEL API

### 1. Health Check (Verificar que el servidor funciona)

Abre tu navegador y visita:
```
http://localhost:4000/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T...",
  "uptime": 123.456
}
```

### 2. Probar Login con PowerShell

Abre PowerShell y ejecuta:

```powershell
# Login como admin
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method Post -Body $body -ContentType "application/json"

$response
```

Deberías ver algo como:
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "usuario",
  "account": {
    "id": "uuid...",
    "username": "admin",
    "role": "admin",
    ...
  }
}
```

### 3. Probar con curl (si tienes instalado)

```bash
# Health check
curl http://localhost:4000/api/health

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

### 4. Probar con Thunder Client o Postman

1. **Instala Thunder Client** en VS Code (extensión)
2. Crea una nueva request:
   - **Method:** POST
   - **URL:** `http://localhost:4000/api/auth/login`
   - **Body (JSON):**
     ```json
     {
       "username": "admin",
       "password": "admin123"
     }
     ```
3. Click "Send"

---

## 📡 ENDPOINTS DISPONIBLES

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register/user` | Registrar usuario | No |
| POST | `/register/empresa` | Registrar empresa | No |
| POST | `/login` | Login | No |
| GET | `/verify` | Verificar token | Sí |
| GET | `/profile` | Ver perfil | Sí |
| PUT | `/profile` | Actualizar perfil | Sí |
| POST | `/change-password` | Cambiar contraseña | Sí |

### Subastas (`/api/subastas`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar subastas | No |
| GET | `/:id` | Ver detalle | No |
| POST | `/` | Crear subasta | Empresa |
| PUT | `/:id` | Actualizar subasta | Empresa |
| POST | `/:id/cancel` | Cancelar subasta | Empresa |
| POST | `/:id/pujas` | Crear puja | Usuario |
| GET | `/:id/pujas` | Ver pujas | No |

### Billetera (`/api/wallet`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/saldo` | Ver saldo | Sí |
| POST | `/depositar` | Depositar | Sí |
| POST | `/retirar` | Retirar | Sí |
| GET | `/transacciones` | Ver historial | Sí |

---

## 🚀 PRÓXIMOS PASOS

### Para integrar con tu frontend:

1. **Actualiza `auth.js`** para usar el backend:
   ```javascript
   const API_URL = 'http://localhost:4000/api';
   
   async function login(username, password) {
       const response = await fetch(`${API_URL}/auth/login`, {
           method: 'POST',
           headers: {  'Content-Type': 'application/json' },
           body: JSON.stringify({ username, password })
       });
       const data = await response.json();
       if (data.token) {
           localStorage.setItem('token', data.token);
           localStorage.setItem('user', JSON.stringify(data.account));
       }
       return data;
   }
   ```

2. **Reemplaza localStorage** con llamadas al API

3. **Usa el token JWT** en todas las peticiones autenticadas:
   ```javascript
   const token = localStorage.getItem('token');
   fetch(url, {
       headers: {
           'Authorization': `Bearer ${token}`
       }
   })
   ```

---

## 📝 COMANDOS ÚTILES

```powershell
cd backend-full

# Iniciar servidor en desarrollo (auto-reload)
npm run dev

# Iniciar en producción
npm start

# Recrear base de datos (⚠️ BORRA TODOS LOS DATOS)
npm run init-db

# Poblar con datos de prueba
npm run seed

# Crear la base de datos (primera vez)
npm run create-db
```

---

## 🔧 TROUBLESHOOTING

### El servidor no inicia
1. Verifica que PostgreSQL esté corriendo:
   ```powershell
   Get-Service postgresql-x64-18
   ```
2. Si está detenido, inícialo:
   ```powershell
   Start-Service postgresql-x64-18
   ```

### Error de conexión a la BD
- Verifica las credenciales en `.env`
- Asegúrate que la base de datos `nexos_db` existe

### Puerto 4000 ocupado
- Cambia el puerto en `.env`:
  ```env
  PORT=5000
  ```

### Olvidé la contraseña del admin
- Ejecuta `npm run init-db` (⚠️ esto resetea todo)

---

## 📖 DOCUMENTACIÓN

- `backend-full/README.md` - Documentación completa
- `backend-full/IMPLEMENTACION_COMPLETA.md` - Guía detallada
- `backend-full/INSTALACION_POSTGRESQL.md` - Instalación de PostgreSQL

---

## ✨ LO QUE FUNCIONA

✅ Autenticación JWT completa
✅ Registro de usuarios y empresas
✅ Sistema de subastas
✅ Sistema de pujas con validación
✅ Billetera virtual
✅ Historial de transacciones
✅ PostgreSQL 18 corriendo
✅ 11 tablas con relaciones
✅ Usuario admin creado
✅ Seguridad implementada
✅ Rate limiting configurado
✅ CORS habilitado
✅ Validación de datos

---

## 🎯 ESTADO: ✅ BACKEND FUNCIONAL

El backend está **completamente operativo** y listo para usarse.

**Servidor corriendo en:** http://localhost:4000
**Health check:** http://localhost:4000/api/health

¡Ya puedes empezar a hacer peticiones al API! 🚀
