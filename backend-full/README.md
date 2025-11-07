# Backend NEXOS - Sistema Completo

Backend completo para la plataforma NEXOS con PostgreSQL, Node.js y Express.

## 🚀 Características

- ✅ Autenticación JWT para usuarios y empresas
- ✅ Sistema de billetera virtual con transacciones
- ✅ Subastas con sistema de pujas
- ✅ Rifas con venta de boletos
- ✅ Marketplace de productos
- ✅ Sistema de causas y donaciones
- ✅ Aprobación de empresas por administrador
- ✅ Recuperación de contraseñas
- ✅ Integración con Mercado Pago

## 📋 Requisitos Previos

- Node.js 16+ 
- PostgreSQL 12+
- npm o yarn

## 🔧 Instalación

### 1. Instalar dependencias

```bash
cd backend-full
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura tus variables:

```bash
copy .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nexos_db
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secret_key_muy_segura

# Mercado Pago
MP_ACCESS_TOKEN=tu_access_token
MP_PUBLIC_KEY=tu_public_key
```

### 3. Crear base de datos PostgreSQL

Abre PostgreSQL y crea la base de datos:

```sql
CREATE DATABASE nexos_db;
```

### 4. Inicializar base de datos

Este comando creará las tablas y el usuario admin:

```bash
npm run init-db
```

Credenciales del admin:
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANTE**: Cambia la contraseña del admin después del primer login.

### 5. Poblar con datos de prueba (opcional)

```bash
npm run seed
```

Esto creará:
- 3 usuarios de prueba
- 3 empresas de prueba
- Subastas activas
- Rifas con boletos
- Productos en venta
- Causas sociales
- Donaciones

## 🏃 Ejecutar el Servidor

### Modo desarrollo (con auto-reload)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor estará disponible en: `http://localhost:4000`

## 📚 Documentación de API

### Endpoints Disponibles

#### 🔐 Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register/user` | Registrar usuario | No |
| POST | `/register/empresa` | Registrar empresa | No |
| POST | `/login` | Iniciar sesión | No |
| GET | `/verify` | Verificar token | Sí |
| GET | `/profile` | Obtener perfil | Sí |
| PUT | `/profile` | Actualizar perfil | Sí |
| POST | `/change-password` | Cambiar contraseña | Sí |

#### 🔨 Subastas (`/api/subastas`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar subastas | No |
| GET | `/:id` | Detalle subasta | No |
| POST | `/` | Crear subasta | Empresa |
| PUT | `/:id` | Actualizar subasta | Empresa |
| POST | `/:id/cancel` | Cancelar subasta | Empresa |
| POST | `/:id/finalizar` | Finalizar subasta | Empresa |
| GET | `/:id/pujas` | Obtener pujas | No |
| POST | `/:subasta_id/pujas` | Crear puja | Usuario |
| GET | `/user/pujas` | Mis pujas | Usuario |

#### 💰 Billetera (`/api/wallet`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/saldo` | Obtener saldo | Sí |
| POST | `/depositar` | Depositar fondos | Sí |
| POST | `/retirar` | Retirar fondos | Sí |
| GET | `/transacciones` | Historial | Sí |
| GET | `/transacciones/:id` | Detalle transacción | Sí |

### Ejemplos de Uso

#### Registrar Usuario

```bash
curl -X POST http://localhost:4000/api/auth/register/user \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nuevo_usuario",
    "password": "password123",
    "email": "usuario@example.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rut": "12345678-9"
  }'
```

#### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan_perez",
    "password": "password123"
  }'
```

Respuesta:
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "usuario",
  "account": { ... }
}
```

#### Crear Puja (requiere autenticación)

```bash
curl -X POST http://localhost:4000/api/subastas/{subasta_id}/pujas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "monto": 520000,
    "automatica": false
  }'
```

## 📁 Estructura del Proyecto

```
backend-full/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de Sequelize
│   ├── controllers/
│   │   ├── authController.js    # Controlador de autenticación
│   │   ├── subastasController.js # Controlador de subastas
│   │   ├── pujasController.js   # Controlador de pujas
│   │   └── walletController.js  # Controlador de billetera
│   ├── middleware/
│   │   ├── auth.js              # Middleware de autenticación
│   │   ├── validate.js          # Middleware de validación
│   │   └── errorHandler.js      # Manejo de errores
│   ├── models/
│   │   ├── index.js             # Exporta todos los modelos
│   │   ├── User.js              # Modelo de usuario
│   │   ├── Empresa.js           # Modelo de empresa
│   │   ├── Subasta.js           # Modelo de subasta
│   │   ├── Puja.js              # Modelo de puja
│   │   ├── Rifa.js              # Modelo de rifa
│   │   ├── BoletoRifa.js        # Modelo de boleto
│   │   ├── Producto.js          # Modelo de producto
│   │   ├── Causa.js             # Modelo de causa
│   │   ├── Donacion.js          # Modelo de donación
│   │   ├── Transaccion.js       # Modelo de transacción
│   │   └── PasswordReset.js     # Modelo de reset password
│   ├── routes/
│   │   ├── auth.js              # Rutas de autenticación
│   │   ├── subastas.js          # Rutas de subastas
│   │   └── wallet.js            # Rutas de billetera
│   ├── services/
│   │   └── walletService.js     # Lógica de billetera
│   └── server.js                # Punto de entrada
├── scripts/
│   ├── initDatabase.js          # Script de inicialización
│   └── seedDatabase.js          # Script de datos de prueba
├── .env.example                 # Ejemplo de variables de entorno
├── package.json
└── README.md
```

## 🗄️ Modelos de Base de Datos

### User (Usuarios)
- Campos: username, password, email, nombre, apellido, rut, saldo, role
- Relaciones: Pujas, BoletoRifa, Donaciones, Transacciones

### Empresa (Empresas)
- Campos: username, password, email, razon_social, rut, estado, saldo
- Relaciones: Subastas, Rifas, Productos, Causas, Transacciones

### Subasta
- Campos: titulo, precio_inicial, precio_actual, fecha_fin, estado
- Relaciones: Empresa, Pujas, Ganador

### Puja
- Campos: subasta_id, usuario_id, monto, estado
- Relaciones: Subasta, Usuario

### Rifa
- Campos: titulo, precio_boleto, boletos_totales, fecha_sorteo, estado
- Relaciones: Empresa, Boletos, Ganador

### Producto
- Campos: nombre, precio, stock, categoria, estado
- Relaciones: Empresa

### Causa
- Campos: titulo, meta_recaudacion, monto_recaudado, estado
- Relaciones: Empresa, Donaciones

### Transaccion (Ledger)
- Campos: tipo, monto, saldo_anterior, saldo_final, estado
- Relaciones: Usuario o Empresa

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Autenticación JWT con tokens de 7 días
- Rate limiting (100 requests/15 min)
- Helmet para headers de seguridad
- Validación de inputs con express-validator
- CORS configurado

## 🛠️ Scripts Disponibles

```bash
npm start         # Iniciar servidor en producción
npm run dev       # Iniciar en modo desarrollo con nodemon
npm run init-db   # Inicializar base de datos y crear admin
npm run seed      # Poblar con datos de prueba
```

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL

1. Verifica que PostgreSQL esté corriendo
2. Confirma las credenciales en `.env`
3. Asegúrate que la base de datos existe

### Error "JWT_SECRET is not defined"

Asegúrate de tener el archivo `.env` con todas las variables necesarias.

### Puerto 4000 ya en uso

Cambia el puerto en `.env`:
```env
PORT=5000
```

## 📝 Próximos Pasos

### Funcionalidades Pendientes

- [ ] Controladores y rutas de Rifas
- [ ] Controladores y rutas de Productos
- [ ] Controladores y rutas de Causas
- [ ] Panel de administración (aprobar empresas, password resets)
- [ ] Sistema de notificaciones por email
- [ ] Upload de imágenes con multer
- [ ] Integración completa con Mercado Pago
- [ ] WebSockets para notificaciones en tiempo real
- [ ] Sistema de rating y reviews
- [ ] Estadísticas y reportes

## 📞 Soporte

Para dudas o problemas, contacta al equipo de desarrollo.

## 📄 Licencia

Este proyecto es parte del sistema NEXOS.
