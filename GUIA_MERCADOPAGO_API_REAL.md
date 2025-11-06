# 🚀 Guía de Configuración - Mercado Pago API REAL (Modo Sandbox)

## ⚠️ IMPORTANTE: MODO SANDBOX (SIN DINERO REAL)

Esta configuración usa la **API REAL de Mercado Pago** pero en **MODO SANDBOX**.
- ✅ Checkout real de Mercado Pago (la página oficial)
- ✅ Flujo completo de pago auténtico
- ❌ **NO usa dinero real**
- ✅ Tarjetas de prueba para simular transacciones

---

## 📋 Paso 1: Obtener Credenciales de Mercado Pago

### 1.1 Crear cuenta de desarrollador (si no tienes)
1. Ve a https://www.mercadopago.cl/developers
2. Inicia sesión con tu cuenta de Mercado Pago
3. Si no tienes cuenta, créala (es gratis)

### 1.2 Obtener credenciales de PRUEBA (Sandbox)
1. Ve a https://www.mercadopago.cl/developers/panel/app
2. Crea una aplicación o selecciona una existente
3. Ve a la sección **"Credenciales"**
4. Selecciona **"Credenciales de prueba"** (muy importante)
5. Copia:
   - **Public Key** (comienza con `TEST-...`)
   - **Access Token** (comienza con `TEST-...`)

### 1.3 Configurar credenciales en el proyecto

Edita el archivo `backend/.env`:
```env
MP_ACCESS_TOKEN=TEST-TU-ACCESS-TOKEN-AQUI
MP_PUBLIC_KEY=TEST-TU-PUBLIC-KEY-AQUI
```

Edita el archivo `mercadopago.js` (línea 10):
```javascript
publicKey: 'TEST-TU-PUBLIC-KEY-AQUI',
```

---

## 📦 Paso 2: Instalar Dependencias del Backend

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
# Ir a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Volver a la raíz
cd ..
```

Esto instalará:
- `express` - Servidor web
- `mercadopago` - SDK oficial de Mercado Pago
- `cors` - Para permitir peticiones desde el frontend
- `dotenv` - Para variables de entorno

---

## 🚀 Paso 3: Iniciar el Backend

En PowerShell (desde la carpeta backend):

```powershell
cd backend
npm start
```

Deberías ver algo como:
```
============================================================
🚀 Servidor backend iniciado
🌐 URL: http://localhost:3000
🔐 Modo: SANDBOX (Sin dinero real)
💳 Mercado Pago: Configurado
============================================================
```

**IMPORTANTE:** Deja esta terminal abierta mientras uses la aplicación.

---

## 🌐 Paso 4: Iniciar el Frontend

En otra terminal de PowerShell (desde la raíz del proyecto):

### Opción A: Con Live Server (VS Code)
1. Abre el proyecto en VS Code
2. Click derecho en `index.html`
3. Selecciona "Open with Live Server"

### Opción B: Con Python
```powershell
python -m http.server 5500
```

### Opción C: Con Node.js
```powershell
npx http-server -p 5500
```

El frontend debería estar en: http://localhost:5500

---

## 💳 Paso 5: Probar Pagos con Tarjetas de Prueba

Mercado Pago proporciona tarjetas de prueba para simular diferentes escenarios:

### ✅ Tarjetas que APRUEBAN el pago:

| Tarjeta | Número | CVV | Fecha |
|---------|--------|-----|-------|
| Mastercard | 5031 7557 3453 0604 | 123 | 11/25 |
| Visa | 4509 9535 6623 3704 | 123 | 11/25 |

### ❌ Tarjetas que RECHAZAN el pago:

| Tarjeta | Número | CVV | Fecha | Motivo |
|---------|--------|-----|-------|--------|
| Mastercard | 5031 4332 1540 6351 | 123 | 11/25 | Fondos insuficientes |
| Visa | 4168 8188 4444 7115 | 123 | 11/25 | Rechazado por el banco |

### 📝 Datos adicionales para completar el formulario:
- **Nombre del titular:** APRO (para aprobar) o OTRE (para rechazar)
- **Email:** test_user_123456789@testuser.com
- **Documento:** 12345678

Más tarjetas de prueba en: https://www.mercadopago.cl/developers/es/docs/testing/test-cards

---

## 🔄 Flujo de Pago Completo

1. **Usuario hace una compra** (depósito, rifa o producto)
2. **Sistema crea preferencia** en el backend
3. **Mercado Pago genera link de pago**
4. **Usuario es redirigido** al checkout REAL de Mercado Pago
5. **Usuario completa el pago** con tarjeta de prueba
6. **Mercado Pago procesa** la transacción (simulada)
7. **Usuario es redirigido de vuelta** a la aplicación
8. **Sistema procesa** el resultado del pago

---

## ✅ Verificar que Todo Funciona

### 1. Backend funcionando:
Abre en tu navegador: http://localhost:3000/api/health

Deberías ver:
```json
{
  "status": "OK",
  "mode": "SANDBOX",
  "message": "Backend de Mercado Pago funcionando (SIN DINERO REAL)",
  "timestamp": "..."
}
```

### 2. Frontend funcionando:
Abre: http://localhost:5500

### 3. Probar un depósito:
1. Inicia sesión en la aplicación
2. Ve a "Mi Perfil"
3. En "Billetera Digital", ingresa un monto (ej: 10000)
4. Click en "Continuar con Mercado Pago"
5. Selecciona "Pagar con Mercado Pago" (Checkout Pro)
6. **Te redirigirá al checkout REAL de Mercado Pago** 🎉
7. Usa una tarjeta de prueba para completar el pago
8. Serás redirigido de vuelta a la aplicación

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to backend"
- ✅ Verifica que el backend esté ejecutándose (`npm start` en la carpeta backend)
- ✅ Verifica que esté en el puerto 3000: http://localhost:3000/api/health

### Error: "Invalid credentials"
- ✅ Verifica que uses credenciales de PRUEBA (comienzan con TEST-)
- ✅ Verifica que estén correctamente copiadas en `.env` y `mercadopago.js`

### Error: "CORS policy"
- ✅ Verifica que `FRONTEND_URL` en `.env` coincida con tu URL del frontend
- ✅ Por defecto es `http://localhost:5500`

### No se abre el checkout de Mercado Pago
- ✅ Verifica que el navegador no bloqueó el popup
- ✅ Revisa la consola del navegador (F12) para ver errores

---

## 🔐 Pasar a Producción (Dinero Real)

Cuando estés listo para usar dinero real:

1. **Obtén credenciales de PRODUCCIÓN** (sin TEST-):
   - Ve a https://www.mercadopago.cl/developers/panel/app
   - Selecciona "Credenciales de producción"

2. **Reemplaza en `.env`:**
   ```env
   MP_ACCESS_TOKEN=APP_USR-...  (sin TEST)
   MP_PUBLIC_KEY=APP_USR-...    (sin TEST)
   ```

3. **Reemplaza en `mercadopago.js`:**
   ```javascript
   publicKey: 'APP_USR-...',  // Sin TEST
   ```

4. **Configura webhook en Mercado Pago:**
   - URL: `https://tu-dominio.com/api/webhook`
   - Eventos: Pagos

5. **¡Listo!** Ahora procesarás pagos reales

---

## 📚 Recursos Adicionales

- Documentación oficial: https://www.mercadopago.cl/developers/es/docs
- Tarjetas de prueba: https://www.mercadopago.cl/developers/es/docs/testing/test-cards
- Panel de desarrolladores: https://www.mercadopago.cl/developers/panel
- Soporte: https://www.mercadopago.cl/developers/es/support

---

## 📝 Notas Importantes

- ✅ **Sandbox es 100% seguro** - No se cobra dinero real
- ✅ **Usa SIEMPRE credenciales TEST** para desarrollo
- ✅ **NO compartas tu Access Token** - Es confidencial
- ✅ **Backend es necesario** - No se puede usar solo frontend en producción
- ✅ **Webhooks son opcionales** para desarrollo, obligatorios para producción

---

¿Necesitas ayuda? Revisa los logs del backend (terminal donde ejecutaste `npm start`)
