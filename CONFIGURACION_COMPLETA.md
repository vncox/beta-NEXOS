# ✅ Sistema Mercado Pago Configurado

## 🎉 ¿Qué tenemos ahora?

### ✅ API REAL de Mercado Pago
- Ya NO usamos páginas simuladas
- Ahora usas el **checkout oficial de Mercado Pago**
- Es la misma página donde compran tus clientes normalmente
- **MODO SANDBOX**: NO usa dinero real, solo pruebas

### 🏗️ Arquitectura del Sistema

```
┌─────────────────┐
│   FRONTEND      │
│  (Tu Sitio)     │
│                 │
│ - index.html    │
│ - perfil.html   │
│ - rifas.html    │
│ - ventas.html   │
└────────┬────────┘
         │
         │ 1. Usuario hace click en "Pagar"
         ▼
┌─────────────────┐
│ mercadopago.js  │
│  (Tu Código)    │
│                 │
│ - Crea datos    │
│ - Llama backend │
└────────┬────────┘
         │
         │ 2. POST /api/create-preference
         ▼
┌─────────────────┐
│    BACKEND      │
│  (Node.js)      │
│                 │
│ - Recibe datos  │
│ - Llama API MP  │
└────────┬────────┘
         │
         │ 3. Crea preferencia
         ▼
┌─────────────────┐
│  MERCADO PAGO   │
│   (API Real)    │
│                 │
│ - Genera link   │
│ - Devuelve URL  │
└────────┬────────┘
         │
         │ 4. URL de pago
         ▼
┌─────────────────┐
│    CHECKOUT     │
│  Mercado Pago   │
│   (Página MP)   │
│                 │
│ - Usuario paga  │
│ - Procesa pago  │
└────────┬────────┘
         │
         │ 5. Redirige de vuelta
         ▼
┌─────────────────┐
│  RESULTADO      │
│                 │
│ - pago-exitoso  │
│ - pago-fallido  │
│ - pago-pendiente│
└─────────────────┘
```

## 📁 Archivos Creados

### Backend
- `backend/package.json` - Dependencias
- `backend/.env` - Credenciales (SANDBOX)
- `backend/server.js` - Servidor Node.js con API

### Frontend  
- `pago-exitoso.html` - Página de pago aprobado
- `pago-fallido.html` - Página de pago rechazado
- `pago-pendiente.html` - Página de pago en proceso

### Documentación
- `GUIA_MERCADOPAGO_API_REAL.md` - Guía completa de configuración
- `.gitignore` - Protege credenciales

### Actualizado
- `mercadopago.js` - Ahora llama al backend real

## 🚀 Estado Actual

### ✅ Backend: FUNCIONANDO
```
🔧 Mercado Pago configurado en modo SANDBOX
💡 Las transacciones NO usarán dinero real
🌐 URL: http://localhost:3000
```

### 📝 Endpoints Disponibles
- `POST /api/create-preference` - Crear preferencia de pago
- `POST /api/webhook` - Recibir notificaciones de MP
- `GET /api/payment/:id` - Obtener info de un pago
- `GET /api/health` - Verificar estado

## 🔧 Próximos Pasos

### 1. Abrir el frontend
Abre tu proyecto con Live Server en VS Code o ejecuta:
```powershell
python -m http.server 5500
```

### 2. Probar un pago
1. Inicia sesión en tu aplicación
2. Ve a "Mi Perfil"
3. Ingresa un monto en "Depositar Dinero"
4. Click en "Continuar con Mercado Pago"
5. **TE REDIRIGIRÁ AL CHECKOUT OFICIAL DE MERCADO PAGO** 🎉

### 3. Usar tarjetas de prueba

#### ✅ Tarjetas que APRUEBAN:
- **Visa**: 4509 9535 6623 3704
- **Mastercard**: 5031 7557 3453 0604
- **CVV**: 123
- **Fecha**: 11/25
- **Nombre**: APRO

#### ❌ Tarjetas que RECHAZAN:
- **Visa**: 4168 8188 4444 7115
- **CVV**: 123
- **Fecha**: 11/25
- **Nombre**: OTRE

Más tarjetas: https://www.mercadopago.cl/developers/es/docs/testing/test-cards

## ⚠️ IMPORTANTE

### Mantén el backend ejecutándose
El backend DEBE estar ejecutándose todo el tiempo que uses la aplicación:
```powershell
cd backend
node server.js
```

### Modo SANDBOX (Sin dinero real)
- ✅ Checkout real de Mercado Pago
- ✅ Flujo completo de pago
- ❌ NO cobra dinero real
- ✅ Tarjetas de prueba

### Para usar dinero REAL
Solo cuando estés listo para producción:
1. Obtén credenciales de PRODUCCIÓN (sin TEST-)
2. Reemplázalas en `.env` y `mercadopago.js`
3. Despliega tu backend en un servidor (no localhost)

## 🎯 Diferencia con la versión anterior

### ❌ ANTES (Simulado):
- Página falsa de "Mercado Pago"
- No se conectaba con MP
- Todo era simulación local

### ✅ AHORA (API Real):
- Checkout REAL de Mercado Pago
- API oficial conectada
- Mismo flujo que en producción
- Solo modo SANDBOX (sin dinero)

## 🐛 Solución de Problemas

### Backend no inicia
```powershell
cd backend
npm install
node server.js
```

### Frontend no se conecta
Verifica que la URL en `mercadopago.js` coincida:
```javascript
backendUrl: 'http://localhost:3000'
```

### CORS error
Verifica `.env`:
```
FRONTEND_URL=http://localhost:5500
```

## 📞 Necesitas Ayuda?

1. Revisa los logs del backend (terminal)
2. Revisa la consola del navegador (F12)
3. Verifica que ambos servidores estén ejecutándose
4. Consulta `GUIA_MERCADOPAGO_API_REAL.md`

---

**🎉 ¡Todo configurado! Ahora estás usando la API REAL de Mercado Pago en modo SANDBOX**
